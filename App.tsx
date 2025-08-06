import React, { useState, useEffect, useMemo, Suspense } from 'react'
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
import { DEMO_TRACKS, Track } from './data/tracks'
import { useStore } from './store'
import { useDropbox } from './hooks/useDropbox'
import { Toaster, toast } from 'sonner'

const HomePage = React.lazy(() => import('./pages/HomePage'))
const LibraryPage = React.lazy(() => import('./pages/LibraryPage'))
const RecentlyPlayedPage = React.lazy(() => import('./pages/RecentlyPlayedPage'))
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage'))
const PlaylistsPage = React.lazy(() => import('./pages/PlaylistsPage'))
const SearchPage = React.lazy(() => import('./pages/SearchPage'))

export default function App() {
  const {
    appState,
    setAppState,
    allTracks,
    setAllTracks,
    isLoading,
    setIsLoading,
    error,
    setError,
    isOnline,
    setIsOnline,
    isDemoMode,
    setIsDemoMode,
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
  } = useStore()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showFullscreenPlayer, setShowFullscreenPlayer] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const isMobile = useIsMobile()

  // Audio player integration
  const { currentTrack, currentTrackIndex, queue, state, actions } = useAudioPlayer()

  const { checkDropboxConnection } = useDropbox()

  useEffect(() => {
    const savedDemoMode = localStorage.getItem('replay-demo-mode') === 'true'
    if (savedDemoMode) {
      enterDemoMode()
    } else {
      checkDropboxConnection()
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

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
  }, [enterDemoMode, checkDropboxConnection, setIsOnline])

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

  const enterDemoMode = useStore((state) => state.enterDemoMode)
  const exitDemoMode = useStore((state) => state.exitDemoMode)

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
      <Toaster />
      {/* Desktop Sidebar Only */}
      {!isMobile && (
        <Sidebar 
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
          onSettingsClick={() => setShowSettings(true)}
          isMobile={isMobile}
        />

        {/* Content Area */}
        <main className={`flex-1 overflow-auto ${isMobile ? 'pb-20' : 'pb-24'}`}>
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            {/* Current View Content */}
            <Suspense fallback={<div>Loading...</div>}>
              {currentView === 'home' && <HomePage />}
              {currentView === 'tracks' && <LibraryPage />}
              {currentView === 'recent' && <RecentlyPlayedPage />}
              {currentView === 'favorites' && <FavoritesPage />}
              {currentView === 'playlists' && <PlaylistsPage />}
              {currentView === 'search' && <SearchPage />}
            </Suspense>
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
