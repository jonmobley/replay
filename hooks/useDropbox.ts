import { useStore } from '../store'
import { toast } from 'sonner'
import { Track } from '../data/tracks'
import { projectId, publicAnonKey, functionName } from '../utils/supabase/info'

export function useDropbox() {
  const { setAllTracks, setAppState, setIsLoading, setError, setIsDemoMode, updateTrack } = useStore()

  const checkDropboxConnection = async () => {
    setIsLoading(true)
    setError(null)
    toast.loading('Connecting to Dropbox...')
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/${functionName}/dropbox/files`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        // Initialize tracks with minimal info
        const initialTracks = data.files.map((file: any) => ({
          ...file,
          artist: 'Loading...',
          album: '',
          title: file.name,
          duration: 0,
          isMetadataLoading: true,
        }))
        setAllTracks(initialTracks)
        setAppState('connected')
        setIsDemoMode(false)
        localStorage.removeItem('replay-demo-mode')
        toast.success('Connected to Dropbox')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to connect to Dropbox')
        setAppState('disconnected')
        toast.error('Failed to connect to Dropbox')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setAppState('disconnected')
      toast.error('Connection failed')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTrackMetadata = async (track: Track, index: number) => {
    if (!track.path_lower || !track.isMetadataLoading) return

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/${functionName}/dropbox/metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ path_lower: track.path_lower }),
      })

      if (response.ok) {
        const { metadata } = await response.json()
        updateTrack(index, { ...metadata, isMetadataLoading: false })
      } else {
        // Handle error case, maybe set track to an error state
        updateTrack(index, { isMetadataLoading: false, artist: 'Error loading metadata' })
      }
    } catch (error) {
      console.error('Error fetching metadata:', error)
      updateTrack(index, { isMetadataLoading: false, artist: 'Error loading metadata' })
    }
  }

  return { checkDropboxConnection, fetchTrackMetadata }
}
