'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioPlayerProps {
    src?: string;
}

export function AudioPlayer({
    src = '/audio/The Egg Soundtrack (2019).mp3'
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Initialize audio element
    useEffect(() => {
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = 0.3;
        audio.preload = 'auto';

        audio.addEventListener('canplaythrough', () => {
            setIsLoaded(true);
        });

        audio.addEventListener('error', () => {
            setHasError(true);
        });

        audioRef.current = audio;

        // Check for saved preference
        const savedPreference = localStorage.getItem('audio-playing');
        if (savedPreference === 'true') {
            audio.play().then(() => {
                setIsPlaying(true);
            }).catch(() => {
                // Autoplay blocked, wait for user interaction
            });
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

    // Don't render if audio failed to load
    if (hasError) return null;

    return (
        <button
            onClick={toggleAudio}
            disabled={!isLoaded}
            className={`fixed bottom-6 right-6 z-50 p-3 rounded-full transition-all duration-300 shadow-lg ${isLoaded
                    ? 'bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20'
                    : 'bg-white/5 cursor-not-allowed'
                }`}
            aria-label={isPlaying ? 'Mute audio' : 'Unmute audio'}
            title={isPlaying ? 'Mute' : 'Unmute'}
        >
            {isPlaying ? (
                // Sound on icon
                <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                </svg>
            ) : (
                // Sound off icon
                <svg
                    className="w-5 h-5 text-white/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                </svg>
            )}
        </button>
    );
}
