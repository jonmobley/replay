import React from 'react'
import { Clock, Play, RotateCcw, Trash2, TrendingUp } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useRecentlyPlayed, SortOption, TimeFilter } from '../hooks/useRecentlyPlayed'
import { useStore } from '../store'
import { useAudioStore } from '../store/audio'
import { formatRelativeTime } from '../utils/time'

interface RecentlyPlayedProps {
  onTrackSelect: (index: number) => void;
  compact?: boolean;
}

export function RecentlyPlayed({ onTrackSelect, compact = false }: RecentlyPlayedProps) {
  const { allTracks } = useStore()
  const { currentTrack } = useAudioStore()
  const {
    isLoading,
    sortBy,
    setSortBy,
    timeFilter,
    setTimeFilter,
    clearHistory,
    filteredAndSortedItems,
  } = useRecentlyPlayed()

  const findTrackIndex = (trackId: string) => allTracks.findIndex(t => t.id === trackId)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (filteredAndSortedItems.length === 0) {
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
        </CardContent>
      </Card>
    )
  }
  
  const displayItems = compact ? filteredAndSortedItems.slice(0, 4) : filteredAndSortedItems

  return (
    <div className={compact ? "space-y-1" : "space-y-4"}>
      {!compact && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="frequent">Most Played</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={clearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
        </div>
      )}

      <div className={`space-y-1 ${compact ? '' : 'max-h-96 overflow-y-auto'}`}>
        {displayItems.map((item) => {
          const trackIndex = findTrackIndex(item.track.id)
          const isCurrentTrack = item.track.id === currentTrack?.id
          
          return (
            <div
              key={`${item.track.id}-${item.lastPlayed}`}
              className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                isCurrentTrack ? 'bg-primary/5 border-l-4 border-primary' : ''
              }`}
              onClick={() => trackIndex !== -1 && onTrackSelect(trackIndex)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{item.track.artist} • {formatRelativeTime(new Date(item.lastPlayed))}</p>
              </div>
              {!compact && (
                <Badge className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {item.playCount}
                </Badge>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
