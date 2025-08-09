import React, { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Download, 
  Trash2, 
  HelpCircle, 
  ExternalLink, 
  Wifi, 
  WifiOff,
  Monitor,
  Sun,
  Moon,
  Check
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { useOfflineStorage } from '../hooks/useOfflineStorage'

interface SettingsProps {
  isDemoMode: boolean
  onExitDemo: () => void
  trackCount: number
  isOnline: boolean
}

type Theme = 'light' | 'dark' | 'system'

export function Settings({ isDemoMode, onExitDemo, trackCount, isOnline }: SettingsProps) {
  const { 
    offlineTracks, 
    storageUsed, 
    clearAllOfflineTracks 
  } = useOfflineStorage()

  const [currentTheme, setCurrentTheme] = useState<Theme>('system')

  useEffect(() => {
    // Load current theme from localStorage
    const savedTheme = localStorage.getItem('replay-theme') as Theme
    if (savedTheme) {
      setCurrentTheme(savedTheme)
    }
  }, [])

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme)
    localStorage.setItem('replay-theme', theme)
    
    // Apply theme
    const root = document.documentElement
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', systemPrefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }

  const handleClearOfflineStorage = async () => {
    try {
      await clearAllOfflineTracks()
    } catch (error) {
      console.error('Failed to clear offline storage:', error)
    }
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">Settings</h2>
          <p className="text-muted-foreground">Customize your Replay experience</p>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Theme</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={currentTheme === 'light' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('light')}
                  className="flex flex-col items-center gap-2 h-16"
                >
                  <Sun className="h-4 w-4" />
                  <span className="text-xs">Light</span>
                  {currentTheme === 'light' && <Check className="h-3 w-3" />}
                </Button>
                <Button
                  variant={currentTheme === 'dark' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('dark')}
                  className="flex flex-col items-center gap-2 h-16"
                >
                  <Moon className="h-4 w-4" />
                  <span className="text-xs">Dark</span>
                  {currentTheme === 'dark' && <Check className="h-3 w-3" />}
                </Button>
                <Button
                  variant={currentTheme === 'system' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('system')}
                  className="flex flex-col items-center gap-2 h-16"
                >
                  <Monitor className="h-4 w-4" />
                  <span className="text-xs">System</span>
                  {currentTheme === 'system' && <Check className="h-3 w-3" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Choose how Replay looks to you. System setting matches your device's theme.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Library Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>Library</span>
              {isOnline ? (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total tracks</span>
              <Badge variant="secondary">{trackCount}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Downloaded tracks</span>
              <Badge variant="secondary">{offlineTracks.length}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Storage used</span>
              <Badge variant="secondary">{storageUsed}</Badge>
            </div>

            {offlineTracks.length > 0 && (
              <>
                <Separator />
                <Button 
                  variant="outline" 
                  onClick={handleClearOfflineStorage}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Downloaded Music
                </Button>
                <p className="text-xs text-muted-foreground">
                  This will remove all downloaded tracks from your device. You can download them again anytime.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Demo Mode */}
        {isDemoMode && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>Demo Mode</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You're currently using Replay in demo mode with sample tracks. Connect your Dropbox to access your personal music library.
              </p>
              <Button onClick={onExitDemo} variant="outline" className="w-full">
                Exit Demo & Connect Dropbox
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help & Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Help & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start" onClick={() => { /* TODO: Implement keyboard shortcuts modal */ }}>
              <HelpCircle className="h-4 w-4 mr-3" />
              Keyboard Shortcuts
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" onClick={() => { /* TODO: Link to documentation */ }}>
              <ExternalLink className="h-4 w-4 mr-3" />
              Documentation
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" onClick={() => { /* TODO: Link to issue tracker */ }}>
              <ExternalLink className="h-4 w-4 mr-3" />
              Report an Issue
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About Replay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Version</span>
              {/* TODO: Dynamically get version from package.json */}
              <Badge variant="outline">1.0.0</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Build</span>
              {/* TODO: Dynamically get build date/number */}
              <Badge variant="outline">2024.01</Badge>
            </div>
            
            <Separator />
            
            <p className="text-xs text-muted-foreground">
              Replay transforms your Dropbox into a powerful music streaming platform with offline support and advanced playback features.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}