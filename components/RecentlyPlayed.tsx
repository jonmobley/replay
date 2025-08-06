import React, { useState, useEffect } from 'react'
import { Clock, Play, RotateCcw, Trash2, TrendingUp } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
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
}

interface RecentlyPlayedItem {
  track: Track
  firstPlayed: string
  lastPlayed: string
  playCount: number
}

interface RecentlyPlayedProps {
  allTracks: Track[]
  currentTrackIndex: number
  onTrackSelect: (index: number) => void
  onLoadAsPlaylist: (tracks: Track[]) => void
  compact?: boolean
  isDemoMode?: boolean
}

type SortOption = 'recent' | 'frequent' | 'alphabetical'
type TimeFilter = 'all' | 'today' | 'week' | 'month'

export function RecentlyPlayed({ allTracks, currentTrackIndex, onTrackSelect, onLoadAsPlaylist, compact = false, isDemoMode = false }: RecentlyPlayedProps) {
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

  useEffect(() => {
    fetchRecentlyPlayed()
  }, [])

  const fetchRecentlyPlayed = async () => {
    setIsLoading(true)
    try {
      if (isDemoMode) {
        // Load from localStorage for demo mode
        const localData = localStorage.getItem('replay-recently-played')
        if (localData) {
          const parsed = JSON.parse(localData)
          // Convert localStorage format to server format
          const converted = parsed.map((item: any) => {
            const track = allTracks.find(t => t.id === item.trackId)
            if (track) {
              return {
                track,
                firstPlayed: new Date(item.timestamp).toISOString(),
                lastPlayed: new Date(item.timestamp).toISOString(),
                playCount: 1
              }
            }
            return null
          }).filter(Boolean)
          setRecentlyPlayed(converted)
        }
      } else {
        // Try to fetch from server
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a401fe33/recently-played`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          setRecentlyPlayed(data.recentlyPlayed)
        } else {
          console.warn('Server not available, falling back to localStorage')
          // Fallback to localStorage if server is unavailable
          const localData = localStorage.getItem('replay-recently-played-fallback')
          if (localData) {
            setRecentlyPlayed(JSON.parse(localData))
          }
        }
      }
    } catch (error) {
      console.warn('Error fetching recently played, using fallback:', error)
      // Fallback to localStorage if network error
      const localData = localStorage.getItem('replay-recently-played-fallback')
      if (localData) {
        try {
          setRecentlyPlayed(JSON.parse(localData))
        } catch (parseError) {
          console.error('Error parsing fallback data:', parseError)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = async () => {
    try {
      if (isDemoMode) {
        // Clear localStorage for demo mode
        localStorage.removeItem('replay-recently-played')
        setRecentlyPlayed([])
      } else {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a401fe33/recently-played`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        })
        
        if (response.ok) {
          setRecentlyPlayed([])
          // Also clear fallback storage
          localStorage.removeItem('replay-recently-played-fallback')
        } else {
          console.warn('Server not available, clearing local storage only')
          setRecentlyPlayed([])
          localStorage.removeItem('replay-recently-played-fallback')
        }
      }
    } catch (error) {
      console.warn('Error clearing recently played, clearing locally:', error)
      setRecentlyPlayed([])
      localStorage.removeItem('replay-recently-played-fallback')
      if (isDemoMode) {
        localStorage.removeItem('replay-recently-played')
      }
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const filterByTime = (items: RecentlyPlayedItem[]) => {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    switch (timeFilter) {
      case 'today':
        return items.filter(item => new Date(item.lastPlayed) >= oneDayAgo)
      case 'week':
        return items.filter(item => new Date(item.lastPlayed) >= oneWeekAgo)
      case 'month':
        return items.filter(item => new Date(item.lastPlayed) >= oneMonthAgo)
      default:
        return items
    }
  }

  const sortItems = (items: RecentlyPlayedItem[]) => {
    switch (sortBy) {
      case 'frequent':
        return [...items].sort((a, b) => b.playCount - a.playCount)
      case 'alphabetical':
        return [...items].sort((a, b) => a.track.title.localeCompare(b.track.title))
      default: // recent
        return [...items].sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
    }
  }

  const findTrackIndex = (track: Track) => {
    return allTracks.findIndex(t => t.id === track.id)
  }

  const getPlayCountColor = (playCount: number) => {
    if (playCount >= 10) return 'bg-red-100 text-red-800'
    if (playCount >= 5) return 'bg-orange-100 text-orange-800'
    if (playCount >= 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const loadAsPlaylist = () => {
    const tracks = filteredAndSortedItems.map(item => item.track)
    onLoadAsPlaylist(tracks)
  }

  const filteredAndSortedItems = sortItems(filterByTime(recentlyPlayed))

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (recentlyPlayed.length === 0) {
    return compact ? (
      <div className="text-center py-4">
        <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No listening history yet</p>
      </div>
    ) : (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">No listening history yet</p>
          <p className="text-sm text-gray-500">
            Start playing some tracks to see your listening patterns here
          </p>
        </CardContent>
      </Card>
    )
  }

  const displayItems = compact ? filteredAndSortedItems.slice(0, 4) : filteredAndSortedItems

  return (
    <div className={compact ? "space-y-1" : "space-y-4"}>
      {/* Controls - Hide in compact mode */}
      {!compact && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="frequent">Most Played</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            {filteredAndSortedItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadAsPlaylist}
              >
                <Play className="h-4 w-4 mr-2" />
                Play All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              disabled={recentlyPlayed.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
        </div>
      )}

      {/* Stats - Hide in compact mode */}
      {!compact && filteredAndSortedItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl font-semibold">{filteredAndSortedItems.length}</div>
              <div className="text-xs text-muted-foreground">Tracks</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl font-semibold">
                {filteredAndSortedItems.reduce((sum, item) => sum + item.playCount, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Plays</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl font-semibold">
                {Math.round(filteredAndSortedItems.reduce((sum, item) => sum + item.playCount, 0) / filteredAndSortedItems.length * 10) / 10}
              </div>
              <div className="text-xs text-muted-foreground">Avg Plays</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl font-semibold">
                {new Set(filteredAndSortedItems.map(item => item.track.artist)).size}
              </div>
              <div className="text-xs text-muted-foreground">Artists</div>
            </div>
          </Card>
        </div>
      )}

      {/* Recently Played List */}
      <div className={`space-y-1 ${compact ? '' : 'max-h-96 overflow-y-auto'}`}>
        {displayItems.map((item, index) => {
          const trackIndex = findTrackIndex(item.track)
          const isCurrentTrack = trackIndex === currentTrackIndex
          
          return compact ? (
            <div
              key={`${item.track.id}-${item.lastPlayed}`}
              className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                isCurrentTrack ? 'bg-primary/5 border-l-4 border-primary' : ''
              }`}
              onClick={() => trackIndex !== -1 && onTrackSelect(trackIndex)}
            >
              <div className="flex-shrink-0 mr-3">
                <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${
                  isCurrentTrack ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Clock className="h-3 w-3" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">{item.track.title}</p>
                <p className="text-xs text-muted-foreground truncate leading-tight">
                  {item.track.artist} • {formatRelativeTime(item.lastPlayed)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onTrackSelect(trackIndex)
                }}
              >
                <Play className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Card 
              key={`${item.track.id}-${item.lastPlayed}`}
              className={`cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-sm ${
                isCurrentTrack ? 'bg-blue-50 border-blue-200 shadow-sm' : ''
              }`}
              onClick={() => trackIndex !== -1 && onTrackSelect(trackIndex)}
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  {/* Play indicator */}
                  <div className="flex-shrink-0">
                    {isCurrentTrack ? (
                      <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Play className="h-4 w-4 text-white fill-current" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                        <Clock className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Track info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Title */}
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.track.title}
                        </p>
                        
                        {/* Artist */}
                        <p className="text-xs text-gray-600 truncate">
                          <span className="text-gray-500">by</span> {item.track.artist}
                        </p>

                        {/* Play info */}
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Badge className={`text-xs px-1.5 py-0 ${getPlayCountColor(item.playCount)}`}>
                            <TrendingUp className="h-2.5 w-2.5 mr-1" />
                            {item.playCount} play{item.playCount !== 1 ? 's' : ''}
                          </Badge>
                          <span>•</span>
                          <span>{formatRelativeTime(item.lastPlayed)}</span>
                          {trackIndex === -1 && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600">File not found</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Play button */}
                      {trackIndex !== -1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onTrackSelect(trackIndex)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!compact && filteredAndSortedItems.length === 0 && recentlyPlayed.length > 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <RotateCcw className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No tracks found for the selected time period</p>
            <p className="text-sm text-gray-500">Try adjusting your filter settings</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}