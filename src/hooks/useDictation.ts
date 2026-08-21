import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
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

// Native dictation, backed by the platform recognizer. The web build uses
// useDictation.web.ts instead, which drives the Web Speech API directly.
export function useDictation({ locale, onResult }: DictationOptions): Dictation {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<DictationError | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results?.[0]?.transcript?.trim() ?? '';
    if (!transcript) return;
    if (event.isFinal) setListening(false);
    onResultRef.current(transcript, Boolean(event.isFinal));
  });

  useSpeechRecognitionEvent('end', () => setListening(false));

  useSpeechRecognitionEvent('error', (event) => {
    setError(event.error === 'not-allowed' ? 'denied' : 'failed');
    setListening(false);
  });

  const start = useCallback(async () => {
    setError(null);
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setError('denied');
        return;
      }
      ExpoSpeechRecognitionModule.start({
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
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // Already stopped.
    }
    setListening(false);
  }, []);

  return { listening, error, supported: true, start, stop };
}
