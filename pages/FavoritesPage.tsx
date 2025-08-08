import React from 'react'
import { useStore } from '../store'
import { TrackList } from '../components/TrackList'
import { Track } from '../data/tracks'
import { Heart } from 'lucide-react'

export default function FavoritesPage() {
  const { allTracks, favoriteTrackIds } = useStore()

  const favoriteTracks = allTracks.filter((track: Track) =>
    favoriteTrackIds.includes(track.id),
  )

  if (favoriteTracks.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold">No favorites yet</h2>
        <p className="text-gray-500">
          Click the heart icon on any track to add it to your favorites.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Favorites</h1>
      <TrackList tracks={favoriteTracks} />
    </div>
  )
}
