import { useStore } from '../store'
import { toast } from 'sonner'

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const functionName = import.meta.env.VITE_SUPABASE_FUNCTION_NAME

export function useDropbox() {
  const { setAllTracks, setAppState, setIsLoading, setError, setIsDemoMode } = useStore()

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
        setAllTracks(data.files)
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

  return { checkDropboxConnection }
}
