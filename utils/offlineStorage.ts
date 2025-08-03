import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  SENSOR_DATA: 'mistcharge_sensor_data',
  STATISTICS: 'mistcharge_statistics',
  COMMAND_QUEUE: 'mistcharge_command_queue',
  SETTINGS: 'mistcharge_settings',
  LAST_SYNC: 'mistcharge_last_sync',
  OFFLINE_MODE: 'mistcharge_offline_mode',
} as const;

// Types
export interface SensorData {
  temperature: number;
  humidity: number;
  waterLevel: number;
  waterCapacity: number;
  batteryLevel: number;
  waterQuality: 'safe' | 'caution' | 'unsafe';
  lastUpdated: string;
  isPoweredOn: boolean;
}

export interface WeeklyStats {
  day: string;
  amount: number;
  max: number;
  min: number;
  readings: number;
}

export interface QueuedCommand {
  id: string;
  command: string;
  parameters?: any;
  timestamp: number;
  retryCount: number;
}

export interface AppSettings {
  autoSync: boolean;
  offlineMode: boolean;
  dataRetentionDays: number;
  syncInterval: number;
  showNetworkIndicator?: boolean;
  networkIndicatorSubtleMode?: boolean;
  showFloatingIndicator?: boolean;
  autoHideIndicator?: boolean;
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  autoSync: true,
  offlineMode: false,
  dataRetentionDays: 30,
  syncInterval: 30000, // 30 seconds
  showNetworkIndicator: true,
  networkIndicatorSubtleMode: true,
  showFloatingIndicator: true,
  autoHideIndicator: true,
};

// Sensor Data Storage
export const storeSensorData = async (data: SensorData): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SENSOR_DATA, JSON.stringify(data));
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('❌ Error storing sensor data:', error);
  }
};

export const getStoredSensorData = async (): Promise<SensorData | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SENSOR_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ Error retrieving sensor data:', error);
    return null;
  }
};

// Statistics Storage
export const storeStatistics = async (stats: WeeklyStats[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
  } catch (error) {
    console.error('❌ Error storing statistics:', error);
  }
};

export const getStoredStatistics = async (): Promise<WeeklyStats[] | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STATISTICS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ Error retrieving statistics:', error);
    return null;
  }
};

// Command Queue Management
export const addToCommandQueue = async (command: string, parameters?: any): Promise<void> => {
  try {
    const queue = await getCommandQueue();
    const newCommand: QueuedCommand = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      command,
      parameters,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    queue.push(newCommand);
    await AsyncStorage.setItem(STORAGE_KEYS.COMMAND_QUEUE, JSON.stringify(queue));
    console.log(`📝 Queued command: ${command}`);
  } catch (error) {
    console.error('❌ Error adding command to queue:', error);
  }
};

export const getCommandQueue = async (): Promise<QueuedCommand[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.COMMAND_QUEUE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Error retrieving command queue:', error);
    return [];
  }
};

export const removeFromCommandQueue = async (commandId: string): Promise<void> => {
  try {
    const queue = await getCommandQueue();
    const filteredQueue = queue.filter(cmd => cmd.id !== commandId);
    await AsyncStorage.setItem(STORAGE_KEYS.COMMAND_QUEUE, JSON.stringify(filteredQueue));
  } catch (error) {
    console.error('❌ Error removing command from queue:', error);
  }
};

export const clearCommandQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.COMMAND_QUEUE);
    console.log('🧹 Command queue cleared');
  } catch (error) {
    console.error('❌ Error clearing command queue:', error);
  }
};

// Settings Management
export const storeSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  try {
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  } catch (error) {
    console.error('❌ Error storing settings:', error);
  }
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('❌ Error retrieving settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Offline Mode Management
export const setOfflineMode = async (offline: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, JSON.stringify(offline));
    await storeSettings({ offlineMode: offline });
    console.log(`🌐 Offline mode: ${offline ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('❌ Error setting offline mode:', error);
  }
};

export const isOfflineMode = async (): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
    return data ? JSON.parse(data) : false;
  } catch (error) {
    console.error('❌ Error checking offline mode:', error);
    return false;
  }
};

// Data Cleanup
export const cleanupOldData = async (): Promise<void> => {
  try {
    const settings = await getSettings();
    const cutoffTime = Date.now() - (settings.dataRetentionDays * 24 * 60 * 60 * 1000);
    
    // Clean up old sensor data (keep only recent data)
    const sensorData = await getStoredSensorData();
    if (sensorData && new Date(sensorData.lastUpdated).getTime() < cutoffTime) {
      await AsyncStorage.removeItem(STORAGE_KEYS.SENSOR_DATA);
      console.log('🧹 Cleaned up old sensor data');
    }
    
    // Clean up old commands (remove commands older than 24 hours)
    const queue = await getCommandQueue();
    const recentQueue = queue.filter(cmd => cmd.timestamp > Date.now() - (24 * 60 * 60 * 1000));
    if (recentQueue.length !== queue.length) {
      await AsyncStorage.setItem(STORAGE_KEYS.COMMAND_QUEUE, JSON.stringify(recentQueue));
      console.log(`🧹 Cleaned up ${queue.length - recentQueue.length} old commands`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up old data:', error);
  }
};

// Export storage keys for testing
export { STORAGE_KEYS }; 