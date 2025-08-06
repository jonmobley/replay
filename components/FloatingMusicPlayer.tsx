import React from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Maximize2, Shuffle, Repeat, Repeat1 } from 'lucide-react'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { motion, AnimatePresence } from 'framer-motion'

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

interface FloatingMusicPlayerProps {
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
  onExpand: () => void
  isVisible: boolean
}

export function FloatingMusicPlayer({
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
  onToggleRepeat,
  onExpand,
  isVisible
}: FloatingMusicPlayerProps) {
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
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border"
        >
          {/* Progress Bar */}
          <div className="h-1 bg-muted relative overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.1 }}
            />
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Seek"
            />
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center justify-between max-w-screen-xl mx-auto">
              {/* Track Info */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onExpand}
                >
                  <Play className="h-5 w-5 text-primary" />
                </motion.div>
                <div className="min-w-0 flex-1 cursor-pointer" onClick={onExpand}>
                  <h4 className="text-sm font-medium truncate">{currentTrack.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                </div>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2 mx-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleShuffle}
                  className={`hidden lg:flex ${isShuffled ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrevious}
                  className="hidden sm:flex"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={onPlayPause}
                  className="rounded-full w-8 h-8 p-0"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNext}
                  className="hidden sm:flex"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleRepeat}
                  className={`hidden lg:flex ${
                    repeatMode !== 'none' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <RepeatIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Volume & Time */}
              <div className="flex items-center space-x-3 min-w-0 flex-1 justify-end">
                <div className="hidden sm:flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{formatTime(duration)}</span>
                </div>
                
                <div className="hidden md:flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <div className="w-20">
                    <Slider
                      value={[volume * 100]}
                      onValueChange={(values) => onVolumeChange(values[0] / 100)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExpand}
                  className="hidden lg:flex"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}