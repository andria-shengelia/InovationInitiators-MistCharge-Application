import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { isOfflineMode, setOfflineMode } from '../utils/offlineStorage';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isOfflineMode: boolean;
  lastChecked: Date;
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: null,
    isOfflineMode: false,
    lastChecked: new Date(),
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupNetworkMonitoring = async () => {
      try {
        // Get initial network state
        const state = await NetInfo.fetch();
        const offlineMode = await isOfflineMode();

        setNetworkStatus({
          isConnected: state.isConnected ?? true,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
          isOfflineMode: offlineMode,
          lastChecked: new Date(),
        });

        // Subscribe to network changes
        unsubscribe = NetInfo.addEventListener((state) => {
          setNetworkStatus(prev => ({
            ...prev,
            isConnected: state.isConnected ?? prev.isConnected,
            isInternetReachable: state.isInternetReachable,
            type: state.type,
            lastChecked: new Date(),
          }));

          console.log(`🌐 Network status changed:`, {
            connected: state.isConnected,
            internetReachable: state.isInternetReachable,
            type: state.type,
          });
        });

        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error setting up network monitoring:', error);
        setIsLoading(false);
      }
    };

    setupNetworkMonitoring();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const toggleOfflineMode = async () => {
    const newOfflineMode = !networkStatus.isOfflineMode;
    await setOfflineMode(newOfflineMode);
    setNetworkStatus(prev => ({
      ...prev,
      isOfflineMode: newOfflineMode,
    }));
  };

  const isOnline = networkStatus.isConnected && 
                   networkStatus.isInternetReachable && 
                   !networkStatus.isOfflineMode;

  const getConnectionType = () => {
    if (networkStatus.isOfflineMode) return 'Offline Mode';
    if (!networkStatus.isConnected) return 'No Connection';
    if (!networkStatus.isInternetReachable) return 'No Internet';
    return networkStatus.type || 'Unknown';
  };

  const getStatusColor = () => {
    if (networkStatus.isOfflineMode) return '#FF9500'; // Orange
    if (!networkStatus.isConnected) return '#FF3B30'; // Red
    if (!networkStatus.isInternetReachable) return '#FF9500'; // Orange
    return '#34C759'; // Green
  };

  const getStatusText = () => {
    if (networkStatus.isOfflineMode) return 'Offline Mode';
    if (!networkStatus.isConnected) return 'No Connection';
    if (!networkStatus.isInternetReachable) return 'No Internet';
    return 'Online';
  };

  return {
    networkStatus,
    isLoading,
    isOnline,
    toggleOfflineMode,
    getConnectionType,
    getStatusColor,
    getStatusText,
  };
} 