import React, { useState } from 'react'
import { useStore } from '../store'
import { Plus, Music, Trash2, Save, MoreVertical, Edit } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from './ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface PlaylistManagerProps {
  selectedPlaylistId: string | null
  onSelectPlaylist: (playlistId: string) => void
}

export function PlaylistManager({
  selectedPlaylistId,
  onSelectPlaylist,
}: PlaylistManagerProps) {
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist } =
    useStore()
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [playlistToRename, setPlaylistToRename] = useState<string | null>(null)
  const [renamedPlaylistName, setRenamedPlaylistName] = useState('')

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return
    createPlaylist(newPlaylistName)
    setNewPlaylistName('')
    setIsCreateDialogOpen(false)
  }

  const handleRenamePlaylist = () => {
    if (!renamedPlaylistName.trim() || !playlistToRename) return
    renamePlaylist(playlistToRename, renamedPlaylistName)
    setRenamedPlaylistName('')
    setIsRenameDialogOpen(false)
    setPlaylistToRename(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Playlists</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
              <DialogDescription>
                Choose a name for your playlist.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
              <Button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Playlist
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
            <p className="text-sm text-gray-500">
              Create your first playlist to organize your tracks
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedPlaylistId === playlist.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => onSelectPlaylist(playlist.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Music className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{playlist.name}</p>
                        <p className="text-sm text-gray-500">
                          {playlist.trackIds.length} track
                          {playlist.trackIds.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
  onClick={(e) => {
    e.stopPropagation()
    setPlaylistToRename(playlist.id)
    setRenamedPlaylistName(playlist.name)
    setIsRenameDialogOpen(true)
  }}
>
  <Edit className="h-4 w-4 mr-2" />
  Rename
</DropdownMenuItem>
<DropdownMenuItem
  onClick={(e) => {
    e.stopPropagation()
    deletePlaylist(playlist.id)
  }}
>
  <Trash2 className="h-4 w-4 mr-2" />
  Delete
</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Playlist</DialogTitle>
            <DialogDescription>
              Choose a new name for your playlist.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Playlist name"
              value={renamedPlaylistName}
              onChange={(e) => setRenamedPlaylistName(e.target.value)}
            />
            <Button
              onClick={handleRenamePlaylist}
              disabled={!renamedPlaylistName.trim()}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


