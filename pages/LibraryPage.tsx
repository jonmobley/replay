import React from 'react'
import { useStore } from '../store'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { useIsMobile } from '../components/ui/use-mobile'
import { Button } from '../components/ui/button'
import { MobileTrackRow } from '../components/MobileTrackRow'
import { TrackRow } from '../components/TrackRow'
import { Plus } from 'lucide-react'

export function LibraryPage() {
  const { allTracks, filteredTracks, originalIndices } = useStore()
  const { currentTrackIndex, state, actions } = useAudioPlayer()
  const isMobile = useIsMobile()

  const handleTrackPlay = (trackIndex: number) => {
    actions.playTrack(allTracks, trackIndex)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>My Library</h1>
          <p className="text-muted-foreground">{filteredTracks.length} of {allTracks.length} songs</p>
        </div>
        {!isMobile && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Music
          </Button>
        )}
      </div>

      {/* Track List */}
      <div className={isMobile ? 'space-y-0' : 'space-y-1'}>
        {filteredTracks.map((track, index) => 
          isMobile ? (
            <MobileTrackRow
              key={track.id}
              track={track}
              index={index}
              isPlaying={state.isPlaying && currentTrackIndex === originalIndices[index]}
              isCurrentTrack={currentTrackIndex === originalIndices[index]}
              onPlay={() => handleTrackPlay(originalIndices[index])}
            />
          ) : (
            <TrackRow
              key={track.id}
              track={track}
              track={track}
              index={index}
              isPlaying={state.isPlaying && currentTrackIndex === originalIndices[index]}
              isCurrentTrack={currentTrackIndex === originalIndices[index]}
              onPlay={() => handleTrackPlay(originalIndices[index])}
            />
          )
        )}
      </div>
    </div>
  )
}