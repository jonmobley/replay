import React from 'react'
import { useStore } from '../store'
import { Heart, Play } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useIsMobile } from './ui/use-mobile'

interface QuickFavoritesProps {
  onTrackPlay: (trackIndex: number) => void
}

export function QuickFavorites({ onTrackPlay }: QuickFavoritesProps) {
  const { allTracks, favoriteTrackIds, setCurrentView } = useStore()
  const isMobile = useIsMobile()

  const favoriteTracks = allTracks.filter((track) =>
    favoriteTrackIds.includes(track.id),
  )

  if (favoriteTracks.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span className={isMobile ? 'text-base' : 'text-lg'}>
            Quick Favorites
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {favoriteTracks.slice(0, 4).map((track) => {
            const trackIndex = allTracks.findIndex((t) => t.id === track.id)
            return (
              <div
                key={track.id}
                className="flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => onTrackPlay(trackIndex)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full"
                >
                  <Play className="h-4 w-4" />
                </Button>

                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-medium truncate ${
                      isMobile ? 'text-sm' : ''
                    }`}
                  >
                    {track.title}
                  </h4>
                  <p
                    className={`text-muted-foreground truncate ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}
                  >
                    {track.artist}
                  </p>
                </div>
              </div>
            )
          })}

          {favoriteTracks.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => setCurrentView('favorites')}
            >
              View all {favoriteTracks.length} favorites
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
