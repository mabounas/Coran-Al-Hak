import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { Reciter } from '../constants/reciters';
import type { Surah } from '../types/quran';

interface AudioPlayerContextValue {
  currentSurah: Surah | null;
  currentReciter: Reciter | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  playSurah: (surah: Surah, audioUrl: string, reciter: Reciter) => void;
  togglePlayPause: () => void;
  stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [currentReciter, setCurrentReciter] = useState<Reciter | null>(null);
  const player = useAudioPlayer(null, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    // The Info.plist declares the audio background mode; without this flag the
    // session still stops the moment the app leaves the foreground.
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
      shouldPlayInBackground: true,
    }).catch(() => {});
  }, []);

  const playSurah = (surah: Surah, audioUrl: string, reciter: Reciter) => {
    if (currentSurah?.number === surah.number && currentReciter?.linkReciter === reciter.linkReciter) {
      player.play();
      return;
    }
    setCurrentSurah(surah);
    setCurrentReciter(reciter);
    player.replace(audioUrl);
    player.play();
  };

  const togglePlayPause = () => {
    if (!currentSurah) return;
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const stop = () => {
    player.pause();
    setCurrentSurah(null);
    setCurrentReciter(null);
  };

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      currentSurah,
      currentReciter,
      isPlaying: status.playing,
      isBuffering: status.isBuffering,
      currentTime: status.currentTime,
      duration: status.duration,
      playSurah,
      togglePlayPause,
      stop,
    }),
    [currentSurah, currentReciter, status.playing, status.isBuffering, status.currentTime, status.duration]
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayerContext(): AudioPlayerContextValue {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayerContext must be used within an AudioPlayerProvider');
  }
  return context;
}
