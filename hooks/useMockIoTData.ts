import { useState, useEffect, useRef } from 'react';

interface IoTData {
  temperature: number;
  humidity: number;
  waterLevel: number;
  waterCapacity: number;
  batteryLevel: number;
  waterQuality: 'safe' | 'caution' | 'unsafe';
  weeklyStats: Array<{ day: string; amount: number }>;
}

export function useMockIoTData() {
  const [data, setData] = useState<IoTData>({
    temperature: 23,
    humidity: 84,
    waterLevel: 2.3,
    waterCapacity: 10,
    batteryLevel: 89,
    waterQuality: 'safe',
    weeklyStats: [
      { day: 'Mon', amount: 1.8 },
      { day: 'Tue', amount: 2.4 },
      { day: 'Wed', amount: 2.1 },
      { day: 'Thu', amount: 3.2 },
      { day: 'Fri', amount: 2.8 },
      { day: 'Sat', amount: 3.5 },
      { day: 'Sun', amount: 2.9 },
    ],
  });

  const intervalRef = useRef<NodeJS.Timeout>();

  const generateRandomVariation = (base: number, variation: number) => {
    return base + (Math.random() - 0.5) * variation;
  };

  const updateData = () => {
    setData(prevData => ({
      ...prevData,
      temperature: Math.round(generateRandomVariation(23, 4) * 10) / 10,
      humidity: Math.round(generateRandomVariation(84, 10)),
      waterLevel: Math.round(generateRandomVariation(2.3, 0.5) * 10) / 10,
      batteryLevel: Math.max(0, Math.min(100, Math.round(generateRandomVariation(89, 3)))),
      waterQuality: Math.random() > 0.95 ? 'caution' : 'safe', // Occasionally show caution
    }));
  };

  const refreshData = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    updateData();
  };

  useEffect(() => {
    // No automatic updates - data is static until manually refreshed
    // This simulates the real IoT behavior where data only changes via MQTT
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { data, refreshData };
}