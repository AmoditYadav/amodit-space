'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioPlayerProps {
  src?: string;
}

export function AudioPlayer({
  src = '/audio/The Egg Soundtrack (2019).mp3',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Delay appearance to match intro
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize audio
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.25;
    audio.preload = 'auto';

    audio.addEventListener('canplaythrough', () => setIsLoaded(true));
    audio.addEventListener('error', () => setHasError(true));

    audioRef.current = audio;

    const savedPref = localStorage.getItem('audio-playing');
    if (savedPref === 'true') {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [src]);

  const toggleAudio = useCallback(() => {
    if (!audioRef.current || hasError) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem('audio-playing', 'false');
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        localStorage.setItem('audio-playing', 'true');
      }).catch((err) => {
        console.warn('Audio playback failed:', err);
      });
    }
  }, [isPlaying, hasError]);

  if (hasError) return null;

  return (
    <button
      onClick={toggleAudio}
      disabled={!isLoaded}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${
        isLoaded
          ? 'bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15]'
          : 'bg-white/[0.03] cursor-not-allowed'
      }`}
      aria-label={isPlaying ? 'Mute audio' : 'Unmute audio'}
      title={isPlaying ? 'Mute' : 'Unmute'}
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {isPlaying ? (
        <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
          />
        </svg>
      )}
    </button>
  );
}
