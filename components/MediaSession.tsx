import { useEffect } from 'react'

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

interface MediaSessionProps {
  currentTrack: Track | null
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onPreviousTrack: () => void
  onNextTrack: () => void
  onSeekTo: (time: number) => void
  currentTime: number
  duration: number
}

export function MediaSession({
  currentTrack,
  isPlaying,
  onPlay,
  onPause,
  onPreviousTrack,
  onNextTrack,
  onSeekTo,
  currentTime,
  duration
}: MediaSessionProps) {
  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      console.log('Media Session API not supported')
      return
    }

    // Set up media session metadata
    if (currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || currentTrack.name,
        artist: currentTrack.artist || 'Unknown Artist',
        album: currentTrack.album || 'Unknown Album',
        artwork: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png', 
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      })
    }

    // Set playback state
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'

    // Set up action handlers
    navigator.mediaSession.setActionHandler('play', onPlay)
    navigator.mediaSession.setActionHandler('pause', onPause)
    navigator.mediaSession.setActionHandler('previoustrack', onPreviousTrack)
    navigator.mediaSession.setActionHandler('nexttrack', onNextTrack)
    
    // Seek handlers
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        onSeekTo(details.seekTime)
      }
    })

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || 10
      onSeekTo(Math.max(0, currentTime - skipTime))
    })

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || 10
      onSeekTo(Math.min(duration, currentTime + skipTime))
    })

    // Update position state
    if (duration > 0) {
      navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: 1,
        position: currentTime
      })
    }

    return () => {
      // Clean up handlers
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('previoustrack', null)
      navigator.mediaSession.setActionHandler('nexttrack', null)
      navigator.mediaSession.setActionHandler('seekto', null)
      navigator.mediaSession.setActionHandler('seekbackward', null)
      navigator.mediaSession.setActionHandler('seekforward', null)
    }
  }, [currentTrack, isPlaying, onPlay, onPause, onPreviousTrack, onNextTrack, onSeekTo, currentTime, duration])

  return null // This component doesn't render anything
}