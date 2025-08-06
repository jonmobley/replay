import React, { useState, useEffect, useMemo } from 'react'
import { RefreshCw, Play, Search, Home, Library, Music, Clock, Folder, Heart, Plus, Download, Wifi, WifiOff, HelpCircle, Sparkles, Cloud, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Badge } from './components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './components/ui/sheet'
import { useIsMobile } from './components/ui/use-mobile'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { MusicPlayer } from './components/MusicPlayer'
import { TrackRow } from './components/TrackRow'
import { MobileTrackRow } from './components/MobileTrackRow'
import { FloatingMusicPlayer } from './components/FloatingMusicPlayer'
import { MobileFloatingPlayer } from './components/MobileFloatingPlayer'
import { FullscreenPlayer } from './components/FullscreenPlayer'
import { SearchFocusedHeader } from './components/SearchFocusedHeader'
import { MobileBottomNav } from './components/MobileBottomNav'
import { Sidebar } from './components/Sidebar'
import { PlaylistManager } from './components/PlaylistManager'
import { RecentlyPlayed } from './components/RecentlyPlayed'

import { Settings } from './components/Settings'
import { KeyboardShortcutsHelp } from './components/KeyboardShortcuts'
import { projectId, publicAnonKey } from './utils/supabase/info'

interface Track {
  id: string
  name: string
  path_lower: string
  size: number
  fileType: string
  artist: string
  album: string
  title: string
  duration?: number | null
  client_modified?: string
  server_modified?: string
}

type AppState = 'checking' | 'disconnected' | 'connected' | 'demo'

// Sample demo tracks with simulated durations
const DEMO_TRACKS: Track[] = [
  {
    id: 'demo-1',
    name: 'Autumn Leaves.mp3',
    path_lower: '/music/jazz/autumn_leaves.mp3',
    size: 4200000,
    fileType: 'MP3',
    artist: 'Miles Davis',
    album: 'Kind of Blue Sessions',
    title: 'Autumn Leaves',
    duration: 245,
    client_modified: '2024-01-15T10:30:00Z',
    server_modified: '2024-01-15T10:30:00Z'
  },
  {
    id: 'demo-2',
    name: 'Bohemian Rhapsody.mp3',
    path_lower: '/music/rock/bohemian_rhapsody.mp3',
    size: 5800000,
    fileType: 'MP3',
    artist: 'Queen',
    album: 'A Night at the Opera',
    title: 'Bohemian Rhapsody',
    duration: 355,
    client_modified: '2024-01-10T14:22:00Z',
    server_modified: '2024-01-10T14:22:00Z'
  },
  {
    id: 'demo-3',
    name: 'Take Five.wav',
    path_lower: '/music/jazz/take_five.wav',
    size: 8900000,
    fileType: 'WAV',
    artist: 'Dave Brubeck Quartet',
    album: 'Time Out',
    title: 'Take Five',
    duration: 324,
    client_modified: '2024-01-20T09:15:00Z',
    server_modified: '2024-01-20T09:15:00Z'
  },
  {
    id: 'demo-4',
    name: 'Hotel California.m4a',
    path_lower: '/music/rock/hotel_california.m4a',
    size: 6200000,
    fileType: 'M4A',
    artist: 'Eagles',
    album: 'Hotel California',
    title: 'Hotel California',
    duration: 391,
    client_modified: '2024-01-18T16:45:00Z',
    server_modified: '2024-01-18T16:45:00Z'
  },
  {
    id: 'demo-5',
    name: 'Clair de Lune.flac',
    path_lower: '/music/classical/clair_de_lune.flac',
    size: 12500000,
    fileType: 'FLAC',
    artist: 'Claude Debussy',
    album: 'Suite Bergamasque',
    title: 'Clair de Lune',
    duration: 279,
    client_modified: '2024-01-12T11:30:00Z',
    server_modified: '2024-01-12T11:30:00Z'
  },
  {
    id: 'demo-6',
    name: 'Billie Jean.mp3',
    path_lower: '/music/pop/billie_jean.mp3',
    size: 4800000,
    fileType: 'MP3',
    artist: 'Michael Jackson',
    album: 'Thriller',
    title: 'Billie Jean',
    duration: 294,
    client_modified: '2024-01-14T13:20:00Z',
    server_modified: '2024-01-14T13:20:00Z'
  },
  {
    id: 'demo-7',
    name: 'So What.mp3',
    path_lower: '/music/jazz/so_what.mp3',
    size: 5100000,
    fileType: 'MP3',
    artist: 'Miles Davis',
    album: 'Kind of Blue',
    title: 'So What',
    duration: 562,
    client_modified: '2024-01-16T08:45:00Z',
    server_modified: '2024-01-16T08:45:00Z'
  },
  {
    id: 'demo-8',
    name: 'Stairway to Heaven.wav',
    path_lower: '/music/rock/stairway_to_heaven.wav',
    size: 9800000,
    fileType: 'WAV',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    title: 'Stairway to Heaven',
    duration: 482,
    client_modified: '2024-01-11T15:30:00Z',
    server_modified: '2024-01-11T15:30:00Z'
  },
  {
    id: 'demo-9',
    name: 'Blue in Green.ogg',
    path_lower: '/music/jazz/blue_in_green.ogg',
    size: 3200000,
    fileType: 'OGG',
    artist: 'Miles Davis',
    album: 'Kind of Blue',
    title: 'Blue in Green',
    duration: 337,
    client_modified: '2024-01-17T12:15:00Z',
    server_modified: '2024-01-17T12:15:00Z'
  },
  {
    id: 'demo-10',
    name: 'The Sound of Silence.mp3',
    path_lower: '/music/folk/sound_of_silence.mp3',
    size: 3900000,
    fileType: 'MP3',
    artist: 'Simon & Garfunkel',
    album: 'Sounds of Silence',
    title: 'The Sound of Silence',
    duration: 198,
    client_modified: '2024-01-19T10:00:00Z',
    server_modified: '2024-01-19T10:00:00Z'
  }
]

