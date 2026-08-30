import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trip } from '../types';
import { useAuth } from '../hooks/AuthContext';
import { useTrips } from '../hooks/useTrips';
import { db } from '../lib/firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { MapPin, Battery, Zap, Clock, ChevronDown, ChevronUp, Trash2, Edit3, X, Route, CloudSun, Thermometer, Users } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export function HistoryTab() {
  const { user } = useAuth();
  const { trips, loading } = useTrips(user?.uid);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };
  
  const toggleCluster = (ids: string[], selectAll: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      ids.forEach(id => {
        if (selectAll) newSet.add(id);
        else newSet.delete(id);
      });
      return newSet;
    });
  };

  if (loading) {
    return <div className="text-center py-10 text-slate-400">Loading trips...</div>;
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-20">
        <MapPin className="h-12 w-12 mx-auto text-slate-500 mb-4" />
        <h3 className="text-lg font-bold text-white">No trips logged yet</h3>
        <p className="text-white mt-2 text-sm">Start your first trip from the Log Trip tab.</p>
      </div>
    );
  }

  // Calculate historical averages by category
  const categoryStats = trips.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = { dist: 0, energy: 0 };
    acc[t.category].dist += t.distanceKm;
    acc[t.category].energy += t.estKWhUsed;
    return acc;
  }, {} as Record<string, { dist: number; energy: number }>);

  const categoryAverages = Object.keys(categoryStats).reduce((acc, cat) => {
    const { dist, energy } = categoryStats[cat];
    acc[cat] = dist > 0 ? Number(((energy / dist) * 100).toFixed(1)) : 0;
    return acc;
  }, {} as Record<string, number>);

  // Cluster road trips
  type GroupedTrip = { isCluster: false, trip: Trip } | { isCluster: true, name: string, trips: Trip[] };
  
  const groupedTrips: GroupedTrip[] = [];
  let currentCluster: Trip[] = [];
  let currentClusterName = '';
  
  // Sort trips chronologically for clustering, assuming useTrips returns descending
  // Wait, if it's descending (newest first), consecutive means same cluster if adjacent in array
  trips.forEach(trip => {
    if (trip.tripType === 'Road Trip' && trip.roadTripName) {
      if (currentClusterName === trip.roadTripName) {
        currentCluster.push(trip);
      } else {
        if (currentCluster.length > 0) {
          groupedTrips.push({ isCluster: true, name: currentClusterName, trips: currentCluster });
        }
        currentCluster = [trip];
        currentClusterName = trip.roadTripName;
      }
    } else {
      if (currentCluster.length > 0) {
        groupedTrips.push({ isCluster: true, name: currentClusterName, trips: currentCluster });
        currentCluster = [];
        currentClusterName = '';
      }
      groupedTrips.push({ isCluster: false, trip });
    }
  });
  if (currentCluster.length > 0) {
    groupedTrips.push({ isCluster: true, name: currentClusterName, trips: currentCluster });
  }

  return (
    <div className="space-y-4 pb-4 animate-in fade-in duration-500 glass-card p-6 flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-bold text-white uppercase tracking-widest">Trip History</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setSelectionMode(!selectionMode);
            setSelectedIds(new Set());
          }}
          className="text-[10px] h-7"
        >
          {selectionMode ? 'Cancel Selection' : 'Select Trips'}
        </Button>
      </div>
      <div className="flex-1 space-y-4">
        {groupedTrips.map((item, idx) => {
          if (item.isCluster) {
            return <RoadTripCard 
               key={`cluster-${idx}`} 
               cluster={item} 
               editingId={editingId} 
               setEditingId={setEditingId} 
               categoryAverages={categoryAverages}
               selectionMode={selectionMode}
               selectedIds={selectedIds}
               toggleSelection={toggleSelection}
               toggleCluster={toggleCluster}
            />;
          } else {
            const singleTrip = item as { isCluster: false, trip: Trip };
            return (
              <TripCard 
                key={singleTrip.trip.id} 
                trip={singleTrip.trip} 
                isEditing={editingId === singleTrip.trip.id}
                onEdit={() => setEditingId(singleTrip.trip.id!)}
                onCancelEdit={() => setEditingId(null)}
                categoryAvg={categoryAverages[singleTrip.trip.category]}
              />
            );
          }
        })}
      </div>
      
      {selectionMode && selectedIds.size > 0 && (
        <div className="sticky bottom-0 left-0 right-0 mt-4 p-4 glass-card bg-black/80 border-t border-red-500/30 flex items-center justify-between animate-in slide-in-from-bottom-4">
          <span className="text-sm font-bold text-white">{selectedIds.size} trips selected</span>
          <Button 
            variant="danger" 
            onClick={async () => {
              if (!showBulkDeleteConfirm) {
                setShowBulkDeleteConfirm(true);
                setTimeout(() => setShowBulkDeleteConfirm(false), 3000);
                return;
              }
              setBulkDeleting(true);
              try {
                for (const id of Array.from(selectedIds as Set<string>)) {
                  await deleteDoc(doc(db, 'trips', id));
                }
                setSelectedIds(new Set());
                setSelectionMode(false);
                setShowBulkDeleteConfirm(false);
              } catch (err) {
                console.error('Bulk delete failed', err);
              }
              setBulkDeleting(false);
            }}
            disabled={bulkDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {bulkDeleting ? 'Deleting...' : showBulkDeleteConfirm ? 'Confirm Delete' : 'Delete Selected'}
          </Button>
        </div>
      )}
    </div>
  );
}

