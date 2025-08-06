import { useEffect } from 'react'

interface KeyboardShortcutsProps {
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onPreviousTrack: () => void
  onNextTrack: () => void
  onVolumeUp: () => void
  onVolumeDown: () => void
  onMute: () => void
  onSeek: (direction: 'forward' | 'backward') => void
  onToggleShuffle: () => void
  onToggleRepeat: () => void
}

export function KeyboardShortcuts({
  isPlaying,
  onPlay,
  onPause,
  onPreviousTrack,
  onNextTrack,
  onVolumeUp,
  onVolumeDown,
  onMute,
  onSeek,
  onToggleShuffle,
  onToggleRepeat
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return
      }

      // Don't trigger if user is holding modifier keys (except for specific combos)
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey

      switch (event.code) {
        case 'Space':
          event.preventDefault()
          if (isPlaying) {
            onPause()
          } else {
            onPlay()
          }
          break

        case 'ArrowLeft':
          if (!hasModifier) {
            event.preventDefault()
            onSeek('backward')
          }
          break

        case 'ArrowRight':
          if (!hasModifier) {
            event.preventDefault()
            onSeek('forward')
          }
          break

        case 'ArrowUp':
          if (!hasModifier) {
            event.preventDefault()
            onVolumeUp()
          }
          break

        case 'ArrowDown':
          if (!hasModifier) {
            event.preventDefault()
            onVolumeDown()
          }
          break

        case 'KeyN':
          if (!hasModifier) {
            event.preventDefault()
            onNextTrack()
          }
          break

        case 'KeyP':
          if (!hasModifier) {
            event.preventDefault()
            onPreviousTrack()
          }
          break

        case 'KeyM':
          if (!hasModifier) {
            event.preventDefault()
            onMute()
          }
          break

        case 'KeyS':
          if (!hasModifier) {
            event.preventDefault()
            onToggleShuffle()
          }
          break

        case 'KeyR':
          if (!hasModifier) {
            event.preventDefault()
            onToggleRepeat()
          }
          break

        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, onPlay, onPause, onPreviousTrack, onNextTrack, onVolumeUp, onVolumeDown, onMute, onSeek, onToggleShuffle, onToggleRepeat])

  return null // This component doesn't render anything
}

export function KeyboardShortcutsHelp() {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Keyboard Shortcuts</h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Play/Pause</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space</kbd>
          </div>
          <div className="flex justify-between">
            <span>Previous Track</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">P</kbd>
          </div>
          <div className="flex justify-between">
            <span>Next Track</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">N</kbd>
          </div>
          <div className="flex justify-between">
            <span>Mute/Unmute</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">M</kbd>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Seek Backward</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">←</kbd>
          </div>
          <div className="flex justify-between">
            <span>Seek Forward</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">→</kbd>
          </div>
          <div className="flex justify-between">
            <span>Volume Up</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑</kbd>
          </div>
          <div className="flex justify-between">
            <span>Volume Down</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↓</kbd>
          </div>
        </div>
      </div>
    </div>
  )
}