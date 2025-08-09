import React from 'react'
import { RefreshCw, Play, Wifi, WifiOff, Sparkles, Cloud, AlertCircle, Music, Search, Clock } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useIsMobile } from '../components/ui/use-mobile'
import { useStore } from '../store'
import { useDropbox } from '../hooks/useDropbox'

export const DisconnectedPage: React.FC = () => {
  const isMobile = useIsMobile()
  const { isLoading, error, isOnline } = useStore()
  const { checkDropboxConnection } = useDropbox()
  const enterDemoMode = useStore((state) => state.enterDemoMode)

  return (
    <div className="min-h-screen bg-background">
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
        <div className="text-center mb-8">
          <h2 className={`font-bold mb-4 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>Welcome to Replay</h2>
          <p className={`text-muted-foreground mb-8 ${isMobile ? 'text-base' : 'text-xl'}`}>
            Transform your Dropbox into a powerful music streaming platform
          </p>
          
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


