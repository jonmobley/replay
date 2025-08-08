import React from 'react'
import { useAudioStore } from '../store/audio'
import { TrackRow } from './TrackRow'
import { MobileTrackRow } from './MobileTrackRow'
import { useIsMobile } from './ui/use-mobile'
import { Track } from '../data/tracks'

interface TrackListProps {
  tracks: Track[]
  playlistId?: string
}

export function TrackList({ tracks, playlistId }: TrackListProps) {
  const { playTrack, currentTrack, isPlaying } = useAudioStore()
  const isMobile = useIsMobile()

  const handleTrackPlay = (trackIndex: number) => {
    playTrack(tracks, trackIndex)
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {playlistId ? 'This playlist is empty' : 'No tracks to display'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id
        return isMobile ? (
          <MobileTrackRow
            key={track.id}
            track={track}
            index={index}
            isPlaying={isPlaying}
            isCurrentTrack={isCurrentTrack}
            onPlay={() => handleTrackPlay(index)}
            playlistId={playlistId}
          />
        ) : (
          <TrackRow
            key={track.id}
            track={track}
            index={index}
            isPlaying={isPlaying}
            isCurrentTrack={isCurrentTrack}
            onPlay={() => handleTrackPlay(index)}
            playlistId={playlistId}
          />
        )
      })}
    </div>
  )
}

