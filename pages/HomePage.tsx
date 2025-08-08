import React from 'react'
import { useStore } from '../store'
import { useAudioStore } from '../store/audio'
import { useIsMobile } from '../components/ui/use-mobile'
import { Button } from '../components/ui/button'
import { RecentlyPlayed } from '../components/RecentlyPlayed'
import { formatRelativeTime } from '../utils/time'
import { Music, Play } from 'lucide-react'
import { QuickFavorites } from '../components/QuickFavorites'

export default function HomePage() {
  const { allTracks, setCurrentView } = useStore()
  const { currentTrackIndex, playTrack } = useAudioStore()
  const isMobile = useIsMobile()

  const handleTrackPlay = (trackIndex: number) => {
    playTrack(allTracks, trackIndex)
  }

  return (
    <div className="space-y-6">
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

      <QuickFavorites onTrackPlay={handleTrackPlay} />

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
              .map((track) => {
                const trackIndex = allTracks.findIndex(t => t.id === track.id)
                const isCurrentTrack = trackIndex === currentTrackIndex
                const modifiedDate = new Date(track.client_modified || track.server_modified || 0)

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
          onTrackSelect={handleTrackPlay}
        />
      </div>
    </div>
  )
}
