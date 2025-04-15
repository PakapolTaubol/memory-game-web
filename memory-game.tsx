"use client";

import React, { useState, useEffect } from "react";
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
import Modal from "react-modal";

type MemoryCard = {
  id: number;
  icon: LucideIcon;
  isMatched: boolean;
  color: string;
};

const initialCards = (): MemoryCard[] => {
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
  const numberOfPairs = 10; // For a 5x4 grid (20 cards)
  const selectedIcons = iconConfigs.slice(0, numberOfPairs);

  selectedIcons.forEach(({ icon, color }, index) => {
    cards.push({ id: index * 2, icon, color, isMatched: false });
    cards.push({ id: index * 2 + 1, icon, color, isMatched: false });
  });

  return cards;
};

export default function MemoryGame() {
  const [cards, setCards] = useState<MemoryCard[]>(initialCards());
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [soundSettings, setSoundSettings] = useState<SoundSettings>({
    masterVolume: 0.5,
    musicVolume: 0.4,
    effectsVolume: 1.0,
    isMuted: false,
  });
  const [hasWon, setHasWon] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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

  // Shuffle cards only after the component has mounted on the client
  useEffect(() => {
    setCards((prevCards) => prevCards.sort(() => Math.random() - 0.5));
  }, []);

  // Update sound volumes when settings change
  useEffect(() => {
    const effectiveVolume = soundSettings.isMuted
      ? 0
      : soundSettings.masterVolume;

    // We don't need to manually update volumes as the useSound hook handles this
    // when we pass new options in the dependency array
  }, [soundSettings]);

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  useEffect(() => {
    if (matches === 10 && !hasWon) {
      setHasWon(true);
      openModal();
      gameCompleteSound.play();
    }
  }, [matches, hasWon, gameCompleteSound]);

  const handleCardClick = (clickedIndex: number) => {
    // Prevent clicking if already checking or card is already matched
    if (isChecking || cards[clickedIndex].isMatched || hasWon) return;
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
    setCards(initialCards().sort(() => Math.random() - 0.5));
    setFlippedIndexes([]);
    setMatches(0);
    setHasWon(false);
    setIsModalOpen(false);
    initializeAudio();
  };

  const initializeAudio = () => {
    if (typeof window !== "undefined") {
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();

        // Function to resume audio context
        const resumeAudio = () => {
          if (audioContext.state === "suspended") {
            audioContext.resume().then(() => {
              backgroundMusic.play();
            });
          }
        };

        // Try to resume on various user interactions
        const resumeEvents = ["touchstart", "click", "keydown"];
        resumeEvents.forEach((event) => {
          window.addEventListener(event, resumeAudio, { once: true });
        });

        // Also try to resume immediately if possible
        resumeAudio();
      } catch (error) {
        console.error("Error initializing audio:", error);
      }
    }
  };

  useEffect(() => {
    initializeAudio();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 text-transparent bg-clip-text">
          Memory Game By Pakapol Taubol
        </h1>
        <p className="text-indigo-200">Matches found: {matches} of 10</p>
      </div>

      {/* Sound Controls */}
      <SoundController
        settings={soundSettings}
        onSettingsChange={setSoundSettings}
        isMusicPlaying={backgroundMusic.isPlaying}
        onMusicToggle={backgroundMusic.toggle}
      />

      {/* Game Grid */}
      <div className="grid grid-cols-5 grid-rows-4 gap-2 md:gap-3 p-4 rounded-xl bg-indigo-950/50 backdrop-blur-sm">
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
                    className="absolute inset-0 flex items-center justify-center"
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
        className="bg-indigo-950 border-indigo-700 hover:bg-indigo-900 hover:border-indigo-500 text-indigo-200 hover:text-indigo-100 cursor-pointer"
      >
        Start New Game
      </Button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          },
          content: {
            position: "relative",
            backgroundColor: "rgba(79, 70, 229, 0.1)", // สีม่วงหลัก (Indigo-500) พร้อมความโปร่งใส 80%
            color: "#FFFFFF", // สีขาว
            border: "none",
            borderRadius: "12px",
            padding: "48px",
            maxWidth: "480px",
            width: "95%",
            textAlign: "center",
            backdropFilter: "blur(10px)",
            inset: "0",
          },
        }}
        contentLabel="Congratulations Modal"
      >
        <h2 className="text-3xl font-bold mb-6 text-white">
          🎉 Congratulations! 🎉
        </h2>
        <p className="text-lg mb-8 text-white">
          You've masterfully matched all the cards!
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={resetGame}
            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full px-6 py-3 text-lg font-semibold cursor-pointer"
          >
            Play Again
          </Button>
          <Button
            onClick={closeModal}
            variant="outline"
            className="text-indigo-600 border-indigo-300 hover:bg-indigo-300 hover:text-indigo-900 rounded-full px-6 py-3 text-lg font-semibold cursor-pointer"
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
