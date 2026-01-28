import { useState, useCallback, useEffect } from 'react';

export function useTextToSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        const handleEnd = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        // Cleanup function to cancel speech when component unmounts
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const speak = useCallback((text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const newUtterance = new SpeechSynthesisUtterance(text);
            newUtterance.onend = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };

            // Select a Google voice if available (optional)
            const voices = window.speechSynthesis.getVoices();
            const googleVoice = voices.find(voice => voice.name.includes('Google') && voice.lang.startsWith('en'));
            if (googleVoice) {
                newUtterance.voice = googleVoice;
            }

            setUtterance(newUtterance);
            window.speechSynthesis.speak(newUtterance);
            setIsSpeaking(true);
            setIsPaused(false);
        }
    }, []);

    const stop = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
        }
    }, []);

    const pause = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    }, []);

    const resume = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    }, []);

    return {
        isSpeaking,
        isPaused,
        speak,
        stop,
        pause,
        resume,
        hasSupport: typeof window !== 'undefined' && 'speechSynthesis' in window
    };
}
