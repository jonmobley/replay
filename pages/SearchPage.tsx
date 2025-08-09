import React from 'react'
import { useStore } from '../store'
import { useAudioStore } from '../store/audio'
import { useIsMobile } from '../components/ui/use-mobile'
import { MobileTrackRow } from '../components/MobileTrackRow'
import { TrackRow } from '../components/TrackRow'

export default function SearchPage() {
  const { allTracks, searchQuery } = useStore()
  const { currentTrack, isPlaying, playTrack } = useAudioStore()
  const isMobile = useIsMobile()

  const handleTrackPlay = (trackIndex: number) => {
    playTrack(allTracks, trackIndex)
  }

  const filteredTracks = allTracks.filter(track => 
    searchQuery ?
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) :
    false
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Search Results</h1>
        <p className="text-muted-foreground">
          {filteredTracks.length} tracks found for "{searchQuery}"
        </p>
      </div>
      
      <div className={isMobile ? 'space-y-0' : 'space-y-1'}>
        {filteredTracks.map((track, index) => {
          const originalIndex = allTracks.findIndex(t => t.id === track.id)
          return isMobile ? (
            <MobileTrackRow
              key={track.id}
              track={track}
              isPlaying={isPlaying && currentTrack?.id === track.id}
              isCurrentTrack={currentTrack?.id === track.id}
              onPlay={() => handleTrackPlay(originalIndex)}
            />
          ) : (
            <TrackRow
              key={track.id}
              track={track}
              index={index}
              isPlaying={isPlaying && currentTrack?.id === track.id}
              isCurrentTrack={currentTrack?.id === track.id}
              onPlay={() => handleTrackPlay(originalIndex)}
            />
          )
        })}
      </div>
    </div>
  )
}
