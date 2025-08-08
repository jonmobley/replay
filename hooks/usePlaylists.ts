import { useEffect } from 'react'
import { useStore } from '../store'

export function usePlaylists() {
  const { playlists, setPlaylists } = useStore()

  useEffect(() => {
    try {
      const savedPlaylists = localStorage.getItem('replay-playlists')
      if (savedPlaylists) {
        setPlaylists(JSON.parse(savedPlaylists))
      }
    } catch (error) {
      console.error('Error parsing playlists from local storage', error)
    }
  }, [setPlaylists])

  useEffect(() => {
    localStorage.setItem('replay-playlists', JSON.stringify(playlists))
  }, [playlists])
}

