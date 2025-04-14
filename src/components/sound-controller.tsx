"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Music, Music2, VolumeX, Volume2, Headphones, HeadphoneOff } from "lucide-react"

export type SoundSettings = {
  masterVolume: number
  musicVolume: number
  effectsVolume: number
  isMuted: boolean
}

type SoundControllerProps = {
  settings: SoundSettings
  onSettingsChange: (settings: SoundSettings) => void
  isMusicPlaying: boolean
  onMusicToggle: () => void
}

export default function SoundController({
  settings,
  onSettingsChange,
  isMusicPlaying,
  onMusicToggle,
}: SoundControllerProps) {
  const [soundsAvailable, setSoundsAvailable] = useState(false)

  // Check if sounds are available
  useEffect(() => {
    const checkSounds = async () => {
      try {
        const response = await fetch("/api/sounds")
        const data = await response.json()
        setSoundsAvailable(data.sounds && data.sounds.length > 0)
      } catch (error) {
        console.warn("Error checking sound availability:", error)
        setSoundsAvailable(false)
      }
    }

    checkSounds()
  }, [])

  const toggleMute = () => {
    onSettingsChange({
      ...settings,
      isMuted: !settings.isMuted,
    })
  }

  if (!soundsAvailable) {
    return (
      <div className="text-xs text-indigo-300 bg-indigo-950/40 px-3 py-2 rounded-md">
        Sound effects unavailable. Game will run without audio.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 w-full max-w-3xl px-4 py-3 rounded-lg backdrop-blur-sm">
      <Button
        variant="outline"
        size="icon"
        onClick={onMusicToggle}
        className="bg-indigo-900/50 border-indigo-700 hover:bg-indigo-800 cursor-pointer"
      >
        {isMusicPlaying ? (
          <Headphones className="h-5 w-5 text-indigo-200" />
        ) : (
          <HeadphoneOff className="h-5 w-5 text-indigo-400" />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={toggleMute}
        className="bg-indigo-900/50 border-indigo-700 hover:bg-indigo-800 cursor-pointer"
      >
        {settings.isMuted ? (
          <VolumeX className="h-5 w-5 text-indigo-400" />
        ) : (
          <Volume2 className="h-5 w-5 text-indigo-200" />
        )}
      </Button>

      <div className="flex items-center gap-2 flex-1 max-w-xs">
        <span className="text-xs text-indigo-300">Volume</span>
        <Slider
          value={[settings.masterVolume * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => {
            onSettingsChange({
              ...settings,
              masterVolume: value[0] / 100,
            })
          }}
          className="flex-1 cursor-pointer"
        />
      </div>
    </div>
  )
}
