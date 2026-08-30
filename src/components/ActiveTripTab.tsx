import React, { useState, useEffect } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/AuthContext';
import { useTrips } from '../hooks/useTrips';
import { TripCategory, TripType, WeatherSnapshot } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Play, Square, Battery, Map, Clock, AlertTriangle, Route, CloudSun, Users, Dog, ChevronRight, ChevronLeft, CheckCircle2, Zap } from 'lucide-react';
import { fetchWeather, getCurrentLocation, getSeason } from '../lib/weather';

interface ActiveTripState {
  startTime: number;
  startOdo: number;
  startSOC: number;
  startEstRange?: number;
  category: TripCategory;
  tripType: TripType;
  roadTripName?: string;
  startWeather?: WeatherSnapshot;
  waypoints?: WeatherSnapshot[];
  payload?: {
    people: number;
    dogs: number;
    luggage?: 'None' | 'Low' | 'Medium' | 'High';
    estWeightKg: number;
  };
}

export function ActiveTripTab() {
  const { user } = useAuth();
  const { trips, loading } = useTrips(user?.uid);
  
  const [activeTrip, setActiveTrip] = useState<ActiveTripState | null>(null);
  
  const [startOdo, setStartOdo] = useState<string>('');
  const [startSOC, setStartSOC] = useState<string>('');
  const [startEstRange, setStartEstRange] = useState<string>('');
  const [category, setCategory] = useState<TripCategory>('Urban');
  const [tripType, setTripType] = useState<TripType>('Single');
  const [roadTripName, setRoadTripName] = useState<string>('');
  
  const [setupStep, setSetupStep] = useState<number>(1);
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [dogCount, setDogCount] = useState<number>(0);
  const [luggage, setLuggage] = useState<'None' | 'Low' | 'Medium' | 'High'>('Low');
  
  const [endOdo, setEndOdo] = useState<string>('');
  const [endSOC, setEndSOC] = useState<string>('');
  const [endEstRange, setEndEstRange] = useState<string>('');
  const [logCharging, setLogCharging] = useState(false);
  const [chargingKwh, setChargingKwh] = useState<string>('');
  const [chargingSoc, setChargingSoc] = useState<string>('');
  const [chargingCost, setChargingCost] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isEndingTrip, setIsEndingTrip] = useState(false);
  const [endStep, setEndStep] = useState<number>(1);
  const [postTripState, setPostTripState] = useState<'none' | 'road_trip_leg'>('none');

  // Load active trip and previous settings from local storage
  useEffect(() => {
    const saved = localStorage.getItem('electron_active_trip');
    if (saved) {
      setActiveTrip(JSON.parse(saved));
    }
    const savedTripType = localStorage.getItem('electron_last_trip_type');
    const savedRoadTripName = localStorage.getItem('electron_last_roadtrip_name');
    if (savedTripType) setTripType(savedTripType as TripType);
    if (savedRoadTripName) setRoadTripName(savedRoadTripName);
  }, []);

  // Pre-fill odometer if not active
  useEffect(() => {
    if (!activeTrip && trips.length > 0 && !startOdo && !loading) {
      setStartOdo(trips[0].endOdo.toString());
    }
  }, [trips, activeTrip, startOdo, loading]);
  
  // Timer for active trip
  useEffect(() => {
    if (!activeTrip) return;
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = now - activeTrip.startTime;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsedTime(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000); // update every sec
    return () => clearInterval(interval);
  }, [activeTrip]);

  const [fetchingWeather, setFetchingWeather] = useState(false);

  const handleStartTrip = async () => {
    setError('');
    const odo = parseFloat(startOdo);
    const soc = parseInt(startSOC, 10);
    const estRange = startEstRange ? parseInt(startEstRange, 10) : undefined;
    
    if (isNaN(odo) || odo < 0) return setError('Invalid Start Odometer');
    if (isNaN(soc) || soc < 0 || soc > 100) return setError('Invalid Start SOC (must be 0-100)');
    if (estRange !== undefined && (isNaN(estRange) || estRange < 0)) return setError('Invalid Start Est. Range');
    if (tripType === 'Road Trip' && !roadTripName.trim()) return setError('Please enter a Road Trip name');
    
    setFetchingWeather(true);
    let startWeather: WeatherSnapshot | undefined = undefined;
    try {
      const pos = await getCurrentLocation();
      const weather = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
      if (weather) startWeather = weather;
    } catch (err) {
      console.warn("Failed to get start weather:", err);
    }
    setFetchingWeather(false);

    const trip: ActiveTripState = {
      startTime: Date.now(),
      startOdo: odo,
      startSOC: soc,
      startEstRange: estRange,
      category,
      tripType,
      roadTripName: tripType === 'Road Trip' ? roadTripName.trim() : undefined,
      startWeather,
      payload: {
        people: peopleCount,
        dogs: dogCount,
        luggage,
        estWeightKg: (peopleCount * 80) + (dogCount * 25) + (luggage === 'Low' ? 10 : luggage === 'Medium' ? 30 : luggage === 'High' ? 60 : 0)
      }
    };
    
    localStorage.setItem('electron_active_trip', JSON.stringify(trip));
    localStorage.setItem('electron_last_trip_type', tripType);
    if (tripType === 'Road Trip') {
      localStorage.setItem('electron_last_roadtrip_name', roadTripName.trim());
    }
    
    setActiveTrip(trip);
    setIsEndingTrip(false);
    setEndOdo('');
    setEndSOC('');
    setEndEstRange('');
    setNotes('');
  };

  const [loggingWaypoint, setLoggingWaypoint] = useState(false);
  const [waypointSuccess, setWaypointSuccess] = useState(false);

  const handleLogWaypoint = async () => {
    if (!activeTrip) return;
    setLoggingWaypoint(true);
    setError('');
    try {
      const pos = await getCurrentLocation();
      const weather = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
      if (weather) {
        const updatedTrip = {
          ...activeTrip,
          waypoints: [...(activeTrip.waypoints || []), weather]
        };
        setActiveTrip(updatedTrip);
        localStorage.setItem('electron_active_trip', JSON.stringify(updatedTrip));
        setWaypointSuccess(true);
        setTimeout(() => setWaypointSuccess(false), 3000);
      }
    } catch (err: any) {
      console.warn("Failed to log waypoint:", err);
      setError("Waypoint Error: " + (err.message || "Could not acquire location or weather."));
    }
    setLoggingWaypoint(false);
  };

  const handleEndTrip = async () => {
    if (!activeTrip || !user) return;
    setError('');
    
    const endO = parseFloat(endOdo);
    const endS = parseInt(endSOC, 10);
    const endEst = endEstRange ? parseInt(endEstRange, 10) : undefined;
    
    if (isNaN(endO) || endO < activeTrip.startOdo) return setError('End Odometer must be >= Start Odometer');
    if (isNaN(endS) || endS < 0 || endS > 100) return setError('Invalid End SOC (must be 0-100)');
    if (endEst !== undefined && (isNaN(endEst) || endEst < 0)) return setError('Invalid End Est. Range');
    
    setSaving(true);
    try {
      let endWeather: WeatherSnapshot | undefined = undefined;
      try {
        const pos = await getCurrentLocation();
        const weather = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
        if (weather) endWeather = weather;
      } catch (err) {
        console.warn("Failed to get end weather:", err);
      }

      const distanceKm = Number((endO - activeTrip.startOdo).toFixed(1));
    
    let charging = undefined;
    if (logCharging) {
      const kwh = parseFloat(chargingKwh);
      const soc = parseFloat(chargingSoc);
      const cost = parseFloat(chargingCost);
      if (isNaN(kwh) || isNaN(soc) || isNaN(cost)) {
        return setError('Invalid charging details');
      }
      charging = { kwhAdded: kwh, newSoc: soc, cost: cost };
    }
      const socUsedPct = activeTrip.startSOC - endS;
      
      let estRangeUsed: number | undefined = undefined;
      let rangeDiffKm: number | undefined = undefined;
      let rangeAccuracyPct: number | undefined = undefined;
      
      if (activeTrip.startEstRange !== undefined && endEst !== undefined) {
        estRangeUsed = activeTrip.startEstRange - endEst;
        if (estRangeUsed > 0) {
          rangeDiffKm = Number((distanceKm - estRangeUsed).toFixed(1));
          rangeAccuracyPct = Number(((rangeDiffKm / estRangeUsed) * 100).toFixed(1));
        }
      }
      
      // Calculate efficiency based on 82.5 kWh pack
      const estKWhUsed = Number(((socUsedPct / 100) * 82.5).toFixed(2));
      const efficiencyKWhPer100Km = distanceKm > 0 
        ? Number(((estKWhUsed / distanceKm) * 100).toFixed(1)) 
        : 0;
        
      // Process Weather
      let tripWeather: any = undefined;
      if (activeTrip.startWeather || endWeather || activeTrip.waypoints?.length) {
        tripWeather = {
          season: getSeason(new Date(activeTrip.startTime))
        };
        if (activeTrip.startWeather) tripWeather.start = activeTrip.startWeather;
        if (endWeather) tripWeather.end = endWeather;
        if (activeTrip.waypoints && activeTrip.waypoints.length > 0) {
          tripWeather.waypoints = activeTrip.waypoints;
        }
        
        let temps = [];
        if (activeTrip.startWeather?.temp !== undefined) temps.push(activeTrip.startWeather.temp);
        if (endWeather?.temp !== undefined) temps.push(endWeather.temp);
        if (activeTrip.waypoints) {
          activeTrip.waypoints.forEach(wp => {
            if (wp.temp !== undefined) temps.push(wp.temp);
          });
        }
        
        if (temps.length > 0) {
          tripWeather.avgTemp = Number((temps.reduce((a,b)=>a+b, 0) / temps.length).toFixed(1));
        }
        
        // Worst condition logic: Rain/Wet trumps Dry/Cloudy.
        const conditions: string[] = [];
        if (activeTrip.startWeather?.condition) conditions.push(activeTrip.startWeather.condition.toLowerCase());
        if (endWeather?.condition) conditions.push(endWeather.condition.toLowerCase());
        if (activeTrip.waypoints) {
          activeTrip.waypoints.forEach(wp => {
            if (wp.condition) conditions.push(wp.condition.toLowerCase());
          });
        }
        
        if (conditions.some(c => c.includes('rain') || c.includes('shower') || c.includes('storm') || c.includes('wet'))) {
          tripWeather.overallCondition = 'Wet';
        } else if (conditions.length > 0) {
          tripWeather.overallCondition = activeTrip.startWeather?.condition || endWeather?.condition || conditions[0];
        }
      }

      const endTime = new Date();
      const durationMinutes = Math.max(1, Math.round((endTime.getTime() - new Date(activeTrip.startTime).getTime()) / 60000));
      const averageSpeedKph = distanceKm > 0 ? Number((distanceKm / (durationMinutes / 60)).toFixed(1)) : 0;

      await addDoc(collection(db, 'trips'), {
        userId: user.uid,
        startTime: new Date(activeTrip.startTime),
        endTime: endTime,
        startOdo: activeTrip.startOdo,
        endOdo: endO,
        startSOC: activeTrip.startSOC,
        endSOC: endS,
        startEstRange: activeTrip.startEstRange ?? null,
        endEstRange: endEst ?? null,
        estRangeUsed: estRangeUsed ?? null,
        rangeDiffKm: rangeDiffKm ?? null,
        rangeAccuracyPct: rangeAccuracyPct ?? null,
        category: activeTrip.category,
        tripType: activeTrip.tripType,
        roadTripName: activeTrip.roadTripName ?? null,
        notes: notes || '',
        distanceKm,
        socUsedPct,
        estKWhUsed,
        efficiencyKWhPer100Km,
        weather: tripWeather ?? null,
        payload: activeTrip.payload,
        charging: charging ?? null,
        durationMinutes,
        averageSpeedKph
      });

      localStorage.removeItem('electron_active_trip');
      
      if (activeTrip.tripType === 'Road Trip') {
        setPostTripState('road_trip_leg');
      }
      
      setActiveTrip(null);
      
      // Pre-fill next start with this end
      setStartOdo(endO.toString());
      setStartSOC(endS.toString());
      if (endEst !== undefined) {
        setStartEstRange(endEst.toString());
      } else {
        setStartEstRange('');
      }
      
      setEndOdo('');
      setEndSOC('');
      setEndEstRange('');
      setNotes('');
      setSetupStep(1);
      setIsEndingTrip(false);
      setEndStep(1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save trip');
    } finally {
      setSaving(false);
    }
  };

  const cancelTrip = () => {
    if (confirmCancel) {
      localStorage.removeItem('electron_active_trip');
      setActiveTrip(null);
      setConfirmCancel(false);
    } else {
      setConfirmCancel(true);
      setTimeout(() => setConfirmCancel(false), 3000);
    }
  };

  if (postTripState === 'road_trip_leg') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="glass-card glow-accent p-6 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[60vh]">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[radial-gradient(circle,rgba(0,209,255,0.15)_0%,transparent_70%)]"></div>
          
          <div className="w-16 h-16 bg-[#00D1FF]/20 rounded-full flex items-center justify-center mb-6 relative z-10 shadow-[0_0_20px_rgba(0,209,255,0.3)]">
            <CheckCircle2 className="w-8 h-8 text-[#00D1FF]" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 relative z-10">Leg Complete!</h2>
          <p className="text-white mb-8 max-w-sm relative z-10">
            Your trip data has been securely logged. Would you like to continue to the next leg of this Road Trip, or end the entire Road Trip?
          </p>
          
          <div className="flex flex-col gap-4 w-full max-w-xs relative z-10">
            <Button 
              className="w-full uppercase tracking-widest text-xs h-14 font-bold" 
              onClick={() => {
                setPostTripState('none');
                setTripType('Road Trip');
                setSetupStep(1);
              }}
            >
              Continue to Next Leg
            </Button>
            <Button 
              variant="outline"
              className="w-full uppercase tracking-widest text-xs h-14 bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold" 
              onClick={() => {
                setPostTripState('none');
                setTripType('Single');
                setRoadTripName('');
                localStorage.removeItem('electron_last_trip_type');
                localStorage.removeItem('electron_last_roadtrip_name');
                setSetupStep(1);
              }}
            >
              End Road Trip
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTrip) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="glass-card glow-accent p-6 flex flex-col relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[radial-gradient(circle,rgba(0,209,255,0.15)_0%,transparent_70%)]"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-lg font-bold">ACTIVE TRIP LOG</h2>
              {activeTrip.tripType === 'Road Trip' && (
                <div className="text-xs text-[#00D1FF] uppercase font-bold tracking-widest mt-1 flex items-center gap-1">
                  <Route className="h-3 w-3" /> {activeTrip.roadTripName}
                </div>
              )}
              <div className="text-[10px] text-white uppercase font-bold tracking-widest mt-1 flex items-center gap-1">
                {activeTrip.startWeather ? (
                  <><CloudSun className="h-3 w-3 text-[#00D1FF]" /> {activeTrip.startWeather.condition} • {activeTrip.startWeather.temp}°C</>
                ) : (
                  <><AlertTriangle className="h-3 w-3 text-yellow-500" /> Weather Not Synced</>
                )}
              </div>
            </div>
            <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold uppercase flex items-center gap-1.5">
              <Play className="h-3 w-3 fill-current animate-pulse" />
              <span>Elapsed: {elapsedTime}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-2 relative z-10">
            <div>
              <p className="text-xs font-bold text-white uppercase mb-3">Starting Odometer</p>
              <div className="odo-display text-2xl font-bold">{activeTrip.startOdo} <span className="text-sm text-white">km</span></div>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase mb-3">Starting Range</p>
              <div className="odo-display text-2xl font-bold">{activeTrip.startEstRange !== undefined ? activeTrip.startEstRange : '--'} <span className="text-sm text-white">km</span></div>
            </div>
            <div className="col-span-2 mt-2">
              <p className="text-xs font-bold text-white uppercase mb-3">Starting SOC</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{activeTrip.startSOC}</span>
                <span className="text-lg text-white mb-1">%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full mt-2">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${activeTrip.startSOC}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {!isEndingTrip ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {(activeTrip.category === 'Regional' || activeTrip.category === 'Peri-Urban') && (
              <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Weather Tracking</span>
                  <span className="text-xs text-[#00D1FF] font-bold">{activeTrip.waypoints?.length || 0} Waypoints</span>
                </div>
                <p className="text-[10px] text-white mb-4">
                  Log a waypoint when you stop to improve average weather accuracy.
                </p>
                <Button 
                  onClick={handleLogWaypoint} 
                  disabled={loggingWaypoint || waypointSuccess}
                  variant="outline" 
                  className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10 h-12"
                >
                  {loggingWaypoint ? 'Acquiring GPS...' : waypointSuccess ? 'Waypoint Logged ✓' : 'Log Weather Waypoint'}
                </Button>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="danger" className={`w-full sm:flex-1 uppercase tracking-widest text-xs h-14 ${confirmCancel ? 'bg-red-600 hover:bg-red-700' : ''}`} onClick={cancelTrip}>
                {confirmCancel ? 'Click Again to Confirm' : 'Cancel Trip'}
              </Button>
              <Button className="w-full sm:flex-[2] uppercase tracking-widest text-xs h-14" onClick={() => setIsEndingTrip(true)}>
                End Trip
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 glass-card p-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Complete Trip</h3>
            
            <div className="space-y-6">
              {error && <div className="text-red-400 bg-red-900/20 border border-red-500/30 p-3 rounded-xl flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4"/>{error}</div>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white uppercase flex flex-col"><span>End Odometer (km)</span><span className="text-[10px] text-transparent select-none font-normal lowercase tracking-normal">(spacer)</span></label>
                  <Input 
                    type="number" inputMode="decimal"
                    value={endOdo} onChange={(e) => setEndOdo(e.target.value)}
                    placeholder={`> ${activeTrip.startOdo}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white uppercase flex flex-col"><span>Arrival Battery %</span><span className="text-[10px] text-white/60 font-normal lowercase tracking-normal">(Your battery level right as you parked)</span></label>
                  <Input 
                    type="number" inputMode="numeric"
                    value={endSOC} onChange={(e) => setEndSOC(e.target.value)}
                    placeholder={`< ${activeTrip.startSOC}`}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-white uppercase">Arrival Est. Range (km)</label>
                  <Input 
                    type="number" inputMode="numeric"
                    value={endEstRange} onChange={(e) => setEndEstRange(e.target.value)}
                    placeholder="Car's estimated range remaining"
                  />
                </div>
              
              </div>

              {(activeTrip.category === 'Peri-Urban' || activeTrip.category === 'Regional' || activeTrip.tripType === 'Road Trip') && (
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <button
                    onClick={() => setLogCharging(!logCharging)}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold uppercase tracking-widest text-xs ${logCharging ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400 glow-accent shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
                  >
                    <Zap className="h-4 w-4" /> 
                    {logCharging ? 'Cancel Charging Session' : 'Add Charging Session'}
                  </button>
                  
                  {logCharging && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl border border-yellow-400/30 bg-[rgba(250,204,21,0.05)] shadow-[inset_0_0_20px_rgba(250,204,21,0.05)] animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-yellow-400/80 uppercase tracking-widest">Added kWh</label>
                        <Input type="number" inputMode="decimal" value={chargingKwh} onChange={(e) => setChargingKwh(e.target.value)} placeholder="e.g. 45.2" className="h-10 text-sm bg-black/40 border-yellow-400/20" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-yellow-400/80 uppercase tracking-widest flex flex-col"><span>Post-Charge Battery %</span><span className="text-[9px] text-yellow-400/60 lowercase tracking-normal font-normal mt-0.5">(When unplugged)</span></label>
                        <Input type="number" inputMode="numeric" value={chargingSoc} onChange={(e) => setChargingSoc(e.target.value)} placeholder="e.g. 80" className="h-10 text-sm bg-black/40 border-yellow-400/20" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-yellow-400/80 uppercase tracking-widest">Total Cost ($)</label>
                        <Input type="number" inputMode="decimal" value={chargingCost} onChange={(e) => setChargingCost(e.target.value)} placeholder="e.g. 24.50" className="h-10 text-sm bg-black/40 border-yellow-400/20" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-3">

                <Button variant="outline" className="w-full sm:flex-1 uppercase tracking-widest text-xs h-14 bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={() => setIsEndingTrip(false)}>
                  Cancel
                </Button>
                <Button className="w-full sm:flex-[2] uppercase tracking-widest text-xs h-14" onClick={handleEndTrip} disabled={saving}>
                  {saving ? 'Acquiring GPS & Saving...' : 'Complete Trip'}
                </Button>
              </div>
              <p className="text-[10px] text-center text-white mt-2 flex items-center justify-center gap-1">
                <CloudSun className="h-3 w-3" /> Location & Weather are automatically captured via XWeather.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card glow-accent p-6 sm:p-8 flex flex-col relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[radial-gradient(circle,rgba(0,209,255,0.15)_0%,transparent_70%)]"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-lg font-bold">START TRIP LOG</h2>
          <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold uppercase">Ready</div>
        </div>
        
        {error && <div className="mb-4 text-red-400 bg-red-900/20 border border-red-500/30 p-3 rounded-xl flex items-center gap-2 text-sm relative z-10"><AlertTriangle className="h-4 w-4"/>{error}</div>}
        
        <div className="space-y-8 relative z-10">
          {/* STEP INDICATOR */}
          <div className="flex items-center justify-between px-2 mb-2">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${setupStep === step ? 'bg-[#00D1FF] text-black shadow-[0_0_10px_rgba(0,209,255,0.5)]' : setupStep > step ? 'bg-[#00D1FF]/20 text-[#00D1FF]' : 'bg-white/5 text-white'}`}>
                  {setupStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                {step < 3 && <div className={`w-8 sm:w-16 h-1 mx-2 rounded-full ${setupStep > step ? 'bg-[#00D1FF]/40' : 'bg-white/5'}`}></div>}
              </div>
            ))}
          </div>

          {setupStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
              <div>
                <p className="text-xs font-bold text-white uppercase mb-4">Trip Structure</p>
                <div className="flex gap-3 mb-4">
                  <div 
                    onClick={() => setTripType('Single')} 
                    className={`category-pill flex-1 text-center ${tripType === 'Single' ? 'active' : ''}`}
                  >
                    Single Trip
                  </div>
                  <div 
                    onClick={() => setTripType('Road Trip')} 
                    className={`category-pill flex-1 text-center flex items-center justify-center gap-2 ${tripType === 'Road Trip' ? 'active' : ''}`}
                  >
                    <Route className="h-4 w-4" /> Road Trip
                  </div>
                </div>
                
                {tripType === 'Road Trip' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2 mt-4">
                    <label className="text-xs font-bold text-white uppercase">Road Trip Name</label>
                    
                    <Input 
                      type="text" 
                      list="recent-road-trips"
                      value={roadTripName} 
                      onChange={(e) => setRoadTripName(e.target.value)}
                      placeholder="e.g. Summer Vacation 2026"
                    />
                    
                    {(() => {
                      const recentTrips = Array.from(new Set(trips.filter(t => t.tripType === 'Road Trip' && t.roadTripName).map(t => t.roadTripName))).slice(0, 5);
                      if (recentTrips.length > 0) {
                        return (
                          <div className="mt-3">
                            <p className="text-[10px] font-bold text-white/60 uppercase mb-2">Or Resume Recent Road Trip:</p>
                            <div className="flex flex-wrap gap-2">
                              {recentTrips.map(name => (
                                <button
                                  key={name}
                                  onClick={() => setRoadTripName(name || '')}
                                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 text-xs text-[#00D1FF] transition-all flex items-center gap-1"
                                >
                                  <Route className="h-3 w-3" /> {name}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-white uppercase mb-4">Trip Category</p>
                <div className="flex flex-wrap gap-3">
                  {(['Urban', 'Peri-Urban', 'Regional'] as TripCategory[]).map(cat => (
                    <div
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`category-pill ${category === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 flex-col sm:flex-row">
                <Button variant="outline" className="w-full sm:w-auto sm:flex-1 h-12 uppercase tracking-widest font-bold bg-white/5 border-white/10" onClick={() => {
                  setTripType('Single');
                  setRoadTripName('');
                  setCategory('Urban');
                  setPeopleCount(1);
                  setDogCount(0);
                  setLuggage('Low');
                  setStartSOC('');
                  setStartEstRange('');
                  window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'history' }));
                }}>
                  Cancel
                </Button>
                <Button className="w-full sm:flex-[2] h-12 uppercase tracking-widest font-bold" onClick={() => setSetupStep(2)}>
                  Next Step <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {setupStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
              <div>
                <p className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#00D1FF]" /> Passengers
                </p>
                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                  <span className="text-3xl font-bold flex-1 text-center">{peopleCount}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-12 h-12 rounded-full bg-white/5 border-white/10" onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}>-</Button>
                    <Button variant="outline" className="w-12 h-12 rounded-full bg-white/5 border-white/10" onClick={() => setPeopleCount(peopleCount + 1)}>+</Button>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2">
                  <Dog className="h-4 w-4 text-orange-400" /> Dogs / Pets
                </p>
                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                  <span className="text-3xl font-bold flex-1 text-center">{dogCount}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-12 h-12 rounded-full bg-white/5 border-white/10" onClick={() => setDogCount(Math.max(0, dogCount - 1))}>-</Button>
                    <Button variant="outline" className="w-12 h-12 rounded-full bg-white/5 border-white/10" onClick={() => setDogCount(dogCount + 1)}>+</Button>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2">
                  <Map className="h-4 w-4 text-green-400" /> Car Load (Luggage)
                </p>
                <div className="flex flex-col gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                  {(['Low', 'Medium', 'High'] as const).map(lvl => (
                    <Button 
                      key={lvl} 
                      variant={luggage === lvl ? 'default' : 'outline'} 
                      className={`w-full h-auto py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest ${luggage === lvl ? 'bg-[#00D1FF] text-black border-transparent' : 'bg-transparent border-white/10 text-white'}`}
                      onClick={() => setLuggage(lvl)}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{lvl}</span>
                        {lvl !== 'Low' && (
                          <span className="text-[10px] opacity-70 normal-case font-normal">
                            {lvl === 'Medium' ? 'Groceries, Daily Items (~30kg)' : 'Family Trip, Bunnings, Heavy Load (~60kg)'}
                          </span>
                        )}
                        {lvl === 'Low' && (
                          <span className="text-[10px] opacity-70 normal-case font-normal">
                            Backpack, Small Items (~10kg)
                          </span>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-[10px] text-white uppercase tracking-widest">Estimated Payload</p>
                <p className="text-lg font-bold text-[#00D1FF]">~{((peopleCount * 80) + (dogCount * 25) + (luggage === 'Low' ? 10 : luggage === 'Medium' ? 30 : luggage === 'High' ? 60 : 0)).toLocaleString()} kg</p>
              </div>
              
              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 h-12 uppercase tracking-widest font-bold bg-white/5 border-white/10" onClick={() => setSetupStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button className="flex-[2] h-12 uppercase tracking-widest font-bold" onClick={() => setSetupStep(3)}>
                  Next Step <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {setupStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Map className="h-4 w-4 text-[#00D1FF]" /> Starting Odometer
                  </label>
                  <Input 
                    type="number" inputMode="decimal"
                    value={startOdo} onChange={(e) => setStartOdo(e.target.value)}
                    placeholder="e.g. 15000"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Battery className="h-4 w-4 text-green-400" /> Starting Battery SOC
                  </label>
                  <Input 
                    type="number" inputMode="numeric"
                    value={startSOC} onChange={(e) => setStartSOC(e.target.value)}
                    placeholder="0 - 100"
                  />
                </div>
                
                <div className="space-y-3 sm:col-span-2">
                  <label className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-400" /> Est. Range (km)
                  </label>
                  <Input 
                    type="number" inputMode="numeric"
                    value={startEstRange} onChange={(e) => setStartEstRange(e.target.value)}
                    placeholder="Car's estimated range"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 flex-col sm:flex-row">
                <Button variant="outline" className="w-full sm:w-auto sm:flex-1 h-14 uppercase tracking-widest font-bold bg-white/5 border-white/10" onClick={() => setSetupStep(2)}>
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <button className="btn-primary w-full sm:flex-[2] py-4 text-lg shadow-xl shadow-blue-500/20" onClick={handleStartTrip} disabled={fetchingWeather}>
                  {fetchingWeather ? 'CAPTURING WEATHER...' : 'START TRIP'}
                  {!fetchingWeather && <Play className="w-4 h-4 ml-2 inline" fill="currentColor" />}
                </button>
              </div>
              <p className="text-[10px] text-center text-white mt-4 flex items-center justify-center gap-1">
                <CloudSun className="h-3 w-3" /> Location & Weather will be automatically captured.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
