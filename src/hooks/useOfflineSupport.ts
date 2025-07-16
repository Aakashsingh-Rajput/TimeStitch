
import { useState, useEffect, useCallback } from 'react';

interface OfflineData {
  memories: any[];
  projects: any[];
  lastSync: string;
  pendingChanges: OfflineChange[];
}

interface OfflineChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'memory' | 'project';
  data: any;
  timestamp: string;
}

export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    memories: [],
    projects: [],
    lastSync: '',
    pendingChanges: []
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('timestitch-offline');
    if (savedData) {
      try {
        setOfflineData(JSON.parse(savedData));
      } catch (error) {
        console.error('Failed to load offline data:', error);
      }
    }
  }, []);

  // Save offline data to localStorage
  const saveOfflineData = useCallback((data: OfflineData) => {
    setOfflineData(data);
    localStorage.setItem('timestitch-offline', JSON.stringify(data));
  }, []);

  // Add pending change for sync
  const addPendingChange = useCallback((change: Omit<OfflineChange, 'id' | 'timestamp'>) => {
    const newChange: OfflineChange = {
      ...change,
      id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    setOfflineData(prev => {
      const updated = {
        ...prev,
        pendingChanges: [...prev.pendingChanges, newChange]
      };
      saveOfflineData(updated);
      return updated;
    });
  }, [saveOfflineData]);

  // Sync pending changes when online
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline || offlineData.pendingChanges.length === 0) return;

    setIsSyncing(true);
    
    try {
      // In a real implementation, this would sync with your backend
      for (const change of offlineData.pendingChanges) {
        console.log('Syncing change:', change);
        // await syncChangeToServer(change);
      }

      // Clear pending changes after successful sync
      const updatedData = {
        ...offlineData,
        pendingChanges: [],
        lastSync: new Date().toISOString()
      };
      saveOfflineData(updatedData);
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, offlineData, saveOfflineData]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && offlineData.pendingChanges.length > 0) {
      syncPendingChanges();
    }
  }, [isOnline, syncPendingChanges, offlineData.pendingChanges.length]);

  // Cache data for offline use
  const cacheData = useCallback((memories: any[], projects: any[]) => {
    const updatedData = {
      ...offlineData,
      memories,
      projects,
      lastSync: new Date().toISOString()
    };
    saveOfflineData(updatedData);
  }, [offlineData, saveOfflineData]);

  // Get cached data
  const getCachedData = useCallback(() => {
    return {
      memories: offlineData.memories,
      projects: offlineData.projects
    };
  }, [offlineData]);

  return {
    isOnline,
    isSyncing,
    pendingChangesCount: offlineData.pendingChanges.length,
    lastSync: offlineData.lastSync,
    addPendingChange,
    syncPendingChanges,
    cacheData,
    getCachedData
  };
};
