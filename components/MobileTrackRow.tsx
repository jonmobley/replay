import React, { useState, useEffect } from 'react'
import { Play, Pause, MoreHorizontal, Heart, Plus, Download, DownloadCloud, CheckCircle, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
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
import { formatTime } from '../utils/track-utils'

interface MobileTrackRowProps {
  track: Track
  index: number
  isPlaying: boolean
  isCurrentTrack: boolean
  onPlay: () => void
  playlistId?: string
}

export function MobileTrackRow({
  track,
  index,
  isPlaying,
  isCurrentTrack,
  onPlay,
  playlistId,
}: MobileTrackRowProps) {
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
  }, [track.id, index])

  return (
    <motion.div
      className={`flex items-center p-4 border-b border-border/50 transition-all duration-200 ${
        isCurrentTrack ? 'bg-primary/10' : 'active:bg-muted/50'
      }`}
      whileTap={{ scale: 0.98 }}
      onClick={onPlay}
    >
      {/* Play Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onPlay()
        }}
        className={`h-10 w-10 p-0 rounded-full mr-3 flex-shrink-0 ${
          isCurrentTrack ? 'bg-primary text-primary-foreground' : ''
        }`}
      >
        {isCurrentTrack && isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </Button>

      {/* Track Info */}
      <div className="flex-1 min-w-0 mr-3">
        <div className="flex items-center space-x-2 mb-1">
          <h4
            className={`font-medium truncate text-sm ${
              isCurrentTrack ? 'text-primary' : ''
            }`}
          >
            {track.title}
          </h4>
          {isDownloaded && (
            <DownloadCloud className="h-3 w-3 text-green-600 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground truncate">
            {track.artist}
          </p>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground flex-shrink-0">
            <span>{formatTime(track.duration || 0)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        {/* Download Button */}
        {progress?.isDownloading ? (
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-6 h-6 relative">
              <Progress value={progress.progress} className="h-1" />
              <span className="text-xs absolute inset-0 flex items-center justify-center">
                {Math.round(progress.progress)}%
              </span>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className={`h-8 w-8 p-0 ${
              isDownloaded ? 'text-green-600' : 'text-muted-foreground'
            }`}
          >
            {isDownloaded ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 p-0 text-muted-foreground"
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
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                handleDownload(e)
              }}
            >
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


