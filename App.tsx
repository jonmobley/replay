import React, { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { useIsMobile } from './components/ui/use-mobile'
import { useStore } from './store'
import { useDropbox } from './hooks/useDropbox'
import { useFavorites } from './hooks/useFavorites'
import { usePlaylists } from './hooks/usePlaylists'
import { LoadingPage } from './pages/LoadingPage'
import { DisconnectedPage } from './pages/DisconnectedPage'
import { MainLayout } from './components/MainLayout'

export default function App() {
  const { appState, setIsOnline, enterDemoMode } = useStore()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const isMobile = useIsMobile()
  const { checkDropboxConnection } = useDropbox()

  useFavorites()
  usePlaylists()

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
      window.removeEventListener('offline', 'handleOffline')
    }
  }, [enterDemoMode, checkDropboxConnection, setIsOnline])

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

  if (appState === 'checking') {
    return <LoadingPage />
  }

  if (appState === 'disconnected') {
    return <DisconnectedPage />
  }

  return (
    <>
      <MainLayout />
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
    </>
  )
}
