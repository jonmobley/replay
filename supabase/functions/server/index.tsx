import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as mm from 'npm:music-metadata-browser'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

const functionName = Deno.env.get('SUPABASE_FUNCTION_NAME') || 'make-server-a401fe33'

// Helper function to get file extension
function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Fetch audio files from Dropbox
app.get(`/${functionName}/dropbox/files`, async (c) => {
  try {
    const accessToken = Deno.env.get('DROPBOX_ACCESS_TOKEN')
    if (!accessToken) {
      console.log('Dropbox access token not found')
      return c.json({ error: 'Dropbox access token not configured' }, 500)
    }

    const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: '',
        recursive: true,
        include_media_info: true,
        include_deleted: false,
        include_has_explicit_shared_members: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Dropbox API error:', errorText)
      return c.json({ error: 'Failed to fetch files from Dropbox' }, response.status)
    }

    const data = await response.json()
    
    // Filter for audio files
    const audioFiles = data.entries
      .filter((file: any) => 
        file['.tag'] === 'file' && 
        (file.name.toLowerCase().endsWith('.mp3') || 
         file.name.toLowerCase().endsWith('.wav') || 
         file.name.toLowerCase().endsWith('.m4a') ||
         file.name.toLowerCase().endsWith('.ogg') ||
         file.name.toLowerCase().endsWith('.flac'))
      )

    // Process files to add metadata
    const processedFiles = await Promise.all(audioFiles.map(async (file: any) => {
      try {
        const tempLinkResponse = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: file.path_lower }),
        })

        if (!tempLinkResponse.ok) {
          return null
        }

        const tempLinkData = await tempLinkResponse.json()
        const audioUrl = tempLinkData.link

        const metadata = await mm.fetchFromUrl(audioUrl)
        
        return {
          id: file.id,
          name: file.name,
          path_lower: file.path_lower,
          size: file.size,
          fileType: getFileExtension(file.name),
          artist: metadata.common.artist || 'Unknown Artist',
          album: metadata.common.album || 'Unknown Album',
          title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ''),
          duration: metadata.format.duration ? Math.round(metadata.format.duration) : null,
          client_modified: file.client_modified,
          server_modified: file.server_modified
        }
      } catch (e) {
        console.error(`Failed to process metadata for ${file.name}:`, e)
        return null // Skip files that fail metadata parsing
      }
    }))

    return c.json({ files: processedFiles.filter(Boolean) })
  } catch (error) {
    console.log('Error fetching Dropbox files:', error)
    return c.json({ error: 'Internal server error while fetching files' }, 500)
  }
})

// Get temporary link for audio file
app.post(`/${functionName}/dropbox/temp-link`, async (c) => {
  try {
    const { path } = await c.req.json()
    const accessToken = Deno.env.get('DROPBOX_ACCESS_TOKEN')
    
    if (!accessToken) {
      console.log('Dropbox access token not found for temp link')
      return c.json({ error: 'Dropbox access token not configured' }, 500)
    }

    const response = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Dropbox temp link error:', errorText)
      return c.json({ error: 'Failed to get temporary link' }, response.status)
    }

    const data = await response.json()
    return c.json({ link: data.link })
  } catch (error) {
    console.log('Error getting temporary link:', error)
    return c.json({ error: 'Internal server error while getting temporary link' }, 500)
  }
})

// Recently played tracks
app.get(`/${functionName}/recently-played`, async (c) => {
  try {
    const recentlyPlayed = await kv.get('recently_played') || []
    // Sort by last played time (most recent first)
    const sorted = recentlyPlayed.sort((a: any, b: any) => 
      new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
    )
    return c.json({ recentlyPlayed: sorted })
  } catch (error) {
    console.log('Error fetching recently played:', error)
    return c.json({ error: 'Failed to fetch recently played tracks' }, 500)
  }
})

app.post(`/${functionName}/recently-played`, async (c) => {
  try {
    const { track } = await c.req.json()
    const recentlyPlayed = await kv.get('recently_played') || []
    
    // Find existing entry for this track
    const existingIndex = recentlyPlayed.findIndex((item: any) => item.track.id === track.id)
    
    const now = new Date().toISOString()
    
    if (existingIndex !== -1) {
      // Update existing entry
      recentlyPlayed[existingIndex] = {
        ...recentlyPlayed[existingIndex],
        lastPlayed: now,
        playCount: (recentlyPlayed[existingIndex].playCount || 1) + 1
      }
    } else {
      // Add new entry
      recentlyPlayed.push({
        track,
        firstPlayed: now,
        lastPlayed: now,
        playCount: 1
      })
    }
    
    // Keep only the most recent 100 tracks
    const limitedRecentlyPlayed = recentlyPlayed
      .sort((a: any, b: any) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
      .slice(0, 100)
    
    await kv.set('recently_played', limitedRecentlyPlayed)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error adding to recently played:', error)
    return c.json({ error: 'Failed to add track to recently played' }, 500)
  }
})

app.delete(`/${functionName}/recently-played`, async (c) => {
  try {
    await kv.set('recently_played', [])
    return c.json({ success: true })
  } catch (error) {
    console.log('Error clearing recently played:', error)
    return c.json({ error: 'Failed to clear recently played' }, 500)
  }
})

// Save/get playlists
app.get(`/${functionName}/playlists`, async (c) => {
  try {
    const playlists = await kv.get('playlists') || []
    return c.json({ playlists })
  } catch (error) {
    console.log('Error fetching playlists:', error)
    return c.json({ error: 'Failed to fetch playlists' }, 500)
  }
})

app.post(`/${functionName}/playlists`, async (c) => {
  try {
    const { name, tracks } = await c.req.json()
    const playlists = await kv.get('playlists') || []
    
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      tracks,
      createdAt: new Date().toISOString()
    }
    
    playlists.push(newPlaylist)
    await kv.set('playlists', playlists)
    
    return c.json({ playlist: newPlaylist })
  } catch (error) {
    console.log('Error creating playlist:', error)
    return c.json({ error: 'Failed to create playlist' }, 500)
  }
})

app.delete(`/${functionName}/playlists/:id`, async (c) => {
  try {
    const id = c.req.param('id')
    const playlists = await kv.get('playlists') || []
    
    const updatedPlaylists = playlists.filter((p: any) => p.id !== id)
    await kv.set('playlists', updatedPlaylists)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting playlist:', error)
    return c.json({ error: 'Failed to delete playlist' }, 500)
  }
})

Deno.serve(app.fetch)
