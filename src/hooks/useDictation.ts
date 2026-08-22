import { useCallback, useRef, useState } from 'react';

export type DictationError = 'denied' | 'unsupported' | 'failed';

export interface DictationOptions {
  locale: string;
  onResult: (transcript: string, isFinal: boolean) => void;
}

export interface Dictation {
  listening: boolean;
  error: DictationError | null;
  supported: boolean;
  start: () => Promise<void>;
  stop: () => void;
}

// expo-speech-recognition ships native code, so it is missing from Expo Go and
// its import throws there. Loading it defensively lets the whole app run in
// Expo Go with dictation simply reported as unavailable.
const speech = (() => {
  try {
    return require('expo-speech-recognition') as typeof import('expo-speech-recognition');
  } catch {
    return null;
  }
})();

const noopEvent = () => {};
const useSpeechEvent = speech?.useSpeechRecognitionEvent ?? noopEvent;

/** Native dictation. The web build uses useDictation.web.ts instead. */
export function useDictation({ locale, onResult }: DictationOptions): Dictation {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<DictationError | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useSpeechEvent('result', (event: { results?: { transcript?: string }[]; isFinal?: boolean }) => {
    const transcript = event.results?.[0]?.transcript?.trim() ?? '';
    if (!transcript) return;
    if (event.isFinal) setListening(false);
    onResultRef.current(transcript, Boolean(event.isFinal));
  });

  useSpeechEvent('end', () => setListening(false));

  useSpeechEvent('error', (event: { error?: string }) => {
    setError(event.error === 'not-allowed' ? 'denied' : 'failed');
    setListening(false);
  });

  const start = useCallback(async () => {
    setError(null);

    if (!speech) {
      setError('unsupported');
      return;
    }

    try {
      const permission = await speech.ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setError('denied');
        return;
      }
      speech.ExpoSpeechRecognitionModule.start({
        lang: locale,
        interimResults: true,
        continuous: false,
      });
      setListening(true);
    } catch {
      setError('unsupported');
      setListening(false);
    }
  }, [locale]);

  const stop = useCallback(() => {
    try {
      speech?.ExpoSpeechRecognitionModule.stop();
    } catch {
      // Already stopped.
    }
    setListening(false);
  }, []);

  return { listening, error, supported: speech !== null, start, stop };
}
