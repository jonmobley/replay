import { useEffect, useRef } from 'react'
import { useAudioStore } from '../store/audio'
import { Track } from '../data/tracks'

// This hook is responsible for managing the audio element and side effects
export const useAudioController = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    repeatMode,
    isShuffled,
    _setAudioState,
    handleNext,
    togglePlay,
    handlePrevious,
    seek,
  } = useAudioStore()

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      const savedVolume = localStorage.getItem('replay-volume')
      const initialVolume = savedVolume ? parseFloat(savedVolume) : 0.8
      audioRef.current.volume = initialVolume
      _setAudioState({ volume: initialVolume })
    }

    const audio = audioRef.current
    const handleLoadedMetadata = () => _setAudioState({ duration: audio.duration })
    const handleTimeUpdate = () => _setAudioState({ currentTime: audio.currentTime })
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0
        audio.play()
      } else {
        handleNext()
      }
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [repeatMode, handleNext, _setAudioState])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (currentTrack) {
      if (audio.src !== currentTrack.path_lower) {
        // This is a simplified load function. 
        // In a real app, you'd fetch a temporary URL here.
        audio.src = `/demo-audio/${currentTrack.id}.mp3` // MOCK URL
      }
      if (isPlaying) {
        audio.play().catch(console.error)
      } else {
        audio.pause()
      }
    } else {
      audio.pause()
    }
  }, [currentTrack, isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (audio && audio.volume !== volume) {
      audio.volume = volume
      localStorage.setItem('replay-volume', volume.toString())
    }
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    // This check is to prevent seeking on initial load
    if (audio && Math.abs(audio.currentTime - currentTime) > 1) {
      audio.currentTime = currentTime
    }
  }, [])

  // Media Session API integration
  useEffect(() => {
    if ('mediaSession' in navigator) {
      if (currentTrack) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album,
          artwork: [{ src: '/placeholder-album.png', sizes: '512x512', type: 'image/png' }]
        });
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      }

      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime) seek(details.seekTime);
      });
    }
  }, [currentTrack, isPlaying, handleNext, handlePrevious, togglePlay, seek]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowRight':
          e.preventDefault()
          if (e.shiftKey) handleNext()
          else seek(Math.min(currentTime + 10, audioRef.current?.duration || 0))
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (e.shiftKey) handlePrevious()
          else seek(Math.max(currentTime - 10, 0))
          break
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [togglePlay, handleNext, handlePrevious, seek, currentTime])
}


