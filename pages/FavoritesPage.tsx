import React from 'react'
import { useIsMobile } from '../components/ui/use-mobile'
import { Heart } from 'lucide-react'

export function FavoritesPage() {
  const isMobile = useIsMobile()

  return (
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
  )
}