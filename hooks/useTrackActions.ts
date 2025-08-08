import { useStore } from '../store'
import { useOfflineStorage } from './useOfflineStorage'
import { Track } from '../data/tracks'

export function useTrackActions(track: Track, playlistId?: string) {
  const {
    favoriteTrackIds,
    toggleFavorite,
    playlists,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
  } = useStore()
  const {
    downloadTrack,
    removeOfflineTrack,
    isTrackDownloaded,
    downloadProgress,
  } = useOfflineStorage()

  const isFavorite = favoriteTrackIds.includes(track.id)
  const isDownloaded = isTrackDownloaded(track.id)
  const progress = downloadProgress[track.id]

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (isDownloaded) {
        await removeOfflineTrack(track.id)
      } else {
        await downloadTrack(track)
      }
    } catch (error) {
      console.error('Download operation failed:', error)
    }
  }

  return {
    isFavorite,
    isDownloaded,
    progress,
    playlists,
    toggleFavorite,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    handleDownload,
  }
}

