import React, { useMemo } from 'react'
import { useStore } from '../store'
import { useAudioStore } from '../store/audio'
import { useIsMobile } from '../components/ui/use-mobile'
import { Button } from '../components/ui/button'
import { MobileTrackRow } from '../components/MobileTrackRow'
import { TrackRow } from '../components/TrackRow'
import { Plus } from 'lucide-react'

export default function LibraryPage() {
  const { allTracks, searchQuery } = useStore(state => ({ allTracks: state.allTracks, searchQuery: state.searchQuery }))
  const { playTrack, currentTrack, isPlaying } = useAudioStore()
  const isMobile = useIsMobile()

  const handleTrackPlay = (trackIndex: number) => {
    playTrack(allTracks, trackIndex)
  }

  const filteredTracks = useMemo(() => {
    if (!searchQuery) {
      return allTracks
    }
    const lowercasedQuery = searchQuery.toLowerCase()
    return allTracks.filter(track => 
      track.title.toLowerCase().includes(lowercasedQuery) ||
      track.artist.toLowerCase().includes(lowercasedQuery)
    )
  }, [allTracks, searchQuery])

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
