import React, { useState, useEffect, useMemo } from 'react'
import { useStore } from '../store'
import { TrackList } from '../components/TrackList'
import { PlaylistManager } from '../components/PlaylistManager'

export default function PlaylistsPage() {
  const { playlists, allTracks } = useStore()
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null,
  )

  useEffect(() => {
    if (
      selectedPlaylistId &&
      !playlists.some((p) => p.id === selectedPlaylistId)
    ) {
      setSelectedPlaylistId(null)
    }
  }, [playlists, selectedPlaylistId])

  const selectedPlaylist = playlists.find(
    (playlist) => playlist.id === selectedPlaylistId,
  )

  const tracks = useMemo(() => {
    return selectedPlaylist?.trackIds
      .map((trackId) => allTracks.find((track) => track.id === trackId))
      .filter((track) => track !== undefined) || []
  }, [selectedPlaylist, allTracks])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <PlaylistManager
          selectedPlaylistId={selectedPlaylistId}
          onSelectPlaylist={setSelectedPlaylistId}
        />
      </div>
      <div className="md:col-span-2">
        {selectedPlaylist ? (
          <div>
            <h2 className="text-2xl font-bold">{selectedPlaylist.name}</h2>
            <TrackList tracks={tracks} playlistId={selectedPlaylist.id} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a playlist to view its tracks</p>
          </div>
        )}
      </div>
    </div>
  )
}

