import { useState, useEffect, useCallback } from 'react'

interface Track {
  id: string
  name: string
  path_lower: string
  size: number
  fileType: string
  artist: string
  album: string
  title: string
  duration?: number | null
}

interface OfflineTrack extends Track {
  audioBlob: Blob
  downloadedAt: number
  lastPlayed?: number
}

interface DownloadProgress {
  trackId: string
  progress: number
  isDownloading: boolean
}

export function useOfflineStorage() {
  const [offlineTracks, setOfflineTracks] = useState<OfflineTrack[]>([])
  const [downloadProgress, setDownloadProgress] = useState<Record<string, DownloadProgress>>({})
  const [storageUsed, setStorageUsed] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize IndexedDB
  const initDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ReplayOfflineDB', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object store for offline tracks
        if (!db.objectStoreNames.contains('offlineTracks')) {
          const store = db.createObjectStore('offlineTracks', { keyPath: 'id' })
          store.createIndex('downloadedAt', 'downloadedAt', { unique: false })
          store.createIndex('lastPlayed', 'lastPlayed', { unique: false })
        }
      }
    })
  }, [])

  // Load offline tracks from IndexedDB
  const loadOfflineTracks = useCallback(async () => {
    try {
      const db = await initDB()
      const transaction = db.transaction(['offlineTracks'], 'readonly')
      const store = transaction.objectStore('offlineTracks')
      const request = store.getAll()
      
      request.onsuccess = () => {
        const tracks = request.result as OfflineTrack[]
        setOfflineTracks(tracks)
        
        // Calculate storage used
        const used = tracks.reduce((sum, track) => sum + track.audioBlob.size, 0)
        setStorageUsed(used)
        setIsInitialized(true)
      }
    } catch (error) {
      console.error('Failed to load offline tracks:', error)
      setIsInitialized(true)
    }
  }, [initDB])

  // Save track to IndexedDB
  const saveTrackToDB = useCallback(async (track: OfflineTrack): Promise<void> => {
    const db = await initDB()
    const transaction = db.transaction(['offlineTracks'], 'readwrite')
    const store = transaction.objectStore('offlineTracks')
    
    return new Promise((resolve, reject) => {
      const request = store.put(track)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }, [initDB])

  // Remove track from IndexedDB
  const removeTrackFromDB = useCallback(async (trackId: string): Promise<void> => {
    const db = await initDB()
    const transaction = db.transaction(['offlineTracks'], 'readwrite')
    const store = transaction.objectStore('offlineTracks')
    
    return new Promise((resolve, reject) => {
      const request = store.delete(trackId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }, [initDB])

  // Download track for offline use
  const downloadTrack = useCallback(async (track: Track): Promise<void> => {
    const trackId = track.id
    
    // Set initial download state
    setDownloadProgress(prev => ({
      ...prev,
      [trackId]: { trackId, progress: 0, isDownloading: true }
    }))

    try {
      // In demo mode, simulate download with a timer
      const isDemoMode = localStorage.getItem('replay-demo-mode') === 'true'
      
      if (isDemoMode) {
        // Simulate download progress
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 20
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
          }
          
          setDownloadProgress(prev => ({
            ...prev,
            [trackId]: { trackId, progress, isDownloading: progress < 100 }
          }))
        }, 200)

        // Wait for simulation to complete
        await new Promise(resolve => {
          const checkComplete = () => {
            if (progress >= 100) {
              resolve(void 0)
            } else {
              setTimeout(checkComplete, 100)
            }
          }
          checkComplete()
        })

        // Create a dummy blob for demo
        const dummyAudio = new Blob(['dummy audio data'], { type: 'audio/mpeg' })
        
        const offlineTrack: OfflineTrack = {
          ...track,
          audioBlob: dummyAudio,
          downloadedAt: Date.now()
        }

        await saveTrackToDB(offlineTrack)
        setOfflineTracks(prev => [...prev.filter(t => t.id !== trackId), offlineTrack])
        setStorageUsed(prev => prev + dummyAudio.size)
        
      } else {
        // Real implementation would download from Dropbox
        // This is a placeholder for the actual implementation
        throw new Error('Real download not implemented yet')
      }
      
      // Clear download progress
      setDownloadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[trackId]
        return newProgress
      })
      
    } catch (error) {
      console.error('Download failed:', error)
      setDownloadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[trackId]
        return newProgress
      })
      throw error
    }
  }, [saveTrackToDB])

  // Remove offline track
  const removeOfflineTrack = useCallback(async (trackId: string): Promise<void> => {
    try {
      const track = offlineTracks.find(t => t.id === trackId)
      if (track) {
        await removeTrackFromDB(trackId)
        setOfflineTracks(prev => prev.filter(t => t.id !== trackId))
        setStorageUsed(prev => prev - track.audioBlob.size)
      }
    } catch (error) {
      console.error('Failed to remove offline track:', error)
      throw error
    }
  }, [offlineTracks, removeTrackFromDB])

  // Check if track is downloaded
  const isTrackDownloaded = useCallback((trackId: string): boolean => {
    return offlineTracks.some(t => t.id === trackId)
  }, [offlineTracks])

  // Get offline audio URL
  const getOfflineAudioURL = useCallback((trackId: string): string | null => {
    const track = offlineTracks.find(t => t.id === trackId)
    if (track) {
      return URL.createObjectURL(track.audioBlob)
    }
    return null
  }, [offlineTracks])

  // Update last played for offline track
  const updateLastPlayed = useCallback(async (trackId: string): Promise<void> => {
    const track = offlineTracks.find(t => t.id === trackId)
    if (track) {
      const updatedTrack = { ...track, lastPlayed: Date.now() }
      await saveTrackToDB(updatedTrack)
      setOfflineTracks(prev => prev.map(t => t.id === trackId ? updatedTrack : t))
    }
  }, [offlineTracks, saveTrackToDB])

  // Clear all offline tracks
  const clearAllOfflineTracks = useCallback(async (): Promise<void> => {
    try {
      const db = await initDB()
      const transaction = db.transaction(['offlineTracks'], 'readwrite')
      const store = transaction.objectStore('offlineTracks')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      
      setOfflineTracks([])
      setStorageUsed(0)
    } catch (error) {
      console.error('Failed to clear offline tracks:', error)
      throw error
    }
  }, [initDB])

  // Format storage size
  const formatStorageSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  // Initialize on mount
  useEffect(() => {
    loadOfflineTracks()
  }, [loadOfflineTracks])

  return {
    // State
    offlineTracks,
    downloadProgress,
    storageUsed: formatStorageSize(storageUsed),
    storageUsedBytes: storageUsed,
    isInitialized,
    
    // Actions
    downloadTrack,
    removeOfflineTrack,
    isTrackDownloaded,
    getOfflineAudioURL,
    updateLastPlayed,
    clearAllOfflineTracks,
    
    // Utils
    formatStorageSize
  }
}