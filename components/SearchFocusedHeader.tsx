import React from 'react'
import { Search, Settings } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface SearchFocusedHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onSettingsClick: () => void
  isMobile: boolean
}

export function SearchFocusedHeader({
  searchQuery,
  onSearchChange,
  onSettingsClick,
  isMobile
}: SearchFocusedHeaderProps) {
  return (
    <header className="bg-card/50 backdrop-blur-sm border-b border-border">
      <div className="px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-3">
          {/* Search Bar - Takes most space */}
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isMobile ? "Search music..." : "Search songs, artists, albums, playlists..."}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-base md:text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 opacity-60 hover:opacity-100"
              >
                ×
              </Button>
            )}
          </div>

          {/* Settings Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSettingsClick}
            className="flex-shrink-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}