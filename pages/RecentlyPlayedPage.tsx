import React from 'react'
import { useStore } from '../store'
import { useAudioStore } from '../store/audio'
import { useIsMobile } from '../components/ui/use-mobile'
import { RecentlyPlayed } from '../components/RecentlyPlayed'

export default function RecentlyPlayedPage() {
  const { allTracks } = useStore()
  const { playTrack } = useAudioStore()
  const isMobile = useIsMobile()

  const handleTrackPlay = (trackIndex: number) => {
    playTrack(allTracks, trackIndex)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Recently Played</h1>
        <p className="text-muted-foreground">Your listening history</p>
      </div>
      <RecentlyPlayed
        onTrackSelect={handleTrackPlay}
      />
    </div>
  )
}
