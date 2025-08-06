import { create } from 'zustand'
import { DEMO_TRACKS, Track } from '../data/tracks'
import { projectId, publicAnonKey } from '../utils/supabase/info'

type AppState = 'checking' | 'disconnected' | 'connected' | 'demo'

interface AppStore {
  appState: AppState
  setAppState: (appState: AppState) => void
  allTracks: Track[]
  setAllTracks: (tracks: Track[]) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  isOnline: boolean
  setIsOnline: (isOnline: boolean) => void
  isDemoMode: boolean
  setIsDemoMode: (isDemoMode: boolean) => void
  currentView: string
  setCurrentView: (currentView: string) => void
  searchQuery: string
  setSearchQuery: (searchQuery: string) => void
  enterDemoMode: () => void
  exitDemoMode: () => void

}

export const useStore = create<AppStore>((set) => ({
  appState: 'checking',
  setAppState: (appState) => set({ appState }),
  allTracks: [],
  setAllTracks: (tracks) => set({ allTracks: tracks }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),
  isOnline: navigator.onLine,
  setIsOnline: (isOnline) => set({ isOnline }),
  isDemoMode: false,
  setIsDemoMode: (isDemoMode) => set({ isDemoMode }),
  currentView: 'home',
  setCurrentView: (currentView) => set({ currentView }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  enterDemoMode: () => {
    set({
      allTracks: DEMO_TRACKS,
      appState: 'demo',
      isDemoMode: true,
      error: null,
    })
    localStorage.setItem('replay-demo-mode', 'true')
    
    // Add some sample recently played data
    const sampleRecentlyPlayed = [
      { trackId: 'demo-1', timestamp: Date.now() - 1000 * 60 * 30 },
      { trackId: 'demo-2', timestamp: Date.now() - 1000 * 60 * 60 * 2 },
      { trackId: 'demo-6', timestamp: Date.now() - 1000 * 60 * 60 * 4 },
      { trackId: 'demo-3', timestamp: Date.now() - 1000 * 60 * 60 * 24 },
      { trackId: 'demo-8', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2 },
    ]
    localStorage.setItem('replay-recently-played', JSON.stringify(sampleRecentlyPlayed))
  },
  exitDemoMode: () => {
    set({
      allTracks: [],
      appState: 'disconnected',
      isDemoMode: false,
      searchQuery: '',
    })
    localStorage.removeItem('replay-demo-mode')
    localStorage.removeItem('replay-recently-played')
    // Don't call checkDropboxConnection directly to avoid circular dependency
    // The app will handle connection checking in the useEffect
  },

}))