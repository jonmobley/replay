import { create } from 'zustand'
import { Track, DEMO_TRACKS } from '../data/tracks'
import { Playlist } from '.'

interface UserState {
  allTracks: Track[]
  setAllTracks: (tracks: Track[]) => void
  favoriteTrackIds: string[]
  setFavoriteTrackIds: (trackIds: string[]) => void
  toggleFavorite: (trackId: string) => void
  playlists: Playlist[]
  createPlaylist: (name: string) => void
  addTrackToPlaylist: (playlistId: string, trackId: string) => void
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void
  deletePlaylist: (playlistId: string) => void
  renamePlaylist: (playlistId: string, newName: string) => void
  setPlaylists: (playlists: Playlist[]) => void
  enterDemoMode: () => void
  exitDemoMode: () => void
}

export const useUserStore = create<UserState>((set) => ({
  allTracks: [],
  setAllTracks: (tracks) => set({ allTracks: tracks }),
  favoriteTrackIds: [],
  setFavoriteTrackIds: (trackIds) => set({ favoriteTrackIds: trackIds }),
  toggleFavorite: (trackId) =>
    set((state) => ({
      favoriteTrackIds: state.favoriteTrackIds.includes(trackId)
        ? state.favoriteTrackIds.filter((id) => id !== trackId)
        : [...state.favoriteTrackIds, trackId],
    })),
  playlists: [],
  setPlaylists: (playlists) => set({ playlists }),
  createPlaylist: (name) =>
    set((state) => ({
      playlists: [
        ...state.playlists,
        { id: `playlist-${Date.now()}`, name, trackIds: [] },
      ],
    })),
  addTrackToPlaylist: (playlistId, trackId) =>
    set((state) => ({
      playlists: state.playlists.map((p) =>
        p.id === playlistId ? { ...p, trackIds: [...p.trackIds, trackId] } : p
      ),
    })),
  removeTrackFromPlaylist: (playlistId, trackId) =>
    set((state) => ({
      playlists: state.playlists.map((p) =>
        p.id === playlistId
          ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) }
          : p
      ),
    })),
  deletePlaylist: (playlistId) =>
    set((state) => ({
      playlists: state.playlists.filter((p) => p.id !== playlistId),
    })),
  renamePlaylist: (playlistId, newName) =>
    set((state) => ({
      playlists: state.playlists.map((p) =>
        p.id === playlistId ? { ...p, name: newName } : p
      ),
    })),
  enterDemoMode: () => {
    set({ allTracks: DEMO_TRACKS })
    // app store will handle the rest
  },
  exitDemoMode: () => {
    set({ allTracks: [] })
    // app store will handle the rest
  },
}))

