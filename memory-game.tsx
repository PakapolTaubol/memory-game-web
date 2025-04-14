"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import SoundController, {
  type SoundSettings,
} from "@/components/sound-controller";
import { useSound } from "@/hooks/use-sound";
import {
  LucideIcon,
  Heart,
  Star,
  Sun,
  Moon,
  Cloud,
  Flower2,
  Zap,
  Leaf,
  Droplets,
  Flame,
  Snowflake,
  Umbrella,
  Wind,
  Palette,
  Sparkles,
} from "lucide-react";

type MemoryCard = {
  id: number;
  icon: LucideIcon;
  isMatched: boolean;
  color: string;
};

const createCards = () => {
  const iconConfigs = [
    { icon: Heart, color: "text-rose-400" },
    { icon: Star, color: "text-amber-400" },
    { icon: Sun, color: "text-yellow-400" },
    { icon: Moon, color: "text-purple-400" },
    { icon: Cloud, color: "text-sky-400" },
    { icon: Flower2, color: "text-emerald-400" },
    { icon: Zap, color: "text-yellow-300" },
    { icon: Leaf, color: "text-green-400" },
    { icon: Droplets, color: "text-blue-400" },
    { icon: Flame, color: "text-orange-400" },
    { icon: Snowflake, color: "text-cyan-300" },
    { icon: Umbrella, color: "text-indigo-300" },
    { icon: Wind, color: "text-slate-300" },
    { icon: Palette, color: "text-pink-400" },
    { icon: Sparkles, color: "text-amber-300" },
  ];

  const cards: MemoryCard[] = [];

  // We need 12 pairs for a 5x5 grid (24 cards + 1 center card that's decorative)
  const selectedIcons = iconConfigs.slice(0, 12);

  selectedIcons.forEach(({ icon, color }, index) => {
    cards.push(
      { id: index * 2, icon, color, isMatched: false },
      { id: index * 2 + 1, icon, color, isMatched: false }
    );
  });

  // Add one more card for the center (25th card)
  cards.push({
    id: 24,
    icon: iconConfigs[12].icon,
    color: iconConfigs[12].color,
    isMatched: true,
  });

  return cards.sort(() => Math.random() - 0.5);
};

export default function MemoryGame() {
  const [cards, setCards] = useState<MemoryCard[]>(createCards());
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [soundSettings, setSoundSettings] = useState<SoundSettings>({
    masterVolume: 0.7,
    musicVolume: 0.5,
    effectsVolume: 0.8,
    isMuted: false,
  });

  // Use our custom hook for sounds
  const backgroundMusic = useSound("/sounds/background-music.mp3", {
    loop: true,
    volume: soundSettings.isMuted
      ? 0
      : soundSettings.masterVolume * soundSettings.musicVolume,
  });

  const cardFlipSound = useSound("/sounds/card-flip.mp3", {
    volume: soundSettings.isMuted
      ? 0
      : soundSettings.masterVolume * soundSettings.effectsVolume,
  });

  const matchSuccessSound = useSound("/sounds/match-success.mp3", {
    volume: soundSettings.isMuted
      ? 0
      : soundSettings.masterVolume * soundSettings.effectsVolume,
  });

  const matchFailSound = useSound("/sounds/match-fail.mp3", {
    volume: soundSettings.isMuted
      ? 0
      : soundSettings.masterVolume * soundSettings.effectsVolume,
  });

  const gameCompleteSound = useSound("/sounds/game-complete.mp3", {
    volume: soundSettings.isMuted
      ? 0
      : soundSettings.masterVolume * soundSettings.effectsVolume,
  });

  // Update sound volumes when settings change
  useEffect(() => {
    const effectiveVolume = soundSettings.isMuted
      ? 0
      : soundSettings.masterVolume;

    // We don't need to manually update volumes as the useSound hook handles this
    // when we pass new options in the dependency array
  }, [soundSettings]);

  const handleCardClick = (clickedIndex: number) => {
    // Prevent clicking if already checking or card is already matched
    if (isChecking || cards[clickedIndex].isMatched) return;
    // Prevent clicking if card is already flipped
    if (flippedIndexes.includes(clickedIndex)) return;
    // Prevent clicking if two cards are already flipped
    if (flippedIndexes.length === 2) return;

    // Play card flip sound
    cardFlipSound.play();

    // Add clicked card to flipped cards
    const newFlipped = [...flippedIndexes, clickedIndex];
    setFlippedIndexes(newFlipped);

    // If we now have two cards flipped, check for a match
    if (newFlipped.length === 2) {
      setIsChecking(true);
      const [firstIndex, secondIndex] = newFlipped;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.icon === secondCard.icon) {
        // Match found
        setTimeout(() => {
          // Play success sound
          matchSuccessSound.play();

          setCards(
            cards.map((card, index) =>
              index === firstIndex || index === secondIndex
                ? { ...card, isMatched: true }
                : card
            )
          );
          setFlippedIndexes([]);
          setMatches((m) => m + 1);
          setIsChecking(false);

          // Check for game completion (12 pairs in a 5x5 grid)
          if (matches === 11) {
            // 12 pairs - 1 because we're incrementing after this check
            gameCompleteSound.play();
            toast("🎉 Congratulations! You've found all the matches! 🎈", {
              className: "bg-purple-900 text-purple-100 border-purple-700",
            });
          }
        }, 500);
      } else {
        // No match - reset after delay
        setTimeout(() => {
          // Play fail sound
          matchFailSound.play();

          setFlippedIndexes([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCards(createCards());
    setFlippedIndexes([]);
    setMatches(0);
    setIsChecking(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 text-transparent bg-clip-text">
          Memory Match Game
        </h1>
        <p className="text-indigo-200">Matches found: {matches} of 12</p>
      </div>

      {/* Sound Controls */}
      <SoundController
        settings={soundSettings}
        onSettingsChange={setSoundSettings}
        isMusicPlaying={backgroundMusic.isPlaying}
        onMusicToggle={backgroundMusic.toggle}
      />

      {/* Game Grid */}
      <div className="grid grid-cols-5 gap-2 md:gap-3 p-4 rounded-xl bg-indigo-950/50 backdrop-blur-sm">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ rotateY: 0 }}
            animate={{
              rotateY:
                card.isMatched || flippedIndexes.includes(index) ? 180 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="perspective-1000"
          >
            <Card
              className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 cursor-pointer transform-style-3d transition-all duration-300 ${
                card.isMatched
                  ? "bg-indigo-900/50 border-indigo-400/50"
                  : flippedIndexes.includes(index)
                  ? "bg-indigo-800/50 border-indigo-500/50"
                  : "bg-indigo-950 border-indigo-800 hover:border-indigo-600 hover:bg-indigo-900/80"
              }`}
              onClick={() => handleCardClick(index)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-indigo-500/5 to-white/5" />
              <AnimatePresence>
                {(card.isMatched || flippedIndexes.includes(index)) && (
                  <motion.div
                    initial={{ opacity: 0, rotateY: 180 }}
                    animate={{ opacity: 1, rotateY: 180 }}
                    exit={{ opacity: 0, rotateY: 180 }}
                    className="absolute inset-0 flex items-center justify-center backface-hidden"
                  >
                    <card.icon
                      className={`w-8 h-8 sm:w-10 sm:h-10 ${
                        card.isMatched
                          ? `${card.color} filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`
                          : card.color
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={resetGame}
        variant="outline"
        size="lg"
        className="bg-indigo-950 border-indigo-700 hover:bg-indigo-900 hover:border-indigo-500 text-indigo-200 hover:text-indigo-100"
      >
        Start New Game
      </Button>
    </div>
  );
}
