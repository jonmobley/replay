import React, { useState } from 'react'
import { Star, Pin, Play, MoreHorizontal, PinOff, Heart } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
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

interface SpotlightItem {
  id: string
  type: 'track' | 'album' | 'artist'
  trackId?: string
  title: string
  subtitle: string
  description: string
  pinned: boolean
  featured: boolean
}

interface SpotlightSectionProps {
  tracks: Track[]
  onTrackPlay: (trackIndex: number) => void
  currentTrackIndex: number
  isPlaying: boolean
  isMobile: boolean
}

export function SpotlightSection({ 
  tracks, 
  onTrackPlay, 
  currentTrackIndex, 
  isPlaying, 
  isMobile 
}: SpotlightSectionProps) {
  const [spotlightItems, setSpotlightItems] = useState<SpotlightItem[]>(() => {
    // Create some default spotlight items based on available tracks
    const defaultItems: SpotlightItem[] = []
    
    if (tracks.length > 0) {
      // Featured track - pick a popular one or random
      const featuredTrack = tracks.find(t => t.artist === 'Miles Davis') || tracks[0]
      if (featuredTrack) {
        defaultItems.push({
          id: 'featured-1',
          type: 'track',
          trackId: featuredTrack.id,
          title: featuredTrack.title,
          subtitle: featuredTrack.artist,
          description: `Experience the masterful ${featuredTrack.album}`,
          pinned: false,
          featured: true
        })
      }

      // Pinned artist collection
      const jazzTracks = tracks.filter(t => t.artist === 'Miles Davis')
      if (jazzTracks.length > 0) {
        defaultItems.push({
          id: 'pinned-1',
          type: 'artist',
          title: 'Miles Davis Collection',
          subtitle: `${jazzTracks.length} tracks`,
          description: 'Your pinned jazz collection from the legendary trumpeter',
          pinned: true,
          featured: false
        })
      }

      // Album spotlight
      const albums = [...new Set(tracks.map(t => t.album))]
      if (albums.length > 0) {
        const album = albums[0]
        const albumTracks = tracks.filter(t => t.album === album)
        defaultItems.push({
          id: 'album-1',
          type: 'album',
          title: album,
          subtitle: albumTracks[0]?.artist || 'Various Artists',
          description: `Complete album with ${albumTracks.length} tracks`,
          pinned: false,
          featured: false
        })
      }
    }

    return defaultItems
  })

  const togglePin = (itemId: string) => {
    setSpotlightItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, pinned: !item.pinned } : item
      )
    )
  }

  const getTrackIndexById = (trackId: string) => {
    return tracks.findIndex(track => track.id === trackId)
  }

  const handleItemPlay = (item: SpotlightItem) => {
    if (item.type === 'track' && item.trackId) {
      const trackIndex = getTrackIndexById(item.trackId)
      if (trackIndex >= 0) {
        onTrackPlay(trackIndex)
      }
    } else if (item.type === 'artist') {
      // Play first track from this artist
      const artistTracks = tracks.filter(t => t.title.includes(item.title) || t.artist.includes(item.title.split(' ')[0]))
      if (artistTracks.length > 0) {
        const trackIndex = tracks.findIndex(t => t.id === artistTracks[0].id)
        if (trackIndex >= 0) onTrackPlay(trackIndex)
      }
    } else if (item.type === 'album') {
      // Play first track from this album
      const albumTracks = tracks.filter(t => t.album === item.title)
      if (albumTracks.length > 0) {
        const trackIndex = tracks.findIndex(t => t.id === albumTracks[0].id)
        if (trackIndex >= 0) onTrackPlay(trackIndex)
      }
    }
  }

  if (spotlightItems.length === 0) {
    return (
      <div>
        <h2 className={`font-semibold mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>Spotlight</h2>
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Pin className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Spotlight Items</h3>
            <p className="text-sm text-muted-foreground">
              Pin your favorite tracks, albums, or artists to feature them here
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>Spotlight</h2>
        <Button variant="ghost" size="sm">
          <Pin className="h-4 w-4 mr-2" />
          Manage
        </Button>
      </div>

      <div className={`gap-4 ${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {spotlightItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`group hover:shadow-lg transition-all duration-300 ${
              item.featured ? 'bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-primary/20' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {item.featured && (
                      <Badge variant="secondary" className="text-primary">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {item.pinned && (
                      <Badge variant="outline">
                        <Pin className="h-3 w-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => togglePin(item.id)}>
                        {item.pinned ? (
                          <>
                            <PinOff className="h-4 w-4 mr-2" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Heart className="h-4 w-4 mr-2" />
                        Add to Favorites
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Remove from Spotlight
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className={`bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isMobile ? 'h-12 w-12' : 'h-16 w-16'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className={`text-primary ${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${isMobile ? 'text-sm' : ''}`}>
                        {item.title}
                      </h3>
                      <p className={`text-muted-foreground truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className={`text-muted-foreground leading-relaxed ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {item.description}
                  </p>

                  <Button
                    onClick={() => handleItemPlay(item)}
                    className="w-full"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {item.type === 'track' ? 'Play Track' : item.type === 'album' ? 'Play Album' : 'Play Collection'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}