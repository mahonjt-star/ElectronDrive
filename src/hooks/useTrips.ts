import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trip } from '../types';

export function useTrips(userId: string | undefined) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTrips([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'trips'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTrips = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate() || new Date(),
        } as Trip;
      });
      
      // Sort client-side to avoid composite index requirement
      newTrips.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
      
      setTrips(newTrips);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching trips:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { trips, loading };
}
