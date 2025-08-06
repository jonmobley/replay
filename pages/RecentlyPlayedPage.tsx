import React from 'react'
import { useStore } from '../store'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { useIsMobile } from '../components/ui/use-mobile'
import { RecentlyPlayed } from '../components/RecentlyPlayed'

export function RecentlyPlayedPage() {
  const { allTracks, isDemoMode } = useStore()
  const { currentTrackIndex, actions } = useAudioPlayer()
  const isMobile = useIsMobile()

  const handleTrackPlay = (trackIndex: number) => {
    actions.playTrack(allTracks, trackIndex)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Recently Played</h1>
        <p className="text-muted-foreground">Your listening history</p>
      </div>
      <RecentlyPlayed
        allTracks={allTracks}
        currentTrackIndex={currentTrackIndex}
        onTrackSelect={handleTrackPlay}
        onLoadAsPlaylist={() => {}}
        isDemoMode={isDemoMode}
      />
    </div>
  )
}