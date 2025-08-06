import React from 'react'
import { useStore } from '../store'
import { PlaylistManager } from '../components/PlaylistManager'

export function PlaylistsPage() {
  const { allTracks } = useStore()

  return (
    <PlaylistManager
      tracks={allTracks}
      onLoadPlaylist={() => {}}
    />
  )
}