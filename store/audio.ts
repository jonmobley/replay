import { create } from 'zustand'
import { Track } from '../data/tracks'

export type RepeatMode = 'none' | 'one' | 'all'

interface AudioState {
  currentTrack: Track | null
  queue: Track[]
  originalQueue: Track[]
  currentTrackIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isShuffled: boolean
  repeatMode: RepeatMode
}

interface AudioActions {
  playTrack: (tracks: Track[], index: number) => void
  togglePlay: () => void
  handleNext: () => void
  handlePrevious: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  _setAudioState: (state: Partial<AudioState>) => void
}

export const useAudioStore = create<AudioState & AudioActions>((set, get) => ({
  // State
  currentTrack: null,
  queue: [],
  originalQueue: [],
  currentTrackIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isShuffled: false,
  repeatMode: 'none',

  // Actions
  playTrack: (tracks, index) => {
    set({
      queue: tracks,
      originalQueue: tracks,
      currentTrack: tracks[index],
      currentTrackIndex: index,
      isPlaying: true,
    })
  },
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  handleNext: () => {
    const { currentTrackIndex, queue, repeatMode } = get()
    if (currentTrackIndex < queue.length - 1) {
      set({
        currentTrack: queue[currentTrackIndex + 1],
        currentTrackIndex: currentTrackIndex + 1,
      })
    } else if (repeatMode === 'all') {
      set({
        currentTrack: queue[0],
        currentTrackIndex: 0,
      })
    }
  },
  handlePrevious: () => {
    const { currentTrackIndex, queue } = get()
    if (currentTrackIndex > 0) {
      set({
        currentTrack: queue[currentTrackIndex - 1],
        currentTrackIndex: currentTrackIndex - 1,
      })
    }
  },
  seek: (time) => set({ currentTime: time }),
  setVolume: (volume) => set({ volume }),
  toggleShuffle: () => {
    const { isShuffled, queue, originalQueue, currentTrack } = get()
    if (isShuffled) {
      // un-shuffle
      const newIndex = originalQueue.findIndex(t => t.id === currentTrack?.id)
      set({ 
        isShuffled: false, 
        queue: originalQueue,
        currentTrackIndex: newIndex
      })
    } else {
      // shuffle
      const newQueue = [...originalQueue]
      // remove current track
      const [removed] = newQueue.splice(originalQueue.findIndex(t => t.id === currentTrack?.id), 1)
      // shuffle rest
      for (let i = newQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
      }
      // add current track to beginning
      newQueue.unshift(removed)
      set({ 
        isShuffled: true, 
        queue: newQueue,
        currentTrackIndex: 0
      })
    }
  },
  toggleRepeat: () => {
    const { repeatMode } = get()
    const nextRepeatMode =
      repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none'
    set({ repeatMode: nextRepeatMode })
  },
  _setAudioState: (state) => set(state),
}))

