import React, { useState, Suspense } from 'react'
import { useIsMobile } from './ui/use-mobile'
import { useStore } from '../store'
import { useAudioStore } from '../store/audio'
import { Sidebar } from './Sidebar'
import { SearchFocusedHeader } from './SearchFocusedHeader'
import { Settings } from './Settings'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet'
import { Toaster } from 'sonner'
import { FloatingMusicPlayer } from './FloatingMusicPlayer'
import { MobileFloatingPlayer } from './MobileFloatingPlayer'
import { FullscreenPlayer } from './FullscreenPlayer'
import { MobileBottomNav } from './MobileBottomNav'
import { useAudioController } from '../hooks/useAudioController'

const HomePage = React.lazy(() => import('../pages/HomePage'))
const LibraryPage = React.lazy(() => import('../pages/LibraryPage'))
const RecentlyPlayedPage = React.lazy(() => import('../pages/RecentlyPlayedPage'))
const FavoritesPage = React.lazy(() => import('../pages/FavoritesPage'))
const PlaylistsPage = React.lazy(() => import('../pages/PlaylistsPage'))
const SearchPage = React.lazy(() => import('../pages/SearchPage'))

export const MainLayout: React.FC = () => {
  const { currentView, allTracks, isDemoMode, isOnline, exitDemoMode } = useStore()
  const audioState = useAudioStore()
  const [showSettings, setShowSettings] = useState(false)
  const [showFullscreenPlayer, setShowFullscreenPlayer] = useState(false)
  const isMobile = useIsMobile()
  
  useAudioController()

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Toaster />
      {!isMobile && (
        <Sidebar 
          isDemoMode={isDemoMode}
          trackCount={allTracks.length}
        />
      )}

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

      <div className="flex-1 flex flex-col min-w-0">
        <SearchFocusedHeader
          onSettingsClick={() => setShowSettings(true)}
          isMobile={isMobile}
        />

        <main className={`flex-1 overflow-auto ${isMobile ? 'pb-20' : 'pb-24'}`}>
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
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

      <FullscreenPlayer
        isOpen={showFullscreenPlayer}
        onClose={() => setShowFullscreenPlayer(false)}
        {...audioState}
        onPlayPause={audioState.togglePlay}
        onPrevious={audioState.handlePrevious}
        onNext={audioState.handleNext}
        onSeek={audioState.seek}
        onVolumeChange={audioState.setVolume}
        onToggleShuffle={audioState.toggleShuffle}
        onToggleRepeat={audioState.toggleRepeat}
      />

      {!isMobile && (
        <FloatingMusicPlayer
          {...audioState}
          onPlayPause={audioState.togglePlay}
          onPrevious={audioState.handlePrevious}
          onNext={audioState.handleNext}
          onSeek={audioState.seek}
          onVolumeChange={audioState.setVolume}
          onToggleShuffle={audioState.toggleShuffle}
          onToggleRepeat={audioState.toggleRepeat}
          onExpand={() => setShowFullscreenPlayer(true)}
          isVisible={!!audioState.currentTrack && !showFullscreenPlayer}
        />
      )}

      {isMobile && (
        <MobileFloatingPlayer
          {...audioState}
          onPlayPause={audioState.togglePlay}
          onNext={audioState.handleNext}
          onExpand={() => setShowFullscreenPlayer(true)}
          isVisible={!!audioState.currentTrack && !showFullscreenPlayer}
        />
      )}

      {isMobile && (
        <MobileBottomNav
          trackCount={allTracks.length}
        />
      )}
    </div>
  )
}

