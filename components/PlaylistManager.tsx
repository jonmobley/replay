import React, { useState, useEffect } from 'react'
import { Plus, Music, Trash2, Save } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface Track {
  id: string
  name: string
  path_lower: string
  size: number
}

interface Playlist {
  id: string
  name: string
  tracks: Track[]
  createdAt: string
}

interface PlaylistManagerProps {
  tracks: Track[]
  onLoadPlaylist: (tracks: Track[]) => void
}

export function PlaylistManager({ tracks, onLoadPlaylist }: PlaylistManagerProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a401fe33/playlists`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setPlaylists(data.playlists)
      }
    } catch (error) {
      console.error('Error fetching playlists:', error)
    }
  }

  const createPlaylist = async () => {
    if (!newPlaylistName.trim() || selectedTracks.size === 0) return
    
    setIsLoading(true)
    try {
      const playlistTracks = tracks.filter(track => selectedTracks.has(track.id))
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a401fe33/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          name: newPlaylistName,
          tracks: playlistTracks,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setPlaylists(prev => [...prev, data.playlist])
        setNewPlaylistName('')
        setSelectedTracks(new Set())
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error('Error creating playlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deletePlaylist = async (id: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a401fe33/playlists/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      })
      
      if (response.ok) {
        setPlaylists(prev => prev.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting playlist:', error)
    }
  }

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(trackId)) {
        newSet.delete(trackId)
      } else {
        newSet.add(trackId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Playlists</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={tracks.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
              <DialogDescription>
                Choose a name for your playlist and select the tracks you want to include.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-600">Select tracks:</p>
                {tracks.map(track => (
                  <div key={track.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTracks.has(track.id)}
                      onChange={() => toggleTrackSelection(track.id)}
                      className="rounded"
                    />
                    <span className="text-sm truncate flex-1">{track.name}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={createPlaylist}
                disabled={!newPlaylistName.trim() || selectedTracks.size === 0 || isLoading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Playlist'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {playlists.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Music className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No playlists yet</p>
            <p className="text-sm text-gray-500">Create your first playlist to organize your tracks</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {playlists.map(playlist => (
            <Card key={playlist.id} className="hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Music className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{playlist.name}</p>
                        <p className="text-sm text-gray-500">
                          {playlist.tracks.length} track{playlist.tracks.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLoadPlaylist(playlist.tracks)}
                    >
                      Load
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePlaylist(playlist.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}