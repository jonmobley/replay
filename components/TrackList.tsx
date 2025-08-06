import React from 'react'
import { Music, Play, Clock } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'

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

interface TrackListProps {
  tracks: Track[]
  currentTrackIndex: number
  onTrackSelect: (index: number) => void
  isLoading?: boolean
  originalTrackIndices?: number[]
}

export function TrackList({ 
  tracks, 
  currentTrackIndex, 
  onTrackSelect, 
  isLoading,
  originalTrackIndices 
}: TrackListProps) {
  const formatFileSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024
    return `${Math.round(mb * 100) / 100} MB`
  }

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery) return text
    
    const regex = new RegExp(`(${searchQuery})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

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

  if (tracks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Music className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">No audio files found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto">
      {tracks.map((track, index) => {
        const isCurrentTrack = originalTrackIndices 
          ? originalTrackIndices[index] === currentTrackIndex
          : index === currentTrackIndex
        
        return (
          <Card 
            key={track.id} 
            className={`cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-sm ${
              isCurrentTrack ? 'bg-blue-50 border-blue-200 shadow-sm' : ''
            }`}
            onClick={() => onTrackSelect(originalTrackIndices ? originalTrackIndices[index] : index)}
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
                      <Music className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Title */}
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {track.title}
                      </p>
                      
                      {/* Artist and Album */}
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <p className="truncate">
                          <span className="text-gray-500">by</span> {track.artist}
                        </p>
                        {track.album && track.album !== 'Unknown Album' && (
                          <p className="truncate">
                            <span className="text-gray-500">from</span> {track.album}
                          </p>
                        )}
                      </div>

                      {/* File info */}
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {track.fileType.toUpperCase()}
                        </Badge>
                        <span>{formatFileSize(track.size)}</span>
                        {track.duration && (
                          <>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(track.duration)}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Play button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTrackSelect(originalTrackIndices ? originalTrackIndices[index] : index)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}