const RoadTripCard: React.FC<{ cluster: { isCluster?: boolean, name: string, trips: Trip[] }, editingId: string | null, setEditingId: (id: string | null) => void, categoryAverages: Record<string, number>, selectionMode?: boolean, selectedIds?: Set<string>, toggleSelection?: (id: string) => void, toggleCluster?: (ids: string[], selectAll: boolean) => void }> = ({ cluster, editingId, setEditingId, categoryAverages, selectionMode, selectedIds, toggleSelection, toggleCluster }) => {
  const [expanded, setExpanded] = useState(false);
  
  const totalDistance = cluster.trips.reduce((acc, t) => acc + t.distanceKm, 0);
  const totalEnergy = cluster.trips.reduce((acc, t) => acc + t.estKWhUsed, 0);
  const avgEfficiency = totalDistance > 0 ? Number(((totalEnergy / totalDistance) * 100).toFixed(1)) : 0;
  
  // Calculate average of expected efficiency based on category mix
  let expectedEnergy = 0;
  cluster.trips.forEach(t => {
    const catAvg = categoryAverages[t.category] || 15;
    expectedEnergy += (catAvg * t.distanceKm) / 100;
  });
  const expectedEfficiency = totalDistance > 0 ? Number(((expectedEnergy / totalDistance) * 100).toFixed(1)) : 0;
  
  let effColor = 'text-white';
  if (expectedEfficiency > 0) {
    if (avgEfficiency < expectedEfficiency) effColor = 'text-green-400';
    else if (avgEfficiency > expectedEfficiency) effColor = 'text-red-400';
  }

  // Calculate road trip true range cost if available
  let totalRangeDiff = 0;
  let totalEstRangeUsed = 0;
  let hasRangeDiff = false;
  cluster.trips.forEach(t => {
    if (t.estRangeUsed && t.estRangeUsed > 0) {
      const diff = (t.rangeDiffKm !== undefined && t.rangeDiffKm !== null) ? t.rangeDiffKm : (t.distanceKm - t.estRangeUsed);
      totalRangeDiff += diff;
      totalEstRangeUsed += t.estRangeUsed;
      hasRangeDiff = true;
    }
  });
  const totalRangeAccuracy = totalEstRangeUsed > 0 ? Number(((totalRangeDiff / totalEstRangeUsed) * 100).toFixed(1)) : 0;

  const startTime = cluster.trips[cluster.trips.length - 1].startTime;
  const endTime = cluster.trips[0].endTime;
  
  const totalDuration = cluster.trips.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
  const avgSpeed = totalDuration > 0 ? Number((totalDistance / (totalDuration / 60)).toFixed(1)) : null;

  return (
    <div className="p-4 rounded-xl bg-black/40 border border-[#00D1FF]/30 transition-all shadow-[0_0_15px_rgba(0,209,255,0.05)]">
      <div className="flex justify-between items-start cursor-pointer" onClick={(e) => {
        if (selectionMode && toggleCluster) {
          const allSelected = cluster.trips.every(t => selectedIds?.has(t.id!));
          toggleCluster(cluster.trips.map(t => t.id!), !allSelected);
          return;
        }
        setExpanded(!expanded);
      }}>
        {selectionMode && selectedIds && toggleSelection && (
          <div className="mr-3 mt-1" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-black/20 text-red-500" checked={cluster.trips.every(t => selectedIds.has(t.id!))} onChange={() => {
              if (toggleCluster) {
                const allSelected = cluster.trips.every(t => selectedIds?.has(t.id!));
                toggleCluster(cluster.trips.map(t => t.id!), !allSelected);
              }
            }} />
          </div>
        )}
        <div>
          <div className="text-sm font-bold text-[#00D1FF] mb-1 flex items-center gap-1.5 uppercase tracking-widest">
            <Route className="h-4 w-4" /> {cluster.name}
          </div>
          <div className="text-[10px] text-white uppercase tracking-widest flex items-center gap-1 flex-wrap">
            {format(startTime, 'MMM d')} - {format(endTime, 'MMM d, yyyy')} • {cluster.trips.length} Legs • {totalDistance.toFixed(1)} km
            {totalDuration > 0 && ` • ${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`}
            {avgSpeed && ` • ${avgSpeed} km/h`}
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div className={`text-sm font-bold ${effColor}`}>
            {avgEfficiency} <span className="text-[10px] opacity-60">avg kWh/100km</span>
          </div>
          {hasRangeDiff && (
            <div className={`text-[10px] font-bold ${totalRangeDiff > 0 ? 'text-green-400' : totalRangeDiff < 0 ? 'text-red-400' : 'text-white'}`}>
              {totalRangeDiff === 0 ? 'Estimate = Odometer Distance' : `${Number(totalEstRangeUsed.toFixed(1))} km: a ${Math.abs(Number(totalRangeDiff.toFixed(1)))} km (${Math.abs(totalRangeAccuracy)}%) ${totalRangeDiff < 0 ? 'overestimate' : 'underestimate'}`}
            </div>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#00D1FF]/20 animate-in fade-in slide-in-from-top-2 relative z-10">
          <div className="absolute left-[14px] top-10 bottom-16 w-[2px] bg-[#00D1FF]/30 -z-10"></div>
          <div className="space-y-3 pl-10">
            {cluster.trips.map(trip => (
              <div key={trip.id} className="relative">
                <div className="absolute -left-[30px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#00D1FF]/60 ring-4 ring-[#00D1FF]/10 z-20"></div>
                <TripCard 
                  trip={trip} 
                  isEditing={editingId === trip.id}
                  onEdit={() => setEditingId(trip.id!)}
                  onCancelEdit={() => setEditingId(null)}
                  categoryAvg={categoryAverages[trip.category]}
                  selectionMode={selectionMode}
                  selectedIds={selectedIds}
                  toggleSelection={toggleSelection}
                />
              </div>
            ))}
          </div>
          <div className="pt-3 flex justify-end relative z-20">
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] h-7 border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10"
              onClick={(e) => {
                e.stopPropagation();
                localStorage.setItem('electron_last_trip_type', 'Road Trip');
                localStorage.setItem('electron_last_roadtrip_name', cluster.name);
                window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'log' }));
              }}
            >
              <Route className="h-3 w-3 mr-1.5" />
              Resume This Road Trip
            </Button>
          </div>
        </div>
      )}
      
      {!expanded && (
        <div className="flex justify-center mt-2 -mb-2">
          <ChevronDown className="h-4 w-4 text-[#00D1FF]/50" />
        </div>
      )}
    </div>
  );
}

