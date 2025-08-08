import { create } from 'zustand'

type AppState = 'checking' | 'disconnected' | 'connected' | 'demo'

interface AppStore {
  appState: AppState
  setAppState: (appState: AppState) => void
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
}

export const useAppStore = create<AppStore>((set) => ({
  appState: 'checking',
  setAppState: (appState) => set({ appState }),
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
}))

