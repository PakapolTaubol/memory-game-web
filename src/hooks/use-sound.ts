"use client"

import { useState, useEffect, useRef } from "react"

type SoundOptions = {
  volume?: number
  loop?: boolean
  autoplay?: boolean
}

export function useSound(soundPath: string, options: SoundOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      // Create audio element
      const audio = new Audio(soundPath)

      // Set options
      if (options.loop !== undefined) audio.loop = options.loop
      if (options.volume !== undefined) audio.volume = options.volume

      // Set up event listeners
      audio.addEventListener("canplaythrough", () => {
        setIsLoaded(true)
        if (options.autoplay) {
          play()
        }
      })

      audio.addEventListener("ended", () => {
        if (!options.loop) {
          setIsPlaying(false)
        }
      })

      audio.addEventListener("error", (e) => {
        console.warn(`Error loading sound ${soundPath}:`, e)
        setError(new Error(`Failed to load sound: ${soundPath}`))
        setIsLoaded(false)
      })

      // Store reference
      audioRef.current = audio

      // Clean up
      return () => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ""
          audioRef.current = null
        }
      }
    } catch (err) {
      console.error("Error initializing audio:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    }
  }, [soundPath])

  // Update volume when options change
  useEffect(() => {
    if (audioRef.current && options.volume !== undefined) {
      audioRef.current.volume = options.volume
    }
  }, [options.volume])

  const play = () => {
    if (audioRef.current && isLoaded && !error) {
      try {
        audioRef.current.currentTime = 0
        const playPromise = audioRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
            })
            .catch((err) => {
              console.warn("Error playing sound:", err)
              setIsPlaying(false)
            })
        }
      } catch (err) {
        console.warn("Error playing sound:", err)
      }
    }
  }

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggle = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  return {
    play,
    pause,
    toggle,
    isPlaying,
    isLoaded,
    error,
  }
}
