import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Repeat1 } from 'lucide-react'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { Badge } from './ui/badge'
import { projectId, publicAnonKey } from '../utils/supabase/info'

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
  url?: string
}

type RepeatMode = 'off' | 'all' | 'one'

interface MusicPlayerProps {
  tracks: Track[]
  currentTrackIndex: number
  onTrackChange: (index: number) => void
  onTrackPlayed?: (track: Track) => void
}

export function MusicPlayer({ tracks, currentTrackIndex, onTrackChange, onTrackPlayed }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isShuffleMode, setIsShuffleMode] = useState(false)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off')
  const [shuffleOrder, setShuffleOrder] = useState<number[]>([])
  const [shuffleIndex, setShuffleIndex] = useState(0)
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const currentTrack = tracks[currentTrackIndex]

  // Generate shuffle order when shuffle is enabled
  useEffect(() => {
    if (isShuffleMode && tracks.length > 0) {
      const order = [...Array(tracks.length).keys()]
      // Fisher-Yates shuffle
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[order[i], order[j]] = [order[j], order[i]]
      }
      setShuffleOrder(order)
      // Find current track in shuffle order
      const currentShuffleIndex = order.indexOf(currentTrackIndex)
      setShuffleIndex(currentShuffleIndex >= 0 ? currentShuffleIndex : 0)
    }
  }, [isShuffleMode, tracks.length])

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      loadTrack()
      setHasStartedPlaying(false)
    }
  }, [currentTrack])

  // Track when a song has been played (after 30 seconds or more than 50% completion)
  useEffect(() => {
    if (currentTrack && !hasStartedPlaying && currentTime > 30 && isPlaying) {
      setHasStartedPlaying(true)
      recordTrackPlay(currentTrack)
    } else if (currentTrack && !hasStartedPlaying && duration > 0 && currentTime > duration * 0.5) {
      setHasStartedPlaying(true)
      recordTrackPlay(currentTrack)
    }
  }, [currentTime, isPlaying, currentTrack, hasStartedPlaying, duration])

  const recordTrackPlay = async (track: Track) => {
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a401fe33/recently-played`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ track }),
      })
      
      // Call the callback if provided
      if (onTrackPlayed) {
        onTrackPlayed(track)
      }
    } catch (error) {
      console.error('Error recording track play:', error)
    }
  }

  const loadTrack = async () => {
    if (!currentTrack || !audioRef.current) return
    
    setIsLoading(true)
    try {
      // Get temporary link from backend
      const response = await fetch(`/functions/v1/make-server-a401fe33/dropbox/temp-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: currentTrack.path_lower }),
      })
      
      if (response.ok) {
        const data = await response.json()
        audioRef.current.src = data.link
        audioRef.current.load()
      }
    } catch (error) {
      console.error('Error loading track:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const getNextTrackIndex = () => {
    if (isShuffleMode) {
      const nextShuffleIndex = shuffleIndex + 1
      if (nextShuffleIndex < shuffleOrder.length) {
        return shuffleOrder[nextShuffleIndex]
      } else if (repeatMode === 'all') {
        return shuffleOrder[0]
      }
      return currentTrackIndex
    } else {
      const nextIndex = currentTrackIndex + 1
      if (nextIndex < tracks.length) {
        return nextIndex
      } else if (repeatMode === 'all') {
        return 0
      }
      return currentTrackIndex
    }
  }

  const getPreviousTrackIndex = () => {
    if (isShuffleMode) {
      const prevShuffleIndex = shuffleIndex - 1
      if (prevShuffleIndex >= 0) {
        return shuffleOrder[prevShuffleIndex]
      } else if (repeatMode === 'all') {
        return shuffleOrder[shuffleOrder.length - 1]
      }
      return currentTrackIndex
    } else {
      const prevIndex = currentTrackIndex - 1
      if (prevIndex >= 0) {
        return prevIndex
      } else if (repeatMode === 'all') {
        return tracks.length - 1
      }
      return currentTrackIndex
    }
  }

  const skipPrevious = () => {
    const newIndex = getPreviousTrackIndex()
    if (isShuffleMode) {
      setShuffleIndex(Math.max(0, shuffleIndex - 1))
    }
    setHasStartedPlaying(false)
    onTrackChange(newIndex)
  }

  const skipNext = () => {
    const newIndex = getNextTrackIndex()
    if (isShuffleMode) {
      setShuffleIndex(Math.min(shuffleOrder.length - 1, shuffleIndex + 1))
    }
    setHasStartedPlaying(false)
    onTrackChange(newIndex)
  }

  const toggleShuffle = () => {
    setIsShuffleMode(!isShuffleMode)
  }

  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one']
    const currentIndex = modes.indexOf(repeatMode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setRepeatMode(nextMode)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
        setHasStartedPlaying(false)
      }
    } else {
      skipNext()
    }
  }

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return <Repeat1 className="h-4 w-4" />
      case 'all':
        return <Repeat className="h-4 w-4" />
      default:
        return <Repeat className="h-4 w-4" />
    }
  }

  if (!currentTrack) {
    return (
      <div className="bg-gray-900 text-white p-6 rounded-lg">
        <p className="text-center text-gray-400">No track selected</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg space-y-4">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Track Info */}
      <div className="text-center space-y-2">
        <h3 className="text-lg mb-1 truncate">{currentTrack.title}</h3>
        <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
        <p className="text-xs text-gray-500 truncate">{currentTrack.album}</p>
        <div className="flex items-center justify-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {currentTrack.fileType.toUpperCase()}
          </Badge>
          <span className="text-xs text-gray-500">
            {Math.round(currentTrack.size / 1024 / 1024 * 100) / 100} MB
          </span>
          {currentTrack.duration && (
            <span className="text-xs text-gray-500">
              {formatTime(currentTrack.duration)}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
          disabled={isLoading}
        />
        <div className="flex justify-between text-sm text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || currentTrack.duration || 0)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-2">
        {/* Shuffle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleShuffle}
          className={isShuffleMode ? 'text-blue-400' : 'text-gray-400'}
        >
          <Shuffle className="h-4 w-4" />
        </Button>

        {/* Previous */}
        <Button
          variant="ghost"
          size="icon"
          onClick={skipPrevious}
          disabled={isLoading}
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        
        {/* Play/Pause */}
        <Button
          variant="default"
          size="icon"
          onClick={togglePlay}
          disabled={isLoading}
          className="h-12 w-12"
        >
          {isLoading ? (
            <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
        
        {/* Next */}
        <Button
          variant="ghost"
          size="icon"
          onClick={skipNext}
          disabled={isLoading}
        >
          <SkipForward className="h-5 w-5" />
        </Button>

        {/* Repeat */}
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleRepeatMode}
          className={repeatMode !== 'off' ? 'text-blue-400' : 'text-gray-400'}
        >
          {getRepeatIcon()}
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.1}
          onValueChange={handleVolumeChange}
          className="flex-1"
        />
      </div>

      {/* Playback Mode Indicators */}
      <div className="flex justify-center space-x-4 text-xs text-gray-400">
        {isShuffleMode && <span className="text-blue-400">Shuffle On</span>}
        {repeatMode === 'all' && <span className="text-blue-400">Repeat All</span>}
        {repeatMode === 'one' && <span className="text-blue-400">Repeat One</span>}
      </div>
    </div>
  )
}