function TripCard({ trip, isEditing, onEdit, onCancelEdit, categoryAvg, selectionMode, selectedIds, toggleSelection }: { trip: Trip, isEditing: boolean, onEdit: () => void, onCancelEdit: () => void, categoryAvg?: number, key?: React.Key, selectionMode?: boolean, selectedIds?: Set<string>, toggleSelection?: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  
  // Edit state
  const [editData, setEditData] = useState({
    startOdo: trip.startOdo.toString(),
    endOdo: trip.endOdo.toString(),
    startSOC: trip.startSOC.toString(),
    endSOC: trip.endSOC.toString(),
    startEstRange: trip.startEstRange?.toString() || '',
    endEstRange: trip.endEstRange?.toString() || '',
    category: trip.category
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editError, setEditError] = useState('');

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
      return;
    }
    try {
      await deleteDoc(doc(db, 'trips', trip.id!));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleSave = async () => {
    const sO = parseFloat(editData.startOdo);
    const eO = parseFloat(editData.endOdo);
    const sS = parseInt(editData.startSOC, 10);
    const eS = parseInt(editData.endSOC, 10);
    const sEst = editData.startEstRange ? parseInt(editData.startEstRange, 10) : null;
    const eEst = editData.endEstRange ? parseInt(editData.endEstRange, 10) : null;
    
    if (isNaN(sO) || isNaN(eO) || eO < sO) return setEditError("Invalid odometer values");
    if (isNaN(sS) || isNaN(eS) || sS < 0 || eS < 0 || sS > 100 || eS > 100) return setEditError("Invalid SOC values");
    if ((sEst !== null && (isNaN(sEst) || sEst < 0)) || (eEst !== null && (isNaN(eEst) || eEst < 0))) return setEditError("Invalid Est. Range values");

    setEditError('');
    setSaving(true);
    try {
      const distanceKm = Number((eO - sO).toFixed(1));
      const socUsedPct = sS - eS;
      
      let estRangeUsed: number | null = null;
      let rangeDiffKm: number | null = null;
      let rangeAccuracyPct: number | null = null;
      
      if (sEst !== null && eEst !== null) {
        estRangeUsed = sEst - eEst;
        if (estRangeUsed > 0) {
          rangeDiffKm = Number((distanceKm - estRangeUsed).toFixed(1));
          rangeAccuracyPct = Number(((rangeDiffKm / estRangeUsed) * 100).toFixed(1));
        }
      }
      
      const estKWhUsed = Number(((socUsedPct / 100) * 82.5).toFixed(2));
      const efficiencyKWhPer100Km = distanceKm > 0 ? Number(((estKWhUsed / distanceKm) * 100).toFixed(1)) : 0;
      
      let averageSpeedKph = trip.averageSpeedKph;
      if (trip.durationMinutes && trip.durationMinutes > 0) {
        averageSpeedKph = distanceKm > 0 ? Number((distanceKm / (trip.durationMinutes / 60)).toFixed(1)) : 0;
      }

      await updateDoc(doc(db, 'trips', trip.id!), {
        startOdo: sO,
        endOdo: eO,
        startSOC: sS,
        endSOC: eS,
        startEstRange: sEst,
        endEstRange: eEst,
        estRangeUsed,
        rangeDiffKm,
        rangeAccuracyPct,
        category: editData.category,
        distanceKm,
        socUsedPct,
        estKWhUsed,
        efficiencyKWhPer100Km,
        ...(averageSpeedKph !== undefined && { averageSpeedKph })
      });
      onCancelEdit();
    } catch (err) {
      console.error(err);
      setEditError("Failed to update trip");
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 rounded-xl bg-white/5 border border-[#00D1FF]/50 shadow-[0_0_15px_rgba(0,209,255,0.1)] relative">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-white text-sm uppercase tracking-widest">Edit Trip</h4>
          <button onClick={onCancelEdit} className="p-1 text-white hover:text-white rounded-full bg-white/5"><X className="h-4 w-4"/></button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-white uppercase">Start Odometer</label>
              <Input type="number" value={editData.startOdo} onChange={e => setEditData({...editData, startOdo: e.target.value})} className="h-10 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-white uppercase">End Odometer</label>
              <Input type="number" value={editData.endOdo} onChange={e => setEditData({...editData, endOdo: e.target.value})} className="h-10 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-white uppercase">Start SOC</label>
              <Input type="number" value={editData.startSOC} onChange={e => setEditData({...editData, startSOC: e.target.value})} className="h-10 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-white uppercase">End SOC</label>
              <Input type="number" value={editData.endSOC} onChange={e => setEditData({...editData, endSOC: e.target.value})} className="h-10 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-white uppercase">Start Est. Range</label>
              <Input type="number" value={editData.startEstRange} onChange={e => setEditData({...editData, startEstRange: e.target.value})} className="h-10 text-sm" placeholder="Optional" />
            </div>
            <div>
              <label className="text-xs font-bold text-white uppercase">End Est. Range</label>
              <Input type="number" value={editData.endEstRange} onChange={e => setEditData({...editData, endEstRange: e.target.value})} className="h-10 text-sm" placeholder="Optional" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-white uppercase mb-1 block">Category</label>
            <select 
              value={editData.category}
              onChange={e => setEditData({...editData, category: e.target.value as any})}
              className="w-full h-10 rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white focus:outline-none focus:border-[#00D1FF]"
            >
              <option value="Urban">Urban</option>
              <option value="Peri-Urban">Peri-Urban</option>
              <option value="Regional">Regional</option>
            </select>
          </div>
          {editError && <div className="text-red-400 text-xs bg-red-900/20 p-2 rounded-lg border border-red-500/20">{editError}</div>}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="danger" onClick={handleDelete} className="flex-1"><Trash2 className="h-4 w-4 mr-2"/> {showDeleteConfirm ? 'Confirm?' : 'Delete'}</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </div>
    );
  }

  const durationMs = trip.endTime.getTime() - trip.startTime.getTime();
  const hours = Math.floor(durationMs / 3600000);
  const mins = Math.round((durationMs % 3600000) / 60000);

  // Calculate dynamic colors based on historical category average
  const eff = trip.efficiencyKWhPer100Km;
  let effColor = 'text-white';
  let diffText = '';
  
  if (categoryAvg && categoryAvg > 0) {
    if (eff < categoryAvg) {
      effColor = 'text-green-400';
      const pctBetter = Math.round(((categoryAvg - eff) / categoryAvg) * 100);
      if (pctBetter > 0) diffText = `${pctBetter}% better than your ${trip.category} avg`;
    } else if (eff > categoryAvg) {
      effColor = 'text-red-400';
      const pctWorse = Math.round(((eff - categoryAvg) / categoryAvg) * 100);
      if (pctWorse > 0) diffText = `${pctWorse}% worse than your ${trip.category} avg`;
    } else {
      effColor = 'text-[#00D1FF]';
      diffText = `Matches your ${trip.category} avg`;
    }
  }

  const estRangeUsed = trip.estRangeUsed;
  const hasRangeData = estRangeUsed !== undefined && estRangeUsed !== null && estRangeUsed > 0;
  const derivedRangeDiff = hasRangeData 
    ? (trip.rangeDiffKm !== undefined && trip.rangeDiffKm !== null ? trip.rangeDiffKm : (trip.distanceKm - estRangeUsed)) 
    : null;
    
  const derivedRangeAccuracy = (trip.rangeAccuracyPct !== undefined && trip.rangeAccuracyPct !== null)
    ? trip.rangeAccuracyPct
    : (estRangeUsed > 0 && derivedRangeDiff !== null ? Number(((derivedRangeDiff / estRangeUsed) * 100).toFixed(1)) : null);

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 relative">
      <div className="flex justify-between items-start cursor-pointer" onClick={(e) => {
        if (selectionMode && toggleSelection) {
          toggleSelection(trip.id!);
          return;
        }
        if (!isEditing) setExpanded(!expanded);
      }}>
        {selectionMode && selectedIds && toggleSelection && (
          <div className="mr-3 mt-1" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-black/20 text-red-500" checked={selectedIds.has(trip.id!)} onChange={() => toggleSelection(trip.id!)} />
          </div>
        )}
        <div>
          <div className="text-sm font-bold text-white mb-1">
            {format(trip.startTime, 'MMM d, yyyy')}
          </div>
          <div className="text-[10px] text-white uppercase tracking-widest flex items-center gap-1 mt-1 flex-wrap">
            <Clock className="h-3 w-3" /> {format(trip.startTime, 'h:mm a')} • {trip.category} • {trip.distanceKm} km
            {trip.durationMinutes && ` • ${Math.floor(trip.durationMinutes / 60)}h ${trip.durationMinutes % 60}m`}
            {trip.averageSpeedKph && ` • ${trip.averageSpeedKph} km/h`}
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div className={`text-sm font-bold ${effColor}`}>
            {trip.efficiencyKWhPer100Km} <span className="text-[10px] opacity-60">kWh/100km</span>
          </div>
          {derivedRangeDiff !== null ? (
            <div className={`text-[10px] font-bold ${derivedRangeDiff > 0 ? 'text-green-400' : derivedRangeDiff < 0 ? 'text-red-400' : 'text-white'}`}>
              {derivedRangeDiff === 0 ? 'Estimate = Odometer Distance' : `${trip.estRangeUsed} km: a ${Math.abs(derivedRangeDiff)} km (${Math.abs(derivedRangeAccuracy || 0)}%) ${derivedRangeDiff < 0 ? 'overestimate' : 'underestimate'}`}
            </div>
          ) : (
            <div className="text-[10px] text-white mt-0.5">-{trip.socUsedPct}% SOC</div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-black/20 p-3 rounded-xl flex items-center gap-3">
              <Battery className="h-5 w-5 text-white" />
              <div>
                <div className="text-[10px] uppercase font-bold text-white tracking-widest">SOC Used</div>
                <div className="font-semibold text-sm">{trip.socUsedPct}% <span className="text-xs text-white font-normal">({trip.startSOC} → {trip.endSOC})</span></div>
              </div>
            </div>
            <div className="bg-black/20 p-3 rounded-xl flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <Zap className={`h-4 w-4 ${effColor}`} />
                <div className="text-[10px] uppercase font-bold text-white tracking-widest">Est. Energy</div>
              </div>
              <div className="flex items-end justify-between">
                <div className="font-semibold text-sm">{trip.estKWhUsed} <span className="text-xs text-white font-normal">kWh</span></div>
                {diffText && (
                  <div className={`text-[9px] px-1.5 py-0.5 rounded bg-black/40 ${effColor}`}>
                    {diffText}
                  </div>
                )}
              </div>
            </div>
            
            {/* Weather & Payload Grid */}
            <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trip.weather && (
                <div className="col-span-2 bg-black/20 p-3 rounded-xl flex items-start gap-3 border border-white/5">
                  <CloudSun className="h-5 w-5 text-[#00D1FF] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-[10px] uppercase font-bold text-white tracking-widest mb-1">Weather & Environment Logs</div>
                    <div className="text-sm font-semibold mb-2">{trip.weather.season} {trip.weather.overallCondition ? `• ${trip.weather.overallCondition}` : ''} {trip.weather.avgTemp !== undefined ? `• ${trip.weather.avgTemp}°C Avg` : ''}</div>
                    
                    <div className="space-y-2 mt-3">
                      {trip.weather.start && (
                        <div className="text-xs flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-white/5 pb-2 gap-1">
                          <span className="text-white font-bold">Start</span>
                          <span className="text-slate-300 flex items-center flex-wrap gap-2">
                            <span>{trip.weather.start.temp}°C, {trip.weather.start.condition}{trip.weather.start.precip ? ` (${trip.weather.start.precip}mm)` : ''}</span>
                            {trip.weather.start.lat && trip.weather.start.lon && (
                              <a href={`https://www.google.com/maps?q=${trip.weather.start.lat},${trip.weather.start.lon}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#00D1FF] hover:text-white transition-colors bg-[#00D1FF]/10 hover:bg-[#00D1FF]/20 px-2 py-0.5 rounded font-bold">
                                <MapPin className="h-3 w-3" /> {trip.weather.start.locationName || 'Map'}
                              </a>
                            )}
                          </span>
                        </div>
                      )}
                      {trip.weather.waypoints?.map((wp, idx) => (
                        <div key={idx} className="text-xs flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-white/5 pb-2 gap-1 pl-4 ml-2 border-l-2 border-[#00D1FF]/30">
                          <span className="text-[#00D1FF]/70 font-bold">Interim {idx + 1}</span>
                          <span className="text-slate-300 flex items-center flex-wrap gap-2">
                            <span>{wp.temp}°C, {wp.condition}{wp.precip ? ` (${wp.precip}mm)` : ''}</span>
                            {wp.lat && wp.lon && (
                              <a href={`https://www.google.com/maps?q=${wp.lat},${wp.lon}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#00D1FF] hover:text-white transition-colors bg-[#00D1FF]/10 hover:bg-[#00D1FF]/20 px-2 py-0.5 rounded font-bold">
                                <MapPin className="h-3 w-3" /> {wp.locationName || 'Map'}
                              </a>
                            )}
                          </span>
                        </div>
                      ))}
                      {trip.weather.end && (
                        <div className="text-xs flex flex-col sm:flex-row sm:justify-between sm:items-center pb-1 gap-1">
                          <span className="text-white font-bold">End</span>
                          <span className="text-slate-300 flex items-center flex-wrap gap-2">
                            <span>{trip.weather.end.temp}°C, {trip.weather.end.condition}{trip.weather.end.precip ? ` (${trip.weather.end.precip}mm)` : ''}</span>
                            {trip.weather.end.lat && trip.weather.end.lon && (
                              <a href={`https://www.google.com/maps?q=${trip.weather.end.lat},${trip.weather.end.lon}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#00D1FF] hover:text-white transition-colors bg-[#00D1FF]/10 hover:bg-[#00D1FF]/20 px-2 py-0.5 rounded font-bold">
                                <MapPin className="h-3 w-3" /> {trip.weather.end.locationName || 'Map'}
                              </a>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {trip.charging && (
                <div className="col-span-2 bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] uppercase font-bold text-white tracking-widest mb-1 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-400" /> Charging Session
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest">Added</div>
                      <div className="text-sm font-bold text-white">{trip.charging.kwhAdded} <span className="text-[10px] opacity-60">kWh</span></div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest">New SOC</div>
                      <div className="text-sm font-bold text-white">{trip.charging.newSoc} <span className="text-[10px] opacity-60">%</span></div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest">Cost</div>
                      <div className="text-sm font-bold text-white">${trip.charging.cost.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
{trip.payload && (
                <div className="col-span-2 bg-black/20 p-3 rounded-xl flex items-start gap-3 border border-white/5">
                  <Users className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-[10px] uppercase font-bold text-white tracking-widest mb-1">Payload & Load</div>
                    <div className="text-sm font-semibold">{trip.payload.estWeightKg}kg Estimated Total</div>
                    <div className="text-xs text-white mt-1 flex flex-wrap gap-2">
                      <span>{trip.payload.people} 👤</span>
                      {trip.payload.dogs > 0 && <span>{trip.payload.dogs} 🐶</span>}
                      {trip.payload.luggage && trip.payload.luggage !== 'None' && <span>{trip.payload.luggage} 🧳</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {derivedRangeDiff !== null && (
              <div className="col-span-2 bg-black/20 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                <MapPin className={`h-5 w-5 ${derivedRangeDiff > 0 ? 'text-green-400' : derivedRangeDiff < 0 ? 'text-red-400' : 'text-white'}`} />
                <div className="flex-1">
                  <div className="text-[10px] uppercase font-bold text-white tracking-widest flex justify-between">
                    <span>Range: Actual v. Estimated</span>
                  </div>
                  <div className={`text-sm font-bold mt-1 ${derivedRangeDiff > 0 ? 'text-green-400' : derivedRangeDiff < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    {derivedRangeDiff === 0 ? 'Estimate = Odometer Distance' : `${trip.estRangeUsed} km: a ${Math.abs(derivedRangeDiff)} km (${Math.abs(derivedRangeAccuracy || 0)}%) ${derivedRangeDiff < 0 ? 'overestimate' : 'underestimate'}`}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal mt-1 leading-tight">This trip of {trip.distanceKm} actual odometre kilometres consumed {trip.estRangeUsed} km of the vehicle's estimated range (calculated from Start minus End Estimated Range).</div>
                </div>
              </div>
            )}
          </div>
          
          {trip.notes && (
            <div className="mb-4 bg-black/10 border border-white/5 p-3 rounded-lg text-sm text-slate-300 italic">
              "{trip.notes}"
            </div>
          )}

          <div className="flex justify-between items-center text-xs text-white">
            <div>Odometer: <span className="odo-display text-[10px] py-1 px-2 mx-1">{trip.startOdo}</span> → <span className="odo-display text-[10px] py-1 px-2 mx-1">{trip.endOdo}</span></div>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="flex items-center gap-1 text-[#00D1FF] font-bold uppercase tracking-widest hover:text-white transition-colors p-1 text-[10px]">
              <Edit3 className="h-3 w-3" /> Edit
            </button>
          </div>
        </div>
      )}
      
      {!expanded && (
        <div className="flex justify-center mt-2 -mb-2">
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      )}
    </div>
  );
}
