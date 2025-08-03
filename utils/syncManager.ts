import { 
  getCommandQueue, 
  removeFromCommandQueue, 
  clearCommandQueue,
  storeSensorData,
  storeStatistics,
  getStoredSensorData,
  getStoredStatistics,
  QueuedCommand
} from './offlineStorage';

// API base URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.60.210.109:3001/api';

export interface SyncResult {
  success: boolean;
  commandsSent: number;
  commandsFailed: number;
  dataUpdated: boolean;
  error?: string;
}

export interface SyncOptions {
  forceSync?: boolean;
  syncCommands?: boolean;
  syncData?: boolean;
}

class SyncManager {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  // Send queued commands to server
  private async sendQueuedCommands(): Promise<{ sent: number; failed: number }> {
    const queue = await getCommandQueue();
    let sent = 0;
    let failed = 0;

    for (const command of queue) {
      try {
        const response = await fetch(`${API_BASE_URL}/command`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            command: command.command,
            parameters: command.parameters,
          }),
        });

        if (response.ok) {
          await removeFromCommandQueue(command.id);
          sent++;
          console.log(`✅ Command sent successfully: ${command.command}`);
        } else {
          failed++;
          console.log(`❌ Command failed: ${command.command}`);
        }
      } catch (error) {
        failed++;
        console.error(`❌ Error sending command ${command.command}:`, error);
      }
    }

    return { sent, failed };
  }

  // Fetch latest data from server
  private async fetchLatestData(): Promise<boolean> {
    try {
      // Fetch sensor data
      const statusResponse = await fetch(`${API_BASE_URL}/status`);
      if (statusResponse.ok) {
        const sensorData = await statusResponse.json();
        await storeSensorData(sensorData);
        console.log('📊 Sensor data synced from server');
      }

      // Fetch statistics
      const statsResponse = await fetch(`${API_BASE_URL}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        await storeStatistics(statsData);
        console.log('📈 Statistics synced from server');
      }

      return true;
    } catch (error) {
      console.error('❌ Error fetching latest data:', error);
      return false;
    }
  }

  // Main sync function
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('🔄 Sync already in progress, skipping...');
      return {
        success: false,
        commandsSent: 0,
        commandsFailed: 0,
        dataUpdated: false,
        error: 'Sync already in progress',
      };
    }

    this.isSyncing = true;
    console.log('🔄 Starting sync...');

    try {
      let commandsSent = 0;
      let commandsFailed = 0;
      let dataUpdated = false;

      // Send queued commands
      if (options.syncCommands !== false) {
        const commandResult = await this.sendQueuedCommands();
        commandsSent = commandResult.sent;
        commandsFailed = commandResult.failed;
      }

      // Fetch latest data
      if (options.syncData !== false) {
        dataUpdated = await this.fetchLatestData();
      }

      const success = commandsFailed === 0 && (options.syncData === false || dataUpdated);

      console.log(`✅ Sync completed: ${commandsSent} commands sent, ${commandsFailed} failed`);

      return {
        success,
        commandsSent,
        commandsFailed,
        dataUpdated,
      };
    } catch (error) {
      console.error('❌ Sync failed:', error);
      return {
        success: false,
        commandsSent: 0,
        commandsFailed: 0,
        dataUpdated: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.isSyncing = false;
    }
  }

  // Start automatic sync
  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    this.syncInterval = setInterval(() => {
      this.sync();
    }, intervalMs);

    console.log(`🔄 Auto-sync started (${intervalMs}ms interval)`);
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🛑 Auto-sync stopped');
    }
  }

  // Get sync status
  getSyncStatus(): { isSyncing: boolean; hasAutoSync: boolean } {
    return {
      isSyncing: this.isSyncing,
      hasAutoSync: this.syncInterval !== null,
    };
  }

  // Force sync all data
  async forceSync(): Promise<SyncResult> {
    return this.sync({ forceSync: true, syncCommands: true, syncData: true });
  }

  // Sync only commands
  async syncCommands(): Promise<SyncResult> {
    return this.sync({ syncCommands: true, syncData: false });
  }

  // Sync only data
  async syncData(): Promise<SyncResult> {
    return this.sync({ syncCommands: false, syncData: true });
  }

  // Get queue status
  async getQueueStatus(): Promise<{ pending: number; oldest: Date | null }> {
    const queue = await getCommandQueue();
    const oldest = queue.length > 0 ? new Date(Math.min(...queue.map(cmd => cmd.timestamp))) : null;
    
    return {
      pending: queue.length,
      oldest,
    };
  }

  // Clear all queued commands
  async clearQueue(): Promise<void> {
    await clearCommandQueue();
    console.log('🧹 Command queue cleared');
  }
}

// Export singleton instance
export const syncManager = new SyncManager(); 