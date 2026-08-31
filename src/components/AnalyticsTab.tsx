import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { useTrips } from '../hooks/useTrips';
import { format, subMonths, isAfter } from 'date-fns';
import { Download, TrendingDown, BatteryCharging, Navigation, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';

type TimeFrame = '1M' | '3M' | '6M' | '12M' | 'ALL';

export function AnalyticsTab() {
  const { user } = useAuth();
  const { trips, loading } = useTrips(user?.uid);
  const [timeframe, setTimeframe] = useState<TimeFrame>('1M');
  const [exporting, setExporting] = useState(false);

  const filteredTrips = useMemo(() => {
    if (timeframe === 'ALL') return trips;
    const now = new Date();
    const months = timeframe === '1M' ? 1 : timeframe === '3M' ? 3 : timeframe === '6M' ? 6 : 12;
    const cutoff = subMonths(now, months);
    return trips.filter(t => isAfter(t.startTime, cutoff));
  }, [trips, timeframe]);

  const stats = useMemo(() => {
    if (!filteredTrips.length) return { totalDist: 0, totalEnergy: 0, avgEff: 0, avgAccuracy: null as number | null, totalRangeDiff: null as number | null, avgSpeed: 0 };
    
    const totalDist = filteredTrips.reduce((acc, t) => acc + t.distanceKm, 0);
    const totalEnergy = filteredTrips.reduce((acc, t) => acc + t.estKWhUsed, 0);
    const avgEff = totalDist > 0 ? (totalEnergy / totalDist) * 100 : 0;
    
    const totalDur = filteredTrips.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
    const avgSpeed = totalDur > 0 ? Number((totalDist / (totalDur / 60)).toFixed(1)) : 0;
    
    let totalEstRangeUsed = 0;
    let totalRangeDiff = 0;
    filteredTrips.forEach(t => {
      if (t.estRangeUsed && t.estRangeUsed > 0) {
        totalEstRangeUsed += t.estRangeUsed;
        const diff = (t.rangeDiffKm !== undefined && t.rangeDiffKm !== null) ? t.rangeDiffKm : (t.distanceKm - t.estRangeUsed);
        totalRangeDiff += diff;
      }
    });
    
    let avgAccuracy: number | null = null;
    let finalRangeDiff: number | null = null;
    if (totalEstRangeUsed > 0) {
      avgAccuracy = Number(((totalRangeDiff / totalEstRangeUsed) * 100).toFixed(1));
      finalRangeDiff = Number(totalRangeDiff.toFixed(1));
    }
    
    return {
      totalDist: Number(totalDist.toFixed(1)),
      totalEnergy: Number(totalEnergy.toFixed(1)),
      avgEff: Number(avgEff.toFixed(1)),
      avgAccuracy,
      totalRangeDiff: finalRangeDiff,
      totalEstRangeUsed: Number(totalEstRangeUsed.toFixed(1)),
      avgSpeed
    };
  }, [filteredTrips]);

  const categoryStats = useMemo(() => {
    const cats = ['Urban', 'Peri-Urban', 'Regional'];
    return cats.map(cat => {
      const catTrips = filteredTrips.filter(t => t.category === cat);
      const dist = catTrips.reduce((acc, t) => acc + t.distanceKm, 0);
      const energy = catTrips.reduce((acc, t) => acc + t.estKWhUsed, 0);
      const eff = dist > 0 ? Number(((energy / dist) * 100).toFixed(1)) : 0;
      
      let totalEstRangeUsed = 0;
      let totalRangeDiff = 0;
      catTrips.forEach(t => {
        if (t.estRangeUsed && t.estRangeUsed > 0) {
          totalEstRangeUsed += t.estRangeUsed;
          const diff = (t.rangeDiffKm !== undefined && t.rangeDiffKm !== null) ? t.rangeDiffKm : (t.distanceKm - t.estRangeUsed);
          totalRangeDiff += diff;
        }
      });
      
      let avgAccuracy: number | null = null;
      if (totalEstRangeUsed > 0) {
        avgAccuracy = Number(((totalRangeDiff / totalEstRangeUsed) * 100).toFixed(1));
      }
      
      return {
        name: cat,
        distance: Number(dist.toFixed(0)),
        efficiency: eff,
        count: catTrips.length,
        rangeBiasPct: avgAccuracy,
        totalRangeDiff: totalEstRangeUsed > 0 ? Number(totalRangeDiff.toFixed(1)) : null
      };
    }).filter(c => c.count > 0);
  }, [filteredTrips]);

  const seasonStats = useMemo(() => {
    const seasons = ['Summer', 'Autumn', 'Winter', 'Spring'];
    return seasons.map(season => {
      const seasonTrips = filteredTrips.filter(t => t.weather?.season === season);
      const dist = seasonTrips.reduce((acc, t) => acc + t.distanceKm, 0);
      const energy = seasonTrips.reduce((acc, t) => acc + t.estKWhUsed, 0);
      const eff = dist > 0 ? Number(((energy / dist) * 100).toFixed(1)) : 0;
      
      let totalEstRangeUsed = 0;
      let totalRangeDiff = 0;
      seasonTrips.forEach(t => {
        if (t.estRangeUsed && t.estRangeUsed > 0) {
          totalEstRangeUsed += t.estRangeUsed;
          const diff = (t.rangeDiffKm !== undefined && t.rangeDiffKm !== null) ? t.rangeDiffKm : (t.distanceKm - t.estRangeUsed);
          totalRangeDiff += diff;
        }
      });
      
      let avgAccuracy: number | null = null;
      if (totalEstRangeUsed > 0) {
        avgAccuracy = Number(((totalRangeDiff / totalEstRangeUsed) * 100).toFixed(1));
      }
      
      return {
        name: season,
        distance: Number(dist.toFixed(0)),
        efficiency: eff,
        count: seasonTrips.length,
        rangeBiasPct: avgAccuracy,
        totalRangeDiff: totalEstRangeUsed > 0 ? Number(totalRangeDiff.toFixed(1)) : null
      };
    }).filter(c => c.count > 0);
  }, [filteredTrips]);

  const speedStats = useMemo(() => {
    const categories = [
      { name: 'Low (Under 50 km/h)', filter: (s: number) => s < 50 },
      { name: 'Medium (51-90 km/h)', filter: (s: number) => s >= 50 && s <= 90 },
      { name: 'High (90+ km/h)', filter: (s: number) => s > 90 }
    ];
    
    return categories.map(cat => {
      const catTrips = filteredTrips.filter(t => t.averageSpeedKph !== undefined && cat.filter(t.averageSpeedKph));
      const dist = catTrips.reduce((acc, t) => acc + t.distanceKm, 0);
      const energy = catTrips.reduce((acc, t) => acc + t.estKWhUsed, 0);
      const eff = dist > 0 ? Number(((energy / dist) * 100).toFixed(1)) : 0;
      
      const totalDur = catTrips.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
      const avgSpeed = totalDur > 0 ? Number((dist / (totalDur / 60)).toFixed(1)) : 0;
      
      return {
        name: cat.name,
        distance: Number(dist.toFixed(0)),
        efficiency: eff,
        avgSpeed,
        count: catTrips.length
      };
    }).filter(c => c.count > 0);
  }, [filteredTrips]);

  const payloadStats = useMemo(() => {
    const categories = [
      { name: 'Light Load (< 100kg)', filter: (w: number) => w < 100 },
      { name: 'Medium Load (100 - 200kg)', filter: (w: number) => w >= 100 && w <= 200 },
      { name: 'Heavy Load (> 200kg)', filter: (w: number) => w > 200 }
    ];
    
    return categories.map(cat => {
      const catTrips = filteredTrips.filter(t => t.payload?.estWeightKg !== undefined && cat.filter(t.payload.estWeightKg));
      const dist = catTrips.reduce((acc, t) => acc + t.distanceKm, 0);
      const energy = catTrips.reduce((acc, t) => acc + t.estKWhUsed, 0);
      const eff = dist > 0 ? Number(((energy / dist) * 100).toFixed(1)) : 0;
      
      return {
        name: cat.name,
        distance: Number(dist.toFixed(0)),
        efficiency: eff,
        count: catTrips.length
      };
    }).filter(c => c.count > 0);
  }, [filteredTrips]);

  
  const chargingStats = useMemo(() => {
    let totalKwh = 0;
    let totalCost = 0;
    let sessionsCount = 0;
    
    filteredTrips.forEach(t => {
      if (t.charging) {
        totalKwh += t.charging.kwhAdded;
        totalCost += t.charging.cost;
        sessionsCount++;
      }
    });
    
    return {
      totalKwh: Number(totalKwh.toFixed(1)),
      totalCost: Number(totalCost.toFixed(2)),
      avgCostPerKwh: totalKwh > 0 ? Number((totalCost / totalKwh).toFixed(2)) : 0,
      sessionsCount
    };
  }, [filteredTrips]);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      if (!trips.length) {
        setExporting(false);
        return;
      }
      
      const headers = ['Trip ID', 'Date', 'Start Time', 'End Time', 'Duration (mins)', 'Avg Speed (km/h)', 'Category', 'Trip Type', 'Road Trip Name', 'Start Odometer', 'End Odometer', 'Distance (km)', 'Start SOC', 'End SOC', 'SOC Used (%)', 'Start Est Range', 'End Est Range', 'Est Range Used', 'Range Diff (km)', 'Range Accuracy (%)', 'Energy Used (Est.) (kWh)', 'Efficiency (kWh/100km)', 'Season', 'Weather Condition', 'Start Temp (C)', 'End Temp (C)', 'Avg Temp (C)', 'People', 'Dogs', 'Luggage', 'Payload (kg)', 'Notes', 'Charging Added (kWh)', 'Charging New SOC (%)', 'Charging Cost ($)'];
      const rows = trips.map(t => [
        t.id,
        format(t.startTime, 'yyyy-MM-dd'),
        format(t.startTime, 'HH:mm:ss'),
        format(t.endTime, 'HH:mm:ss'),
        t.durationMinutes !== undefined ? t.durationMinutes : '',
        t.averageSpeedKph !== undefined ? t.averageSpeedKph : '',
        t.category,
        t.tripType || 'Single',
        t.roadTripName ? `"${t.roadTripName}"` : '',
        t.startOdo,
        t.endOdo,
        t.distanceKm,
        t.startSOC,
        t.endSOC,
        t.socUsedPct,
        t.startEstRange !== undefined ? t.startEstRange : '',
        t.endEstRange !== undefined ? t.endEstRange : '',
        t.estRangeUsed !== undefined ? t.estRangeUsed : '',
        t.rangeDiffKm !== undefined ? t.rangeDiffKm : '',
        t.rangeAccuracyPct !== undefined ? t.rangeAccuracyPct : '',
        t.estKWhUsed,
        t.efficiencyKWhPer100Km,
        t.weather?.season || '',
        t.weather?.overallCondition ? `"${t.weather.overallCondition}"` : '',
        t.weather?.start?.temp !== undefined ? t.weather.start.temp : '',
        t.weather?.end?.temp !== undefined ? t.weather.end.temp : '',
        t.weather?.avgTemp !== undefined ? t.weather.avgTemp : '',
        t.payload?.people !== undefined ? t.payload.people : '',
        t.payload?.dogs !== undefined ? t.payload.dogs : '',
        t.payload?.luggage ? `"${t.payload.luggage}"` : '',
        t.payload?.estWeightKg !== undefined ? t.payload.estWeightKg : '',
        `"${t.notes || ''}"`
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(',') + "\n" 
        + rows.map(e => e.join(',')).join("\n");
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `electondrive_export_${format(new Date(), 'yyyyMMdd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExporting(false);
    }, 500);
  };

  if (loading) return <div className="text-center py-10 text-slate-400">Loading analytics...</div>;

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-500 flex-1 flex flex-col">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xs font-bold text-white uppercase tracking-widest">Fleet Analytics</h2>
        <Button variant="ghost" size="sm" onClick={handleExport} disabled={exporting || trips.length === 0} className="h-10 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#00D1FF] hover:bg-white/5 border border-white/5 bg-black/20">
          {exporting ? <CheckCircle2 className="h-4 w-4 mr-1.5" /> : <Download className="h-4 w-4 mr-1.5" />}
          {exporting ? 'Exported' : 'CSV'}
        </Button>
      </div>

      <div className="flex bg-black/40 p-1 rounded-xl overflow-x-auto no-scrollbar border border-white/5">
        {(['1M', '3M', '6M', '12M', 'ALL'] as TimeFrame[]).map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`flex-1 min-w-[60px] text-xs font-bold uppercase tracking-widest py-2 rounded-lg transition-all ${
              timeframe === tf ? 'bg-white/10 shadow-[0_0_10px_rgba(0,209,255,0.2)] text-[#00D1FF]' : 'text-white hover:text-slate-300'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 h-full flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-white mb-2 text-xs font-bold uppercase tracking-widest">
            <Navigation className="h-4 w-4 text-[#00D1FF] shrink-0" /> Distance Travelled
          </div>
          <div className="stat-value text-3xl mb-2 truncate">{stats.totalDist.toLocaleString()} <span className="text-xs font-normal opacity-60">km</span></div>
          <div className="text-[10px] text-slate-400 font-normal mt-auto leading-tight">Actual odometre kilometres driven across selected trips.</div>
        </div>
        <div className="glass-card p-5 h-full flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-white mb-2 text-xs font-bold uppercase tracking-widest">
            <TrendingDown className="h-4 w-4 text-green-400 shrink-0" /> Driving Efficiency
          </div>
          <div className="stat-value text-3xl !text-green-400 mb-2 truncate">{stats.avgEff} <span className="text-xs font-normal opacity-60 text-white">kWh/100km</span></div>
          <div className="text-[10px] text-slate-400 font-normal mt-auto leading-tight">Estimated energy consumed (calculated from SOC % change against the total 82.5 kWh battery) divided by actual odometre distance. Displayed as kWh/100km.</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 h-full flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-white mb-2 text-xs font-bold uppercase tracking-widest">
            <BatteryCharging className="h-4 w-4 text-[#00D1FF] shrink-0" /> Energy Used (Est.)
          </div>
          <div className="stat-value text-3xl mb-2 truncate">{stats.totalEnergy.toLocaleString()} <span className="text-xs font-normal opacity-60">kWh</span></div>
          <div className="text-[10px] text-slate-400 font-normal mt-auto leading-tight">Estimated energy consumed. Calculated using the SOC % drop against the total 82.5 kWh battery capacity.</div>
        </div>
        {stats.avgAccuracy !== null && (
          <div className="glass-card p-5 h-full flex flex-col min-w-0">
            <div className="flex items-center gap-2 text-white mb-2 text-xs font-bold uppercase tracking-widest">
              <Navigation className={`h-4 w-4 shrink-0 ${stats.avgAccuracy > 0 ? 'text-green-400' : stats.avgAccuracy < 0 ? 'text-red-400' : 'text-purple-400'}`} /> 
              Range: Actual v. Estimated
            </div>
            <div className={`stat-value text-xl sm:text-2xl mb-2 flex-wrap ${stats.avgAccuracy > 0 ? 'text-green-400' : stats.avgAccuracy < 0 ? 'text-red-400' : 'text-white'}`}>
              {stats.totalRangeDiff === 0 ? 'Estimate = Odometer Distance' : `${stats.totalEstRangeUsed} km: a ${Math.abs(stats.totalRangeDiff!)} km (${Math.abs(stats.avgAccuracy!)}%) ${stats.totalRangeDiff! < 0 ? 'overestimate' : 'underestimate'}`}
            </div>
            <div className="text-[10px] text-slate-400 font-normal mt-auto leading-tight">Compares actual odometre kilometres driven against the vehicle's estimated range lost (Start Estimated Range minus End Estimated Range).</div>
          </div>
        )}
      </div>

      
      {chargingStats.sessionsCount > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mt-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Charging Analytics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-white mb-2 text-xs font-bold uppercase tracking-widest">
                 Total Added
              </div>
              <div className="stat-value text-2xl text-yellow-400">{chargingStats.totalKwh.toLocaleString()} <span className="text-xs font-normal opacity-60 text-white">kWh</span></div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-white mb-2 text-xs font-bold uppercase tracking-widest">
                 Total Cost
              </div>
              <div className="stat-value text-2xl">${chargingStats.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-white mb-2 text-xs font-bold uppercase tracking-widest">
                 Avg Cost / kWh
              </div>
              <div className="stat-value text-2xl text-[#00D1FF]">${chargingStats.avgCostPerKwh.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-xs font-normal opacity-60 text-white">/ kWh</span></div>
            </div>
          </div>
        </div>
      )}

      {seasonStats.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mt-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Seasonal Performance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {seasonStats.map(season => (
              <div key={season.name} className="glass-card p-4 rounded-xl flex flex-col justify-between h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${
                    season.name === 'Summer' ? 'bg-yellow-400' :
                    season.name === 'Winter' ? 'bg-[#00D1FF]' :
                    season.name === 'Spring' ? 'bg-green-400' :
                    'bg-orange-400'
                  }`}></div>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">{season.name}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Trips</span>
                    <span className="text-sm font-bold">{season.count} <span className="text-[10px] opacity-60 text-white">({Math.round((season.count / filteredTrips.length) * 100)}%)</span></span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Distance</span>
                    <span className="text-sm font-bold">{season.distance.toLocaleString()} km</span>
                  </div>
                  
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Efficiency</span>
                    <span className="text-sm font-bold text-[#00D1FF]">{season.efficiency} <span className="text-[10px] opacity-60 text-white">kWh/100km</span></span>
                  </div>
                  
                  <div className="flex justify-between items-end pt-1">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Range Bias</span>
                    {season.rangeBiasPct !== null ? (
                      <div className={`text-right ${season.rangeBiasPct > 0 ? 'text-green-400' : season.rangeBiasPct < 0 ? 'text-red-400' : 'text-white'}`}>
                        <div className="text-sm font-bold">
                          {season.totalRangeDiff === 0 ? 'Exact' : `${Math.abs(season.totalRangeDiff)}km (${Math.abs(season.rangeBiasPct)}%) ${season.totalRangeDiff < 0 ? 'Over' : 'Under'}`}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-white font-bold italic">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {categoryStats.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mt-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Category Performance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categoryStats.map(cat => (
              <div key={cat.name} className="glass-card p-4 rounded-xl flex flex-col justify-between h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${
                    cat.name === 'Urban' ? 'bg-[#00D1FF]' : 
                    cat.name === 'Peri-Urban' ? 'bg-purple-400' : 
                    'bg-green-400'
                  }`}></div>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">{cat.name}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Trips</span>
                    <span className="text-sm font-bold">{cat.count} <span className="text-[10px] opacity-60 text-white">({Math.round((cat.count / filteredTrips.length) * 100)}%)</span></span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Total Distance</span>
                    <span className="text-sm font-bold">{cat.distance.toLocaleString()} km</span>
                  </div>
                  
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Avg Efficiency</span>
                    <span className={`text-sm font-bold ${
                      cat.name === 'Urban' ? 'text-[#00D1FF]' : 
                      cat.name === 'Peri-Urban' ? 'text-purple-400' : 
                      'text-green-400'
                    }`}>{cat.efficiency} <span className="text-[10px] opacity-60 text-white">kWh/100km</span></span>
                  </div>
                  
                  <div className="flex justify-between items-end pt-1">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Range Bias</span>
                    {cat.rangeBiasPct !== null ? (
                      <div className={`text-right ${cat.rangeBiasPct > 0 ? 'text-green-400' : cat.rangeBiasPct < 0 ? 'text-red-400' : 'text-white'}`}>
                        <div className="text-sm font-bold">
                          {cat.totalRangeDiff === 0 ? 'Exact' : `${Math.abs(cat.totalRangeDiff)}km (${Math.abs(cat.rangeBiasPct)}%) ${cat.totalRangeDiff < 0 ? 'Over' : 'Under'}`}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-white font-bold italic">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {speedStats.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mt-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Speed Impact</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {speedStats.map(speed => (
              <div key={speed.name} className="glass-card p-4 rounded-xl flex flex-col justify-between h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${
                    speed.name.includes('Low') ? 'bg-green-400' :
                    speed.name.includes('Medium') ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}></div>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">{speed.name}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Trips</span>
                    <span className="text-sm font-bold">{speed.count} <span className="text-[10px] opacity-60 text-white">({Math.round((speed.count / filteredTrips.length) * 100)}%)</span></span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Distance</span>
                    <span className="text-sm font-bold">{speed.distance.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Avg Speed</span>
                    <span className="text-sm font-bold">{speed.avgSpeed} <span className="text-[10px] opacity-60">km/h</span></span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Efficiency</span>
                    <span className="text-sm font-bold text-[#00D1FF]">{speed.efficiency} <span className="text-[10px] opacity-60 text-white">kWh/100km</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {payloadStats.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mt-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Payload Impact</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {payloadStats.map(payload => (
              <div key={payload.name} className="glass-card p-4 rounded-xl flex flex-col justify-between h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${
                    payload.name.includes('Light') ? 'bg-green-400' :
                    payload.name.includes('Medium') ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}></div>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">{payload.name}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Trips</span>
                    <span className="text-sm font-bold">{payload.count} <span className="text-[10px] opacity-60 text-white">({Math.round((payload.count / filteredTrips.length) * 100)}%)</span></span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Distance</span>
                    <span className="text-sm font-bold">{payload.distance.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Efficiency</span>
                    <span className="text-sm font-bold text-[#00D1FF]">{payload.efficiency} <span className="text-[10px] opacity-60 text-white">kWh/100km</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
