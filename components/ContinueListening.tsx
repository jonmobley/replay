import React, { useState, useEffect } from 'react'
import { Play, Clock } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Progress } from './ui/progress'
import { motion } from 'motion/react'

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

interface ListeningSession {
  trackId: string
  position: number
  timestamp: number
  duration: number
}

interface ContinueListeningProps {
  tracks: Track[]
  onTrackPlay: (trackIndex: number) => void
  onSeek?: (time: number) => void
  currentTrackIndex: number
  isPlaying: boolean
  isMobile: boolean
}

export function ContinueListening({ 
  tracks, 
  onTrackPlay, 
  onSeek, 
  currentTrackIndex, 
  isPlaying, 
  isMobile 
}: ContinueListeningProps) {
  const [sessions, setSessions] = useState<ListeningSession[]>([])

  useEffect(() => {
    // Load interrupted sessions from localStorage
    const savedSessions = localStorage.getItem('replay-interrupted-sessions')
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions)
      // Filter sessions that are recent (last 24 hours) and have meaningful progress
      const recentSessions = parsedSessions.filter((session: ListeningSession) => {
        const isRecent = Date.now() - session.timestamp < 24 * 60 * 60 * 1000
        const hasProgress = session.position > 30 && session.position < session.duration - 30
        return isRecent && hasProgress
      })
      setSessions(recentSessions.slice(0, 3)) // Show max 3 sessions
    } else {
      // Create some demo interrupted sessions
      const demoSessions: ListeningSession[] = []
      if (tracks.length > 0) {
        // Session 1: Half-way through a long track
        const longTrack = tracks.find(t => (t.duration || 0) > 300) || tracks[0]
        if (longTrack?.duration) {
          demoSessions.push({
            trackId: longTrack.id,
            position: Math.floor(longTrack.duration * 0.6),
            timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
            duration: longTrack.duration
          })
        }

        // Session 2: Started another track
        if (tracks.length > 1) {
          const track2 = tracks[1]
          if (track2?.duration) {
            demoSessions.push({
              trackId: track2.id,
              position: Math.floor(track2.duration * 0.25),
              timestamp: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
              duration: track2.duration
            })
          }
        }
      }
      setSessions(demoSessions)
      localStorage.setItem('replay-interrupted-sessions', JSON.stringify(demoSessions))
    }
  }, [tracks])

  const handleContinue = (session: ListeningSession) => {
    const trackIndex = tracks.findIndex(track => track.id === session.trackId)
    if (trackIndex >= 0) {
      onTrackPlay(trackIndex)
      // Seek to position after a short delay to allow track to load
      if (onSeek) {
        setTimeout(() => onSeek(session.position), 500)
      }
      
      // Remove this session since we're continuing
      const updatedSessions = sessions.filter(s => s.trackId !== session.trackId)
      setSessions(updatedSessions)
      localStorage.setItem('replay-interrupted-sessions', JSON.stringify(updatedSessions))
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return 'Just now'
    }
  }

  if (sessions.length === 0) {
    return null
  }

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>Continue Listening</h2>
      </div>

      <div className={`gap-4 ${isMobile ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {sessions.map((session, index) => {
          const track = tracks.find(t => t.id === session.trackId)
          if (!track) return null

          const progressPercentage = (session.position / session.duration) * 100
          const trackIndex = tracks.findIndex(t => t.id === track.id)
          const isCurrentTrack = trackIndex === currentTrackIndex

          return (
            <motion.div
              key={session.trackId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`group hover:shadow-md transition-all duration-300 cursor-pointer ${
                  isCurrentTrack ? 'ring-2 ring-primary/20 bg-primary/5' : 'hover:bg-muted/30'
                }`}
                onClick={() => handleContinue(session)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Track Info */}
                    <div className="flex items-center space-x-3">
                      <div className={`bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                        isMobile ? 'h-10 w-10' : 'h-12 w-12'
                      }`}>
                        <Play className={`text-primary ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium truncate ${isMobile ? 'text-sm' : ''}`}>
                          {track.title}
                        </h3>
                        <p className={`text-muted-foreground truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatTime(session.position)}</span>
                        <span>{formatTime(session.duration)}</span>
                      </div>
                    </div>

                    {/* Timestamp and Resume Text */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {getTimeAgo(session.timestamp)}
                      </p>
                      <p className="text-xs text-primary font-medium group-hover:underline">
                        Resume playing
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}