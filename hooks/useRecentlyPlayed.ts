import { useState, useEffect, useMemo, useCallback } from 'react'
import { useStore } from '../store'
import { Track } from '../data/tracks'
import { projectId, publicAnonKey, functionName } from '../utils/supabase/info'

export interface RecentlyPlayedItem {
  track: Track
  firstPlayed: string
  lastPlayed: string
  playCount: number
}

export type SortOption = 'recent' | 'frequent' | 'alphabetical'
export type TimeFilter = 'all' | 'today' | 'week' | 'month'

export const useRecentlyPlayed = () => {
  const { allTracks, isDemoMode } = useStore()
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

  const fetchRecentlyPlayed = useCallback(async () => {
    setIsLoading(true)
    try {
      const localData = localStorage.getItem('replay-recently-played')
      if (isDemoMode) {
        if (localData) {
          const parsed = JSON.parse(localData)
          const converted = parsed.map((item: any) => {
            const track = allTracks.find(t => t.id === item.trackId)
            if (track) {
              return {
                track,
                firstPlayed: new Date(item.timestamp).toISOString(),
                lastPlayed: new Date(item.timestamp).toISOString(),
                playCount: 1
              }
            }
            return null
          }).filter(Boolean)
          setRecentlyPlayed(converted)
        }
      } else {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/${functionName}/recently-played`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        })
        if (response.ok) {
          const data = await response.json()
          setRecentlyPlayed(data.recentlyPlayed)
          localStorage.setItem('replay-recently-played', JSON.stringify(data.recentlyPlayed))
        } else {
          if (localData) setRecentlyPlayed(JSON.parse(localData))
        }
      }
    } catch (error) {
      const localData = localStorage.getItem('replay-recently-played')
      if (localData) setRecentlyPlayed(JSON.parse(localData))
    } finally {
      setIsLoading(false)
    }
  }, [isDemoMode, allTracks])

  useEffect(() => {
    fetchRecentlyPlayed()
  }, [fetchRecentlyPlayed])

  const clearHistory = useCallback(async () => {
    try {
      localStorage.removeItem('replay-recently-played')
      if (!isDemoMode) {
        await fetch(`https://${projectId}.supabase.co/functions/v1/${functionName}/recently-played`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        })
      }
      setRecentlyPlayed([])
    } catch (error) {
      console.warn('Error clearing recently played:', error)
      // Optionally, restore local data if remote clear fails
    }
  }, [isDemoMode])

  const filteredAndSortedItems = useMemo(() => {
    const timeFiltered = (() => {
      const now = new Date()
      switch (timeFilter) {
        case 'today':
          return recentlyPlayed.filter(item => new Date(item.lastPlayed) >= new Date(now.getTime() - 24 * 60 * 60 * 1000))
        case 'week':
          return recentlyPlayed.filter(item => new Date(item.lastPlayed) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
        case 'month':
          return recentlyPlayed.filter(item => new Date(item.lastPlayed) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
        default:
          return recentlyPlayed
      }
    })()

    switch (sortBy) {
      case 'frequent':
        return [...timeFiltered].sort((a, b) => b.playCount - a.playCount)
      case 'alphabetical':
        return [...timeFiltered].sort((a, b) => a.track.title.localeCompare(b.track.title))
      default:
        return [...timeFiltered].sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
    }
  }, [recentlyPlayed, sortBy, timeFilter])

  return {
    recentlyPlayed,
    isLoading,
    sortBy,
    setSortBy,
    timeFilter,
    setTimeFilter,
    clearHistory,
    filteredAndSortedItems,
  }
}


