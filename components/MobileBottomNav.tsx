import React from 'react'
import { Home, Library, Music } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface MobileBottomNavProps {
  currentView: string
  onViewChange: (view: string) => void
  trackCount: number
}

export function MobileBottomNav({ currentView, onViewChange, trackCount }: MobileBottomNavProps) {
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      count: null
    },
    {
      id: 'tracks',
      label: 'Library',
      icon: Library,
      count: null
    },
    {
      id: 'playlists',
      label: 'Playlists',
      icon: Music,
      count: null
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Following Apple HIG: Tab bars should have a subtle background with proper blur */}
      <div className="bg-card/95 backdrop-blur-xl border-t border-border/50">
        {/* Apple HIG: Safe area padding and proper spacing */}
        <div className="px-2 pt-2 pb-safe">
          <div className="grid grid-cols-3 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => onViewChange(item.id)}
                  className={`
                    flex flex-col items-center justify-center
                    h-12 px-3 py-1.5
                    rounded-lg
                    transition-all duration-200
                    ${isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <div className="relative mb-0.5">
                    <Icon className={`h-6 w-6 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
                    {item.count !== null && item.count > 0 && (
                      <Badge 
                        variant="secondary" 
                        className={`
                          absolute -top-2 -right-2 
                          h-4 min-w-4 
                          text-[10px] leading-none
                          px-1.5 py-0
                          bg-primary text-primary-foreground
                          ${isActive ? 'scale-110' : ''}
                          transition-transform duration-200
                        `}
                      >
                        {item.count > 99 ? '99+' : item.count}
                      </Badge>
                    )}
                  </div>
                  {/* Apple HIG: Tab labels should be small and positioned below icons */}
                  <span className={`
                    text-[10px] leading-none
                    ${isActive ? 'font-medium' : 'font-normal'}
                    transition-all duration-200
                  `}>
                    {item.label}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}