import { useState, useEffect, useRef } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { 
  storeSensorData, 
  getStoredSensorData, 
  storeStatistics, 
  getStoredStatistics,
  addToCommandQueue,
  SensorData as StoredSensorData,
  WeeklyStats as StoredWeeklyStats
} from '../utils/offlineStorage';
import { syncManager } from '../utils/syncManager';

interface IoTData {
  temperature: number;
  humidity: number;
  waterLevel: number;
  waterCapacity: number;
  batteryLevel: number;
  waterQuality: 'safe' | 'caution' | 'unsafe';
  lastUpdated: string;
  isPoweredOn: boolean;
}

interface WeeklyStats {
  day: string;
  amount: number;
  max: number;
  min: number;
}

interface APIResponse {
  temperature: number;
  humidity: number;
  waterLevel: number;
  batteryLevel: number;
  waterQuality: string;
  lastUpdated: string;
  isPoweredOn?: boolean;
}

export function useRealIoTData() {
  const { isOnline } = useNetworkStatus();
  
  const [data, setData] = useState<IoTData>({
    temperature: 0,
    humidity: 0,
    waterLevel: 0,
    waterCapacity: 10,
    batteryLevel: 0,
    waterQuality: 'safe',
    lastUpdated: new Date().toISOString(),
    isPoweredOn: false,
  });

  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([
    { day: 'Mon', amount: 1.8, max: 2.1, min: 1.5 },
    { day: 'Tue', amount: 2.1, max: 2.3, min: 1.9 },
    { day: 'Wed', amount: 1.9, max: 2.0, min: 1.7 },
    { day: 'Thu', amount: 2.2, max: 2.4, min: 2.0 },
    { day: 'Fri', amount: 1.7, max: 1.9, min: 1.5 },
    { day: 'Sat', amount: 2.0, max: 2.2, min: 1.8 },
    { day: 'Sun', amount: 1.6, max: 1.8, min: 1.4 }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Use the correct API URL - dynamically detect IP
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.60.210.109:3001/api';
  console.log('🌐 Using API URL:', API_BASE_URL);

  const fetchStatusData = async () => {
    try {
      if (!isOnline) {
        console.log('📱 Offline mode - loading cached data');
        const cachedData = await getStoredSensorData();
        if (cachedData) {
          setData({
            temperature: cachedData.temperature,
            humidity: cachedData.humidity,
            waterLevel: cachedData.waterLevel,
            waterCapacity: cachedData.waterCapacity,
            batteryLevel: cachedData.batteryLevel,
            waterQuality: cachedData.waterQuality,
            lastUpdated: cachedData.lastUpdated,
            isPoweredOn: cachedData.isPoweredOn,
          });
          setIsOffline(true);
          setError(null);
          return;
        }
      }

      console.log('🔗 Fetching data from:', `${API_BASE_URL}/status`);
      const response = await fetch(`${API_BASE_URL}/status`);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiData: APIResponse = await response.json();
      console.log('📊 Received data:', apiData);
      
      const newData = {
        temperature: apiData.temperature,
        humidity: apiData.humidity,
        waterLevel: apiData.waterLevel,
        waterCapacity: 10, // Fixed capacity
        batteryLevel: apiData.batteryLevel,
        waterQuality: apiData.waterQuality === 'safe' ? 'safe' : 
                     apiData.waterQuality === 'unsafe' ? 'unsafe' : 'caution',
        lastUpdated: apiData.lastUpdated,
        isPoweredOn: apiData.isPoweredOn ?? false,
      };
      
      setData(newData);
      setIsOffline(false);
      setError(null);
      
      // Store data locally for offline use
      await storeSensorData(newData);
    } catch (err) {
      console.error('❌ Error fetching status data:', err);
      
      // Try to load cached data as fallback
      const cachedData = await getStoredSensorData();
      if (cachedData) {
        console.log('📱 Loading cached data as fallback');
        setData({
          temperature: cachedData.temperature,
          humidity: cachedData.humidity,
          waterLevel: cachedData.waterLevel,
          waterCapacity: cachedData.waterCapacity,
          batteryLevel: cachedData.batteryLevel,
          waterQuality: cachedData.waterQuality,
          lastUpdated: cachedData.lastUpdated,
          isPoweredOn: cachedData.isPoweredOn,
        });
        setIsOffline(true);
        setError('Using cached data - check your connection');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
    }
  };

  const fetchStatsData = async () => {
    try {
      if (!isOnline) {
        console.log('📱 Offline mode - loading cached stats');
        const cachedStats = await getStoredStatistics();
        if (cachedStats) {
          setWeeklyStats(cachedStats);
          return;
        }
      }

      console.log('📈 Fetching stats from:', `${API_BASE_URL}/stats`);
      const response = await fetch(`${API_BASE_URL}/stats?days=7`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const statsData: WeeklyStats[] = await response.json();
      console.log('📊 Received stats:', statsData);
      setWeeklyStats(statsData);
      
      // Store stats locally for offline use
      await storeStatistics(statsData);
    } catch (err) {
      console.error('❌ Error fetching stats data:', err);
      
      // Try to load cached stats as fallback
      const cachedStats = await getStoredStatistics();
      if (cachedStats) {
        console.log('📱 Loading cached stats as fallback');
        setWeeklyStats(cachedStats);
      } else {
        // Use fallback data if no cache available
        console.log('📱 Using fallback stats data');
        setWeeklyStats([
          { day: 'Mon', amount: 1.8, max: 2.1, min: 1.5 },
          { day: 'Tue', amount: 2.1, max: 2.3, min: 1.9 },
          { day: 'Wed', amount: 1.9, max: 2.0, min: 1.7 },
          { day: 'Thu', amount: 2.2, max: 2.4, min: 2.0 },
          { day: 'Fri', amount: 1.7, max: 1.9, min: 1.5 },
          { day: 'Sat', amount: 2.0, max: 2.2, min: 1.8 },
          { day: 'Sun', amount: 1.6, max: 1.8, min: 1.4 }
        ]);
      }
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchStatusData(), fetchStatsData()]);
    setLoading(false);
  };

  const togglePower = async (newState: boolean) => {
    try {
      if (!isOnline) {
        console.log('📱 Offline mode - queuing power command');
        await addToCommandQueue('power_toggle', {
          timestamp: new Date().toISOString(),
          source: 'mobile_app',
          isOn: newState
        });
        
        // Update local state immediately for better UX
        setData(prev => ({
          ...prev,
          isPoweredOn: newState
        }));
        
        return { success: true, message: 'Command queued for later' };
      }

      console.log('🔌 Sending power command:', newState ? 'ON' : 'OFF');
      const response = await fetch(`${API_BASE_URL}/power`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isOn: newState
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Power command result:', result);
      
      // Update local state immediately for better UX
      setData(prev => ({
        ...prev,
        isPoweredOn: newState
      }));

      return result;
    } catch (err) {
      console.error('❌ Error sending power command:', err);
      
      // Queue command for later if online but failed
      if (isOnline) {
        console.log('📝 Queuing failed power command for retry');
        await addToCommandQueue('power_toggle', {
          timestamp: new Date().toISOString(),
          source: 'mobile_app',
          isOn: newState
        });
      }
      
      throw err;
    }
  };

  useEffect(() => {
    // Initial data fetch only - no automatic polling
    // Data will be updated only when MQTT messages are received
    refreshData();

    // No automatic intervals - data is static until MQTT updates
    // The backend will handle MQTT messages and update the stored data
    // Manual refresh is available via pull-to-refresh

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { 
    data, 
    weeklyStats,
    loading, 
    error, 
    isOffline,
    refreshData,
    togglePower
  };
} 