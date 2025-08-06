import React, { useState, useEffect } from 'react'
import { Heart, Play, Clock, TrendingUp } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { motion } from 'framer-motion'

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

interface QuickFavoritesProps {
  tracks: Track[]
  onTrackPlay: (trackIndex: number) => void
  currentTrackIndex: number
  isPlaying: boolean
  isMobile: boolean
}

export function QuickFavorites({ 
  tracks, 
  onTrackPlay, 
  currentTrackIndex, 
  isPlaying, 
  isMobile 
}: QuickFavoritesProps) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [stats, setStats] = useState({
    totalPlayTime: 0,
    favoritesCount: 0,
    topGenre: 'Jazz',
    recentlyAdded: 0
  })

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('replay-favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    } else {
      // Add some demo favorites
      const demoFavorites = tracks.slice(0, 3).map(t => t.id)
      setFavorites(demoFavorites)
      localStorage.setItem('replay-favorites', JSON.stringify(demoFavorites))
    }

    // Calculate stats
    const recentlyPlayed = JSON.parse(localStorage.getItem('replay-recently-played') || '[]')
    const totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0)
    
    setStats({
      totalPlayTime: Math.round(totalDuration / 60), // Convert to minutes
      favoritesCount: favorites.length,
      topGenre: 'Jazz', // This could be calculated from track metadata
      recentlyAdded: tracks.filter(t => {
        const modified = new Date(t.client_modified || t.server_modified || 0)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return modified > weekAgo
      }).length
    })
  }, [tracks, favorites.length])

  const favoriteTracks = tracks.filter(track => favorites.includes(track.id))

  const toggleFavorite = (trackId: string) => {
    const newFavorites = favorites.includes(trackId)
      ? favorites.filter(id => id !== trackId)
      : [...favorites, trackId]
    
    setFavorites(newFavorites)
    localStorage.setItem('replay-favorites', JSON.stringify(newFavorites))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`gap-6 ${isMobile ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-2'}`}>
      {/* Quick Favorites */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span className={isMobile ? 'text-base' : 'text-lg'}>Quick Favorites</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favoriteTracks.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No favorites yet</p>
              <p className="text-xs text-muted-foreground mt-1">Heart some tracks to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteTracks.slice(0, isMobile ? 3 : 4).map((track, index) => {
                const trackIndex = tracks.findIndex(t => t.id === track.id)
                const isCurrentTrack = trackIndex === currentTrackIndex
                const isTrackPlaying = isCurrentTrack && isPlaying

                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isCurrentTrack ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTrackPlay(trackIndex)}
                      className={`h-10 w-10 p-0 rounded-full ${
                        isCurrentTrack ? 'bg-primary text-primary-foreground' : ''
                      }`}
                    >
                      <Play className={`h-4 w-4 ${isTrackPlaying ? 'animate-pulse' : ''}`} />
                    </Button>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium truncate ${
                        isMobile ? 'text-sm' : ''
                      } ${isCurrentTrack ? 'text-primary' : ''}`}>
                        {track.title}
                      </h4>
                      <p className={`text-muted-foreground truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {track.artist}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {formatTime(track.duration || 0)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(track.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  </motion.div>
                )
              })}

              {favoriteTracks.length > (isMobile ? 3 : 4) && (
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  View all {favoriteTracks.length} favorites
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className={isMobile ? 'text-base' : 'text-lg'}>Your Music</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className={`font-bold text-primary ${isMobile ? 'text-lg' : 'text-xl'}`}>
                {tracks.length}
              </div>
              <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Total Tracks
              </div>
            </div>

            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className={`font-bold text-primary ${isMobile ? 'text-lg' : 'text-xl'}`}>
                {stats.totalPlayTime}m
              </div>
              <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Total Duration
              </div>
            </div>

            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className={`font-bold text-primary ${isMobile ? 'text-lg' : 'text-xl'}`}>
                {favorites.length}
              </div>
              <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Favorites
              </div>
            </div>

            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className={`font-bold text-primary ${isMobile ? 'text-lg' : 'text-xl'}`}>
                {stats.recentlyAdded}
              </div>
              <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                This Week
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Top Genre</p>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {stats.topGenre}
                </p>
              </div>
              <Badge variant="secondary">#1</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}