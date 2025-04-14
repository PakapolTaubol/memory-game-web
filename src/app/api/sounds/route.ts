import { NextResponse } from "next/server"

// This route handler will help us check if sound files are accessible
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sound = searchParams.get("sound")

  // List of available sounds
  const availableSounds = ["background-music", "card-flip", "match-success", "match-fail", "game-complete"]

  return NextResponse.json({
    sounds: availableSounds,
    requested: sound,
    available: sound ? availableSounds.includes(sound) : false,
    basePath: "/sounds/",
  })
}
