import React from 'react'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Repeat, 
  Repeat1,
  Heart,
  MoreHorizontal,
  ChevronDown,
  Share,
  ListMusic,
  Mic2
} from 'lucide-react'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

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

interface FullscreenPlayerProps {
  isOpen: boolean
  onClose: () => void
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isShuffled: boolean
  repeatMode: 'none' | 'one' | 'all'
  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onToggleShuffle: () => void
  onToggleRepeat: () => void
}

export function FullscreenPlayer({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isShuffled,
  repeatMode,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleShuffle,
  onToggleRepeat
}: FullscreenPlayerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat

  if (!currentTrack) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-primary/5 via-background to-accent/10 backdrop-blur-xl"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>

              <div className="text-center">
                <p className="text-sm font-medium">Now Playing</p>
                <p className="text-xs text-muted-foreground">from Library</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Favorites
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ListMusic className="h-4 w-4 mr-2" />
                    Add to Playlist
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Mic2 className="h-4 w-4 mr-2" />
                    View Lyrics
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12">
              {/* Album Art */}
              <motion.div
                className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-3xl shadow-2xl mb-8 flex items-center justify-center"
                animate={{ 
                  rotate: isPlaying ? 360 : 0,
                  scale: isPlaying ? 1.02 : 1 
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 0.3 }
                }}
              >
                <div className="w-32 h-32 md:w-40 md:h-40 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Play className="h-16 w-16 md:h-20 md:w-20 text-primary/50" />
                </div>
              </motion.div>

              {/* Track Info */}
              <div className="text-center mb-8 max-w-md">
                <h1 className="text-2xl md:text-3xl font-bold mb-2 truncate">
                  {currentTrack.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-1">
                  {currentTrack.artist}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentTrack.album}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mb-6">
                <div className="relative">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={(values) => onSeek(values[0])}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4 md:space-x-8 mb-8">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onToggleShuffle}
                  className={`rounded-full ${isShuffled ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Shuffle className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onPrevious}
                  className="rounded-full"
                >
                  <SkipBack className="h-6 w-6" />
                </Button>

                <Button
                  variant="default"
                  size="lg"
                  onClick={onPlayPause}
                  className="rounded-full w-16 h-16 shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7 fill-current" />
                  ) : (
                    <Play className="h-7 w-7 fill-current ml-1" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onNext}
                  className="rounded-full"
                >
                  <SkipForward className="h-6 w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onToggleRepeat}
                  className={`rounded-full ${
                    repeatMode !== 'none' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <RepeatIcon className="h-5 w-5" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-4 w-full max-w-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVolumeChange(volume > 0 ? 0 : 0.8)}
                  className="rounded-full"
                >
                  {volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <Slider
                  value={[volume * 100]}
                  onValueChange={(values) => onVolumeChange(values[0] / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}