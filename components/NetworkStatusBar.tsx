import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';

interface NetworkStatusBarProps {
  showDetails?: boolean;
  onToggleOffline?: () => void;
}

export function NetworkStatusBar({ showDetails = true, onToggleOffline }: NetworkStatusBarProps) {
  const { 
    networkStatus, 
    isLoading, 
    isOnline, 
    toggleOfflineMode, 
    getConnectionType, 
    getStatusColor, 
    getStatusText 
  } = useNetworkStatus();

  const handleToggleOffline = async () => {
    if (networkStatus.isOfflineMode) {
      // Turning off offline mode - show confirmation
      Alert.alert(
        'Exit Offline Mode',
        'This will attempt to reconnect to the server. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: async () => {
              await toggleOfflineMode();
              onToggleOffline?.();
            },
          },
        ]
      );
    } else {
      // Turning on offline mode
      Alert.alert(
        'Enter Offline Mode',
        'This will work with cached data only. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: async () => {
              await toggleOfflineMode();
              onToggleOffline?.();
            },
          },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loading]}>
        <Text style={styles.loadingText}>Checking connection...</Text>
      </View>
    );
  }

  const statusColor = getStatusColor();
  const statusText = getStatusText();
  const connectionType = getConnectionType();

  return (
    <View style={[styles.container, { backgroundColor: statusColor + '20' }]}>
      <View style={styles.statusRow}>
        <View style={styles.statusIndicator}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>

        {showDetails && (
          <Text style={styles.connectionType}>
            {connectionType}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.offlineButton, { backgroundColor: statusColor + '30' }]}
          onPress={handleToggleOffline}
        >
          <Ionicons 
            name={networkStatus.isOfflineMode ? 'cloud-offline' : 'cloud'} 
            size={16} 
            color={statusColor} 
          />
          <Text style={[styles.offlineButtonText, { color: statusColor }]}>
            {networkStatus.isOfflineMode ? 'Offline' : 'Online'}
          </Text>
        </TouchableOpacity>
      </View>

      {showDetails && !isOnline && (
        <View style={styles.detailsRow}>
          <Text style={styles.detailsText}>
            {networkStatus.isOfflineMode 
              ? 'Working with cached data'
              : 'Using offline mode - check your connection'
            }
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  loading: {
    backgroundColor: '#F0F0F0',
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  connectionType: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  offlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  offlineButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  detailsRow: {
    marginTop: 4,
  },
  detailsText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
}); 