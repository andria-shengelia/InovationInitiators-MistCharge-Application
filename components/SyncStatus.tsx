import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { syncManager } from '../utils/syncManager';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface SyncStatusProps {
  compact?: boolean;
}

export function SyncStatus({ compact = false }: SyncStatusProps) {
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [queueStatus, setQueueStatus] = useState<{ pending: number; oldest: Date | null }>({
    pending: 0,
    oldest: null,
  });

  useEffect(() => {
    // Initial status check only - no automatic polling
    // Status will be updated manually when sync operations occur
    updateSyncStatus();
    
    return () => {
      // No interval to clear
    };
  }, []);

  const updateSyncStatus = async () => {
    const status = syncManager.getSyncStatus();
    setIsSyncing(status.isSyncing);
    
    const queue = await syncManager.getQueueStatus();
    setQueueStatus(queue);
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'Cannot sync while offline. Please check your connection.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isSyncing) {
      Alert.alert('Sync in Progress', 'Please wait for the current sync to complete.');
      return;
    }

    try {
      setIsSyncing(true);
      const result = await syncManager.forceSync();
      
      if (result.success) {
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${result.commandsSent} commands and updated data.`,
          [{ text: 'OK' }]
        );
        setLastSync(new Date());
      } else {
        Alert.alert(
          'Sync Failed',
          `Failed to sync: ${result.error || 'Unknown error'}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Sync Error',
        'An unexpected error occurred during sync.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSyncing(false);
      updateSyncStatus();
    }
  };

  const handleClearQueue = async () => {
    Alert.alert(
      'Clear Command Queue',
      `Are you sure you want to clear ${queueStatus.pending} pending commands?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await syncManager.clearQueue();
            updateSyncStatus();
            Alert.alert('Queue Cleared', 'All pending commands have been removed.');
          },
        },
      ]
    );
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <TouchableOpacity
          style={[styles.syncButton, isSyncing && styles.syncing]}
          onPress={handleManualSync}
          disabled={isSyncing || !isOnline}
        >
          <Ionicons
            name={isSyncing ? 'sync' : 'sync-outline'}
            size={16}
            color={isOnline ? '#007AFF' : '#999'}
          />
        </TouchableOpacity>
        
        {queueStatus.pending > 0 && (
          <View style={styles.queueBadge}>
            <Text style={styles.queueText}>{queueStatus.pending}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          <Text style={styles.statusLabel}>Sync Status</Text>
          <Text style={[styles.statusText, isSyncing && styles.syncingText]}>
            {isSyncing ? 'Syncing...' : isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.syncButton, isSyncing && styles.syncing]}
          onPress={handleManualSync}
          disabled={isSyncing || !isOnline}
        >
          <Ionicons
            name={isSyncing ? 'sync' : 'sync-outline'}
            size={20}
            color={isOnline ? '#007AFF' : '#999'}
          />
          <Text style={[styles.syncButtonText, { color: isOnline ? '#007AFF' : '#999' }]}>
            {isSyncing ? 'Syncing' : 'Sync'}
          </Text>
        </TouchableOpacity>
      </View>

      {queueStatus.pending > 0 && (
        <View style={styles.queueRow}>
          <View style={styles.queueInfo}>
            <Text style={styles.queueLabel}>Pending Commands</Text>
            <Text style={styles.queueCount}>{queueStatus.pending}</Text>
            {queueStatus.oldest && (
              <Text style={styles.queueTime}>
                Oldest: {queueStatus.oldest.toLocaleTimeString()}
              </Text>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearQueue}
          >
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {lastSync && (
        <Text style={styles.lastSyncText}>
          Last sync: {lastSync.toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  syncingText: {
    color: '#007AFF',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  syncing: {
    backgroundColor: '#E3F2FD',
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    marginBottom: 8,
  },
  queueInfo: {
    flex: 1,
  },
  queueLabel: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 2,
  },
  queueCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
  },
  queueTime: {
    fontSize: 10,
    color: '#856404',
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#FF3B30',
    marginLeft: 4,
  },
  queueBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  queueText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  lastSyncText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
}); 