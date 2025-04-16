"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type SoundOptions = {
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
};

// Define the type for webkitAudioContext
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export function useSound(soundPath: string, options: SoundOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const play = useCallback(async () => {
    if (!audioRef.current || !isLoaded || error) return;

    try {
      // Ensure AudioContext is running on iOS
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }

      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn("Error playing sound:", err);
            setIsPlaying(false);
          });
      }
    } catch (err) {
      console.warn("Error playing sound:", err);
    }
  }, [isLoaded, error]);

  // Initialize audio element and context
  useEffect(() => {
    const audio = new Audio(soundPath);
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (options.loop !== undefined) audio.loop = options.loop;
    if (options.volume !== undefined) audio.volume = options.volume;

    const handleCanPlay = () => setIsLoaded(true);
    const handleEnded = () => !options.loop && setIsPlaying(false);
    const handleError = (e: Event) => {
      console.warn(`Error loading sound ${soundPath}:`, e);
      setError(new Error(`Failed to load sound: ${soundPath}`));
      setIsLoaded(false);
    };

    audio.addEventListener("canplaythrough", handleCanPlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    audioRef.current = audio;

    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, [soundPath, options.loop]);

  // Handle autoplay
  useEffect(() => {
    if (isLoaded && options.autoplay) {
      play();
    }
  }, [isLoaded, options.autoplay, play]);

  // Update volume
  useEffect(() => {
    if (audioRef.current && options.volume !== undefined) {
      audioRef.current.volume = options.volume;
    }
  }, [options.volume]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  return {
    play,
    pause,
    toggle,
    isPlaying,
    isLoaded,
    error,
  };
}
