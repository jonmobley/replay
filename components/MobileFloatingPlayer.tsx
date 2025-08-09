import React from 'react'
import { Play, Pause, SkipForward, ChevronUp } from 'lucide-react'
import { Button } from './ui/button'
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

interface MobileFloatingPlayerProps {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlayPause: () => void
  onNext: () => void
  onExpand: () => void
  isVisible: boolean
}

export function MobileFloatingPlayer({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onExpand,
  isVisible
}: MobileFloatingPlayerProps) {
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!currentTrack) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-16 left-2 right-2 z-50 md:hidden"
        >
          {/* Progress Bar */}
          <div className="h-0.5 bg-muted/50 relative overflow-hidden rounded-t-xl">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <motion.div 
            className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-lg overflow-hidden"
            whileTap={{ scale: 0.98 }}
            onClick={onExpand}
          >
            <div className="flex items-center p-3">
              {/* Album Art */}
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 mr-3">
                <Play className="h-5 w-5 text-primary" />
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0 mr-3">
                <h4 className="text-sm font-medium truncate">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPlayPause()
                  }}
                  className="h-10 w-10 p-0 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onNext()
                  }}
                  className="h-10 w-10 p-0 rounded-full"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}