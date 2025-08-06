import { useState, useRef, useEffect, useCallback } from 'react'

export interface Track {
  id: string
  name: string
  path_lower: string
  size: number
  fileType: string
  artist: string
  album: string
  title: string
  duration?: number | null
  client_modified?: string
  server_modified?: string
}

interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLoading: boolean
  error: string | null
  isShuffled: boolean
  repeatMode: 'none' | 'one' | 'all'
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [queue, setQueue] = useState<Track[]>([])
  const [originalQueue, setOriginalQueue] = useState<Track[]>([])
  
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isLoading: false,
    error: null,
    isShuffled: false,
    repeatMode: 'none'
  })

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'metadata'
      
      // Set initial volume from localStorage
      const savedVolume = localStorage.getItem('replay-volume')
      const volume = savedVolume ? parseFloat(savedVolume) : 0.8
      audioRef.current.volume = volume
      setState(prev => ({ ...prev, volume }))
    }

    const audio = audioRef.current

    const handleLoadStart = () => setState(prev => ({ ...prev, isLoading: true, error: null }))
    const handleLoadedMetadata = () => {
      setState(prev => ({ 
        ...prev, 
        duration: audio.duration,
        isLoading: false 
      }))
    }
    const handleTimeUpdate = () => setState(prev => ({ ...prev, currentTime: audio.currentTime }))
    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }))
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }))
    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }))
      handleNext()
    }
    const handleError = (e: Event) => {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to load audio file' 
      }))
    }

    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  // Shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Save track to recently played
  const saveToRecentlyPlayed = useCallback(async (track: Track) => {
    // Always save to localStorage as fallback
    const recentlyPlayed = JSON.parse(localStorage.getItem('replay-recently-played') || '[]')
    const newEntry = { trackId: track.id, timestamp: Date.now() }
    const filtered = recentlyPlayed.filter((item: any) => item.trackId !== track.id)
    filtered.unshift(newEntry)
    localStorage.setItem('replay-recently-played', JSON.stringify(filtered.slice(0, 50)))

    // Try to save to server (but don't block if it fails)
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info')
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a401fe33/recently-played`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ track })
      })
      
      // Also save to fallback localStorage for server format
      const existingFallback = JSON.parse(localStorage.getItem('replay-recently-played-fallback') || '[]')
      const existingIndex = existingFallback.findIndex((item: any) => item.track.id === track.id)
      const now = new Date().toISOString()
      
      if (existingIndex !== -1) {
        existingFallback[existingIndex] = {
          ...existingFallback[existingIndex],
          lastPlayed: now,
          playCount: (existingFallback[existingIndex].playCount || 1) + 1
        }
      } else {
        existingFallback.push({
          track,
          firstPlayed: now,
          lastPlayed: now,
          playCount: 1
        })
      }
      
      const limitedFallback = existingFallback
        .sort((a: any, b: any) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
        .slice(0, 100)
      
      localStorage.setItem('replay-recently-played-fallback', JSON.stringify(limitedFallback))
    } catch (error) {
      // Silently fail - the localStorage fallback will be used
      console.warn('Failed to save to server, using localStorage fallback only')
    }
  }, [])

  // Load track
  const loadTrack = useCallback(async (track: Track) => {
    if (!audioRef.current) return

    // For demo mode, we'll simulate loading with a placeholder audio file
    // In real implementation, this would load from Dropbox
    const audioUrl = `/demo-audio/${track.id}.mp3` // This would be the actual Dropbox URL
    
    audioRef.current.src = audioUrl
    setCurrentTrack(track)
    
    // Update Media Session API
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: [
          { src: '/placeholder-album.png', sizes: '512x512', type: 'image/png' }
        ]
      })
    }

    // Save to recently played (both localStorage and server)
    await saveToRecentlyPlayed(track)
  }, [saveToRecentlyPlayed])

  // Play/Pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !currentTrack) return

    try {
      if (state.isPlaying) {
        audioRef.current.pause()
      } else {
        await audioRef.current.play()
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Playback failed' }))
    }
  }, [state.isPlaying, currentTrack])

  // Seek
  const seek = useCallback((time: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = time
    setState(prev => ({ ...prev, currentTime: time }))
  }, [])

  // Volume
  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return
    audioRef.current.volume = volume
    setState(prev => ({ ...prev, volume }))
    localStorage.setItem('replay-volume', volume.toString())
  }, [])

  // Next track
  const handleNext = useCallback(() => {
    if (queue.length === 0) return

    let nextIndex = currentTrackIndex + 1

    if (state.repeatMode === 'one') {
      // Repeat current track
      nextIndex = currentTrackIndex
    } else if (nextIndex >= queue.length) {
      if (state.repeatMode === 'all') {
        nextIndex = 0
      } else {
        // End of queue
        setState(prev => ({ ...prev, isPlaying: false }))
        return
      }
    }

    setCurrentTrackIndex(nextIndex)
    loadTrack(queue[nextIndex])
    
    if (state.isPlaying) {
      setTimeout(() => audioRef.current?.play(), 100)
    }
  }, [currentTrackIndex, queue, state.repeatMode, state.isPlaying, loadTrack])

  // Previous track
  const handlePrevious = useCallback(() => {
    if (queue.length === 0) return

    // If we're more than 3 seconds in, restart current track
    if (state.currentTime > 3) {
      seek(0)
      return
    }

    let prevIndex = currentTrackIndex - 1
    if (prevIndex < 0) {
      if (state.repeatMode === 'all') {
        prevIndex = queue.length - 1
      } else {
        prevIndex = 0
      }
    }

    setCurrentTrackIndex(prevIndex)
    loadTrack(queue[prevIndex])
    
    if (state.isPlaying) {
      setTimeout(() => audioRef.current?.play(), 100)
    }
  }, [currentTrackIndex, queue, state.currentTime, state.repeatMode, state.isPlaying, loadTrack, seek])

  // Play track by index
  const playTrack = useCallback((tracks: Track[], index: number) => {
    if (index < 0 || index >= tracks.length) return

    setQueue(tracks)
    setOriginalQueue(tracks)
    setCurrentTrackIndex(index)
    loadTrack(tracks[index])
    
    setTimeout(() => audioRef.current?.play(), 100)
  }, [loadTrack])

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    const newShuffled = !state.isShuffled
    setState(prev => ({ ...prev, isShuffled: newShuffled }))

    if (newShuffled) {
      // Shuffle the queue
      const currentTrackInQueue = queue[currentTrackIndex]
      const otherTracks = queue.filter((_, i) => i !== currentTrackIndex)
      const shuffledOthers = shuffleArray(otherTracks)
      const newQueue = [currentTrackInQueue, ...shuffledOthers]
      setQueue(newQueue)
      setCurrentTrackIndex(0)
    } else {
      // Restore original order
      const currentTrackInOriginal = originalQueue.findIndex(t => t.id === currentTrack?.id) ?? 0
      setQueue(originalQueue)
      setCurrentTrackIndex(currentTrackInOriginal)
    }
  }, [state.isShuffled, queue, currentTrackIndex, originalQueue, currentTrack])

  // Toggle repeat
  const toggleRepeat = useCallback(() => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one']
    const currentIndex = modes.indexOf(state.repeatMode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setState(prev => ({ ...prev, repeatMode: nextMode }))
  }, [state.repeatMode])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowRight':
          e.preventDefault()
          if (e.shiftKey) {
            handleNext()
          } else {
            seek(Math.min(state.currentTime + 10, state.duration))
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (e.shiftKey) {
            handlePrevious()
          } else {
            seek(Math.max(state.currentTime - 10, 0))
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolume(Math.min(state.volume + 0.1, 1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(Math.max(state.volume - 0.1, 0))
          break
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [togglePlay, handleNext, handlePrevious, seek, setVolume, state])

  // Media Session API handlers
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', togglePlay)
      navigator.mediaSession.setActionHandler('pause', togglePlay)
      navigator.mediaSession.setActionHandler('previoustrack', handlePrevious)
      navigator.mediaSession.setActionHandler('nexttrack', handleNext)
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime) seek(details.seekTime)
      })
    }
  }, [togglePlay, handleNext, handlePrevious, seek])

  return {
    currentTrack,
    currentTrackIndex,
    queue,
    state,
    actions: {
      playTrack,
      togglePlay,
      handleNext,
      handlePrevious,
      seek,
      setVolume,
      toggleShuffle,
      toggleRepeat
    }
  }
}