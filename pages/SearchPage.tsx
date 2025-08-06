import React from 'react'
import { useStore } from '../store'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { useIsMobile } from '../components/ui/use-mobile'
import { MobileTrackRow } from '../components/MobileTrackRow'

export function SearchPage() {
  const { allTracks, filteredTracks, originalIndices, searchQuery } = useStore()
  const { currentTrackIndex, state, actions } = useAudioPlayer()
  const isMobile = useIsMobile()

  const handleTrackPlay = (trackIndex: number) => {
    actions.playTrack(allTracks, trackIndex)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Search</h1>
        <p className="text-muted-foreground">Find your favorite tracks</p>
      </div>
      
      {/* Mobile Search Results */}
      {isMobile && searchQuery && (
        <div className="space-y-0">
          {filteredTracks.map((track, index) => (
            <MobileTrackRow
              key={track.id}
              track={track}
              index={index}
              isPlaying={state.isPlaying && currentTrackIndex === originalIndices[index]}
              isCurrentTrack={currentTrackIndex === originalIndices[index]}
              onPlay={() => handleTrackPlay(originalIndices[index])}
            />
          ))}
        </div>
      )}
    </div>
  )
}