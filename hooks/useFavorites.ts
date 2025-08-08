import { useEffect } from 'react'
import { useStore } from '../store'

export function useFavorites() {
  const { favoriteTrackIds, setFavoriteTrackIds } = useStore()

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('replay-favorites')
      if (savedFavorites) {
        setFavoriteTrackIds(JSON.parse(savedFavorites))
      }
    } catch (error) {
      console.error('Error parsing favorites from local storage', error)
    }
  }, [setFavoriteTrackIds])

  useEffect(() => {
    localStorage.setItem('replay-favorites', JSON.stringify(favoriteTrackIds))
  }, [favoriteTrackIds])
}

