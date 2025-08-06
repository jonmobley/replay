import React from 'react'
import { Home, Library, Clock, Heart, Music, Play, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

import { useStore } from '../store'

interface SidebarProps {
  trackCount: number
}

export function Sidebar({ trackCount }: SidebarProps) {
  const { currentView, setCurrentView, isDemoMode } = useStore()
  const mainNavItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home
    },
    {
      id: 'tracks',
      label: 'Your Library',
      icon: Library,
      count: trackCount
    },
    {
      id: 'recent',
      label: 'Recently Played',
      icon: Clock
    }
  ]

  const playlistItems = [
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Heart
    },
    {
      id: 'playlists',
      label: 'Playlists',
      icon: Music
    }
  ]

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Play className="h-5 w-5 text-sidebar-primary-foreground fill-current" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">Replay</h1>
            {isDemoMode && (
              <div className="flex items-center space-x-1 mt-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary font-medium">Demo Mode</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto p-3">
        <nav className="space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full justify-start text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent ${
                      isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.count > 999 ? '999+' : item.count}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Playlists Section */}
          <div>
            <h3 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-2 px-3">
              Playlists
            </h3>
            <div className="space-y-1">
              {playlistItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full justify-start text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent ${
                      isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}