export default function App() {
  const [appState, setAppState] = useState<AppState>('checking')
  const [allTracks, setAllTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [currentView, setCurrentView] = useState('home')
  const [showFullscreenPlayer, setShowFullscreenPlayer] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  const isMobile = useIsMobile()

  // Audio player integration
  const { currentTrack, currentTrackIndex, queue, state, actions } = useAudioPlayer()

  useEffect(() => {
    // Check if we should start in demo mode (from localStorage)
    const savedDemoMode = localStorage.getItem('replay-demo-mode') === 'true'
    if (savedDemoMode) {
      enterDemoMode()
    } else {
      checkDropboxConnection()
    }

    // PWA install prompt handling
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // Online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initialize theme from localStorage or system preference
    const initializeTheme = () => {
      const storedTheme = localStorage.getItem('replay-theme')
      if (!storedTheme) {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.toggle('dark', systemPrefersDark)
      }
    }
    initializeTheme()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])



  // Filter tracks based on search
  const { filteredTracks, originalIndices } = useMemo(() => {
    let filtered = allTracks
    let indices = allTracks.map((_, index) => index)

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchingPairs = allTracks
        .map((track, index) => ({ track, index }))
        .filter(({ track }) => 
          track.title.toLowerCase().includes(query) ||
          track.artist.toLowerCase().includes(query) ||
          track.album.toLowerCase().includes(query) ||
          track.name.toLowerCase().includes(query)
        )
      
      filtered = matchingPairs.map(pair => pair.track)
      indices = matchingPairs.map(pair => pair.index)
    }

    return {
      filteredTracks: filtered,
      originalIndices: indices
    }
  }, [allTracks, searchQuery])

  const enterDemoMode = () => {
    setAllTracks(DEMO_TRACKS)
    setAppState('demo')
    setIsDemoMode(true)
    setError(null)
    localStorage.setItem('replay-demo-mode', 'true')
    
    // Add some sample recently played data
    const sampleRecentlyPlayed = [
      { trackId: 'demo-1', timestamp: Date.now() - 1000 * 60 * 30 },
      { trackId: 'demo-2', timestamp: Date.now() - 1000 * 60 * 60 * 2 },
      { trackId: 'demo-6', timestamp: Date.now() - 1000 * 60 * 60 * 4 },
      { trackId: 'demo-3', timestamp: Date.now() - 1000 * 60 * 60 * 24 },
      { trackId: 'demo-8', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2 },
    ]
    localStorage.setItem('replay-recently-played', JSON.stringify(sampleRecentlyPlayed))
  }

  const exitDemoMode = () => {
    setAllTracks([])
    setAppState('checking')
    setIsDemoMode(false)
    setSearchQuery('')
    setShowSettings(false)
    localStorage.removeItem('replay-demo-mode')
    localStorage.removeItem('replay-recently-played')
    checkDropboxConnection()
  }

  const checkDropboxConnection = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a401fe33/dropbox/files`, {
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
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to connect to Dropbox')
        setAppState('disconnected')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setAppState('disconnected')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowInstallPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleTrackPlay = (trackIndex: number) => {
    actions.playTrack(allTracks, trackIndex)
  }

  // Connection checking state
  if (appState === 'checking') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-lg font-medium">Connecting to Dropbox</h2>
            <p className="text-sm text-muted-foreground">Checking your connection...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dropbox connection setup page
  if (appState === 'disconnected') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className={`mx-auto px-4 py-4 ${isMobile ? 'px-4' : 'max-w-4xl px-6'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary-foreground fill-current" />
                </div>
                <div>
                  <h1 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>Replay</h1>
                  {!isMobile && (
                    <p className="text-sm text-muted-foreground">Your personal music streaming experience</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {isOnline ? (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <Wifi className="h-3 w-3 mr-1" />
                    {!isMobile && 'Online'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    <WifiOff className="h-3 w-3 mr-1" />
                    {!isMobile && 'Offline'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className={`mx-auto py-8 ${isMobile ? 'px-4 py-6' : 'max-w-5xl px-6 py-12'}`}>
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className={`font-bold mb-4 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>Welcome to Replay</h2>
            <p className={`text-muted-foreground mb-8 ${isMobile ? 'text-base' : 'text-xl'}`}>
              Transform your Dropbox into a powerful music streaming platform
            </p>
            
            {/* Demo CTA */}
            <Card className="mb-8 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-primary/20">
              <CardContent className={`text-center ${isMobile ? 'p-6' : 'p-8'}`}>
                <div className={`bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  isMobile ? 'h-12 w-12' : 'h-16 w-16'
                }`}>
                  <Sparkles className={`text-primary ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
                </div>
                <h3 className={`font-semibold mb-3 ${isMobile ? 'text-lg' : 'text-2xl'}`}>Try the Demo</h3>
                <p className={`text-muted-foreground mb-6 mx-auto ${
                  isMobile ? 'text-sm' : 'text-base max-w-md'
                }`}>
                  Experience all features with curated sample tracks including jazz classics, rock anthems, and classical masterpieces.
                </p>
                <Button 
                  onClick={enterDemoMode} 
                  size={isMobile ? "default" : "lg"} 
                  className={`${isMobile ? 'w-full' : 'text-base px-8'}`}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Launch Demo Experience
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className={`gap-6 mb-8 ${isMobile ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'}`}>
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cloud className="h-5 w-5" />
                  <span>Dropbox Connection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Connection Required</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {error || 'Connect your Dropbox to access your music collection'}
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={checkDropboxConnection} 
                  disabled={isLoading || !isOnline}
                  className="w-full"
                  size={isMobile ? "default" : "lg"}
                >
                  <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Connecting...' : 'Connect to Dropbox'}
                </Button>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Why Choose Replay?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Music className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">High-Quality Playback</h4>
                    <p className="text-xs text-muted-foreground">Support for FLAC, WAV, MP3, and more</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Search className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Smart Search & Filtering</h4>
                    <p className="text-xs text-muted-foreground">Find tracks by artist, album, or genre instantly</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Listening History</h4>
                    <p className="text-xs text-muted-foreground">Track your music habits and rediscover favorites</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Main interface with mobile-responsive design
  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar Only */}
      {!isMobile && (
        <Sidebar 
          currentView={currentView}
          onViewChange={setCurrentView}
          isDemoMode={isDemoMode}
          trackCount={allTracks.length}
        />
      )}

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className="w-full sm:w-96">
          <SheetHeader className="sr-only">
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>
              Customize your Replay experience including theme, library settings, and offline storage management.
            </SheetDescription>
          </SheetHeader>
          <Settings
            isDemoMode={isDemoMode}
            onExitDemo={exitDemoMode}
            trackCount={allTracks.length}
            isOnline={isOnline}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Simplified Header */}
        <SearchFocusedHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSettingsClick={() => setShowSettings(true)}
          isMobile={isMobile}
        />

        {/* Content Area */}
        <main className={`flex-1 overflow-auto ${isMobile ? 'pb-20' : 'pb-24'}`}>
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            {/* Current View Content */}
            {currentView === 'home' && (
              <div className="space-y-6">
                {/* Welcome Header */}
                <div>
                  <h1 className={`font-bold mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                    Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
                  </h1>
                  <p className="text-muted-foreground">
                    {allTracks.length > 0 
                      ? "Ready to discover your music?" 
                      : "Your music library is ready to explore"
                    }
                  </p>
                </div>

                {/* Recently Added */}
                {allTracks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>Recently Added</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {allTracks
                        .filter(track => track.client_modified || track.server_modified)
                        .sort((a, b) => {
                          const aDate = new Date(a.client_modified || a.server_modified || 0)
                          const bDate = new Date(b.client_modified || b.server_modified || 0)
                          return bDate.getTime() - aDate.getTime()
                        })
                        .slice(0, 4)
                        .map((track, index) => {
                          const trackIndex = allTracks.findIndex(t => t.id === track.id)
                          const isCurrentTrack = trackIndex === currentTrackIndex
                          const modifiedDate = new Date(track.client_modified || track.server_modified || 0)
                          const formatRelativeTime = (date: Date) => {
                            const now = new Date()
                            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
                            
                            if (diffInSeconds < 60) return 'Just now'
                            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
                            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
                            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
                            return date.toLocaleDateString()
                          }

                          return isMobile ? (
                            <div
                              key={track.id}
                              className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                                isCurrentTrack ? 'bg-primary/5 border-l-4 border-primary' : ''
                              }`}
                              onClick={() => handleTrackPlay(trackIndex)}
                            >
                              <div className="flex-shrink-0 mr-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                                  isCurrentTrack ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                }`}>
                                  <Music className="h-4 w-4" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate leading-tight">{track.title}</p>
                                <p className="text-xs text-muted-foreground truncate leading-tight">{track.artist} • Added {formatRelativeTime(modifiedDate)}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-shrink-0 h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleTrackPlay(trackIndex)
                                }}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              key={track.id}
                              className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                                isCurrentTrack ? 'bg-primary/5 border-l-4 border-primary' : ''
                              }`}
                              onClick={() => handleTrackPlay(trackIndex)}
                            >
                              <div className="flex-shrink-0 mr-3">
                                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                                  isCurrentTrack ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                }`}>
                                  <Music className="h-5 w-5" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate leading-tight">{track.title}</p>
                                <p className="text-xs text-muted-foreground truncate leading-tight">{track.artist} • {track.album} • Added {formatRelativeTime(modifiedDate)}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-shrink-0 h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleTrackPlay(trackIndex)
                                }}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                )}

                {/* Recently Played */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>Recently Played</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentView('recent')}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      View all
                    </Button>
                  </div>
                  <RecentlyPlayed
                    allTracks={allTracks}
                    currentTrackIndex={currentTrackIndex}
                    onTrackSelect={handleTrackPlay}
                    onLoadAsPlaylist={() => {}}
                    compact={true}
                    isDemoMode={isDemoMode}
                  />
                </div>
              </div>
            )}

            {currentView === 'tracks' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>My Library</h1>
                    <p className="text-muted-foreground">{filteredTracks.length} of {allTracks.length} songs</p>
                  </div>
                  {!isMobile && (
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Music
                    </Button>
                  )}
                </div>





                {/* Track List */}
                <div className={isMobile ? 'space-y-0' : 'space-y-1'}>
                  {filteredTracks.map((track, index) => 
                    isMobile ? (
                      <MobileTrackRow
                        key={track.id}
                        track={track}
                        index={index}
                        isPlaying={state.isPlaying && currentTrackIndex === originalIndices[index]}
                        isCurrentTrack={currentTrackIndex === originalIndices[index]}
                        onPlay={() => handleTrackPlay(originalIndices[index])}
                      />
                    ) : (
                      <TrackRow
                        key={track.id}
                        track={track}
                        index={index}
                        isPlaying={state.isPlaying && currentTrackIndex === originalIndices[index]}
                        isCurrentTrack={currentTrackIndex === originalIndices[index]}
                        onPlay={() => handleTrackPlay(originalIndices[index])}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            {currentView === 'recent' && (
              <div className="space-y-6">
                <div>
                  <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Recently Played</h1>
                  <p className="text-muted-foreground">Your listening history</p>
                </div>
                <RecentlyPlayed
                  allTracks={allTracks}
                  currentTrackIndex={currentTrackIndex}
                  onTrackSelect={handleTrackPlay}
                  onLoadAsPlaylist={() => {}}
                  isDemoMode={isDemoMode}
                />
              </div>
            )}

            {currentView === 'favorites' && (
              <div className="space-y-6">
                <div>
                  <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Favorites</h1>
                  <p className="text-muted-foreground">Your favorite tracks</p>
                </div>
                {/* Favorites content would go here */}
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground">Start adding tracks to your favorites to see them here</p>
                </div>
              </div>
            )}

            {currentView === 'playlists' && (
              <PlaylistManager
                tracks={allTracks}
                onLoadPlaylist={() => {}}
              />
            )}

            {currentView === 'search' && (
              <div className="space-y-6">
                <div>
                  <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Search</h1>
                  <p className="text-muted-foreground">Find your favorite tracks</p>
                </div>
                
                {/* Mobile Search Results */}
                {isMobile && searchQuery && (
                  <div className="space-y-0">
                    {filteredTracks.map((track, index) => (
                      <MobileTrackRow
                        key={track.id}
                        track={track}
                        index={index}
                        isPlaying={state.isPlaying && currentTrackIndex === originalIndices[index]}
                        isCurrentTrack={currentTrackIndex === originalIndices[index]}
                        onPlay={() => handleTrackPlay(originalIndices[index])}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Fullscreen Player */}
      <FullscreenPlayer
        isOpen={showFullscreenPlayer}
        onClose={() => setShowFullscreenPlayer(false)}
        currentTrack={currentTrack}
        isPlaying={state.isPlaying}
        currentTime={state.currentTime}
        duration={state.duration}
        volume={state.volume}
        isShuffled={state.isShuffled}
        repeatMode={state.repeatMode}
        onPlayPause={actions.togglePlay}
        onPrevious={actions.handlePrevious}
        onNext={actions.handleNext}
        onSeek={actions.seek}
        onVolumeChange={actions.setVolume}
        onToggleShuffle={actions.toggleShuffle}
        onToggleRepeat={actions.toggleRepeat}
      />

      {/* Desktop Floating Music Player */}
      {!isMobile && (
        <FloatingMusicPlayer
          currentTrack={currentTrack}
          isPlaying={state.isPlaying}
          currentTime={state.currentTime}
          duration={state.duration}
          volume={state.volume}
          isShuffled={state.isShuffled}
          repeatMode={state.repeatMode}
          onPlayPause={actions.togglePlay}
          onPrevious={actions.handlePrevious}
          onNext={actions.handleNext}
          onSeek={actions.seek}
          onVolumeChange={actions.setVolume}
          onToggleShuffle={actions.toggleShuffle}
          onToggleRepeat={actions.toggleRepeat}
          onExpand={() => setShowFullscreenPlayer(true)}
          isVisible={!!currentTrack && !showFullscreenPlayer}
        />
      )}

      {/* Mobile Floating Player */}
      {isMobile && (
        <MobileFloatingPlayer
          currentTrack={currentTrack}
          isPlaying={state.isPlaying}
          currentTime={state.currentTime}
          duration={state.duration}
          onPlayPause={actions.togglePlay}
          onNext={actions.handleNext}
          onExpand={() => setShowFullscreenPlayer(true)}
          isVisible={!!currentTrack && !showFullscreenPlayer}
        />
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNav
          currentView={currentView}
          onViewChange={setCurrentView}
          trackCount={allTracks.length}
        />
      )}

      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className={`fixed z-40 ${isMobile ? 'bottom-24 left-4 right-4' : 'bottom-20 right-6'}`}>
          <Card className="bg-primary text-primary-foreground shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Download className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Install Replay</p>
                  <p className="text-xs opacity-90">Get the full app experience</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleInstallApp}
                >
                  Install
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}