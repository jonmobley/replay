import { create } from 'zustand'
import { Track } from '../data/tracks'
import { useAppStore } from './app'
import { useUserStore } from './user'

export interface Playlist {
  id: string
  name: string
  trackIds: string[]
}

export const useStore = create(() => ({
  ...useAppStore.getState(),
  ...useUserStore.getState(),
}))

// Subscribe to changes in the individual stores and update the combined store
useAppStore.subscribe((state) => useStore.setState(state))
useUserStore.subscribe((state) => useStore.setState(state))
