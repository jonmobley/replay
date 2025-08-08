import React, { useState, useEffect } from 'react'
import { Play, Pause, Clock, Download, DownloadCloud, CheckCircle, MoreHorizontal, Heart, Plus, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from './ui/dropdown-menu'
import { motion } from 'framer-motion'
import { useDropbox } from '../hooks/useDropbox'
import { Track } from '../data/tracks'
import { useTrackActions } from '../hooks/useTrackActions'
import { formatTime, formatFileSize, formatDate } from '../utils/track-utils'

interface TrackRowProps {
  track: Track
  index: number
  isPlaying: boolean
  isCurrentTrack: boolean
  onPlay: () => void
  playlistId?: string
}

export function TrackRow({
  track,
  index,
  isPlaying,
  isCurrentTrack,
  onPlay,
  playlistId,
}: TrackRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { fetchTrackMetadata } = useDropbox()
  const {
    isFavorite,
    isDownloaded,
    progress,
    playlists,
    toggleFavorite,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    handleDownload,
  } = useTrackActions(track, playlistId)

  useEffect(() => {
    fetchTrackMetadata(track, index)
  }, [track.id])

  return (
    <motion.div
      className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 rounded-lg transition-all duration-200 group hover:bg-muted/50 ${
        isCurrentTrack ? 'bg-primary/10' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Play Button / Index */}
      <div className="w-10 flex items-center justify-center">
        {isHovered || isCurrentTrack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onPlay}
            className={`h-8 w-8 p-0 rounded-full ${
              isCurrentTrack ? 'bg-primary text-primary-foreground' : ''
            }`}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">{index + 1}</span>
        )}
      </div>

      {/* Track Info */}
      <div className="min-w-0 flex items-center space-x-3">
        <div className="min-w-0 flex-1">
          <h4
            className={`font-medium truncate ${
              isCurrentTrack ? 'text-primary' : ''
            }`}
          >
            {track.title}
          </h4>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span className="truncate">{track.artist}</span>
            {isDownloaded && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                <DownloadCloud className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Album */}
      <div className="hidden md:block min-w-0">
        <p className="text-sm text-muted-foreground truncate">{track.album}</p>
      </div>

      {/* File Info */}
      <div className="hidden lg:block min-w-0">
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span>{formatFileSize(track.size)}</span>
          </div>
          <p className="text-xs mt-1">{formatDate(track.client_modified)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground hidden sm:block">
          {formatTime(track.duration || 0)}
        </span>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity ${
            isFavorite ? '!opacity-100 text-red-500' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(track.id)
          }}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>

        {/* Download Button */}
        <div className="relative">
          {progress?.isDownloading ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="w-6 h-6 relative">
                  <Progress value={progress.progress} className="h-1" />
                  <span className="text-xs absolute inset-0 flex items-center justify-center">
                    {Math.round(progress.progress)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className={`h-8 w-8 p-0 opacity-60 hover:opacity-100 ${
                isDownloaded ? 'text-green-600' : ''
              }`}
            >
              {isDownloaded ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toggleFavorite(track.id)}>
              <Heart className="h-4 w-4 mr-2" />
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Plus className="h-4 w-4 mr-2" />
                Add to Playlist
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {playlists.map((playlist) => {
                    const isTrackInPlaylist = playlist.trackIds.includes(
                      track.id,
                    )
                    return (
                      <DropdownMenuItem
                        key={playlist.id}
                        onClick={() => {
                          if (isTrackInPlaylist) {
                            removeTrackFromPlaylist(playlist.id, track.id)
                          } else {
                            addTrackToPlaylist(playlist.id, track.id)
                          }
                        }}
                      >
                        {playlist.name}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            {playlistId && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => removeTrackFromPlaylist(playlistId, track.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove from Playlist
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDownload}>
              {isDownloaded ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Remove Download
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download for Offline
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}

