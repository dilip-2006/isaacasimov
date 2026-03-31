import { SystemData, User, Component, BorrowRequest, Notification, LoginSession } from '../types';

interface CloudConfig {
  adminEmail: string;
  syncInterval: number;
  apiEndpoint: string;
}

class CloudService {
  private config: CloudConfig = {
    adminEmail: 'admin@isaacasimov.in',
    syncInterval: 30000, // 30 seconds
    apiEndpoint: 'https://api.isaacasimov.in' // This would be your actual API endpoint
  };

  private syncTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;
  private pendingChanges: any[] = [];

  constructor() {
    this.setupOnlineListener();
    this.startAutoSync();
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private startAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      if (this.isOnline) {
        this.syncToCloud();
      }
    }, this.config.syncInterval);
  }

  async syncToCloud(): Promise<boolean> {
    try {
      if (!this.isOnline) {
        console.log('Offline - sync postponed');
        return false;
      }

      const localData = this.getLocalData();
      const cloudData = await this.fetchFromCloud();

      // Merge data with conflict resolution
      const mergedData = this.mergeData(localData, cloudData);
      
      // Save merged data locally
      this.saveLocalData(mergedData);
      
      // Push to cloud
      await this.pushToCloud(mergedData);
      
      console.log('Cloud sync successful');
      return true;
    } catch (error) {
      console.error('Cloud sync failed:', error);
      return false;
    }
  }

  private async fetchFromCloud(): Promise<SystemData> {
    // In a real implementation, this would fetch from your cloud API
    // For now, we'll simulate with localStorage backup
    try {
      const cloudData = localStorage.getItem('cloudBackup');
      if (cloudData) {
        return JSON.parse(cloudData);
      }
    } catch (error) {
      console.error('Error fetching cloud data:', error);
    }
    
    return this.getDefaultData();
  }

  private async pushToCloud(data: SystemData): Promise<void> {
    // In a real implementation, this would push to your cloud API
    // For now, we'll simulate with localStorage backup
    try {
      localStorage.setItem('cloudBackup', JSON.stringify(data));
      localStorage.setItem('lastCloudSync', new Date().toISOString());
    } catch (error) {
      console.error('Error pushing to cloud:', error);
      throw error;
    }
  }

  private mergeData(localData: SystemData, cloudData: SystemData): SystemData {
    // Simple merge strategy - in production, you'd want more sophisticated conflict resolution
    const merged: SystemData = {
      users: this.mergeArrays(localData.users, cloudData.users, 'id'),
      components: this.mergeArrays(localData.components, cloudData.components, 'id'),
      requests: this.mergeArrays(localData.requests, cloudData.requests, 'id'),
      notifications: this.mergeArrays(localData.notifications, cloudData.notifications, 'id'),
      loginSessions: this.mergeArrays(
        localData.loginSessions || [], 
        cloudData.loginSessions || [], 
        'id'
      )
    };

    return merged;
  }

  private mergeArrays<T extends Record<string, any>>(
    local: T[], 
    cloud: T[], 
    idField: string
  ): T[] {
    const merged = [...cloud];
    
    local.forEach(localItem => {
      const existingIndex = merged.findIndex(item => item[idField] === localItem[idField]);
      if (existingIndex >= 0) {
        // Use the most recently updated item
        const localTime = new Date(localItem.updatedAt || localItem.createdAt || 0);
        const cloudTime = new Date(merged[existingIndex].updatedAt || merged[existingIndex].createdAt || 0);
        
        if (localTime > cloudTime) {
          merged[existingIndex] = localItem;
        }
      } else {
        merged.push(localItem);
      }
    });

    return merged;
  }

  private getLocalData(): SystemData {
    try {
      const data = localStorage.getItem('isaacLabData');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading local data:', error);
    }
    return this.getDefaultData();
  }

  private saveLocalData(data: SystemData): void {
    try {
      localStorage.setItem('isaacLabData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving local data:', error);
    }
  }

  private getDefaultData(): SystemData {
    return {
      users: [
        {
          id: 'admin-1',
          name: 'Administrator',
          email: 'admin@isaacasimov.in',
          role: 'admin',
          registeredAt: new Date().toISOString(),
        }
      ],
      components: [
        {
          id: 'comp-1',
          name: 'Arduino Uno R3',
          totalQuantity: 25,
          availableQuantity: 25,
          category: 'Microcontroller',
          description: 'Arduino Uno R3 development board'
        },
        {
          id: 'comp-2',
          name: 'L298N Motor Driver',
          totalQuantity: 15,
          availableQuantity: 15,
          category: 'Motor Driver',
          description: 'Dual H-Bridge Motor Driver'
        },
        {
          id: 'comp-3',
          name: 'Ultrasonic Sensor HC-SR04',
          totalQuantity: 20,
          availableQuantity: 20,
          category: 'Sensor',
          description: 'Ultrasonic distance sensor'
        },
        {
          id: 'comp-4',
          name: 'Servo Motor SG90',
          totalQuantity: 30,
          availableQuantity: 30,
          category: 'Actuator',
          description: '9g micro servo motor'
        },
        {
          id: 'comp-5',
          name: 'ESP32 Development Board',
          totalQuantity: 12,
          availableQuantity: 12,
          category: 'Microcontroller',
          description: 'WiFi and Bluetooth enabled microcontroller'
        }
      ],
      requests: [],
      notifications: [],
      loginSessions: []
    };
  }

  async syncPendingChanges(): Promise<void> {
    if (this.pendingChanges.length > 0 && this.isOnline) {
      try {
        await this.syncToCloud();
        this.pendingChanges = [];
      } catch (error) {
        console.error('Failed to sync pending changes:', error);
      }
    }
  }

  addPendingChange(change: any): void {
    this.pendingChanges.push({
      ...change,
      timestamp: new Date().toISOString()
    });
  }

  getConnectionStatus(): { isOnline: boolean; lastSync: string | null } {
    return {
      isOnline: this.isOnline,
      lastSync: localStorage.getItem('lastCloudSync')
    };
  }

  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
  }
}

export const cloudService = new CloudService();