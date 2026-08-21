import { useCallback, useEffect, useRef, useState } from 'react';

import type { Dictation, DictationError, DictationOptions } from './useDictation';

type SpeechRecognitionCtor = new () => any;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// expo-speech-recognition never attaches its listeners to the browser
// recognizer, so the web build talks to the Web Speech API itself.
export function useDictation({ locale, onResult }: DictationOptions): Dictation {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<DictationError | null>(null);
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(
    () => () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        // Nothing was running.
      }
    },
    []
  );

  const start = useCallback(async () => {
    setError(null);

    const Recognition = getRecognitionCtor();
    if (!Recognition) {
      setError('unsupported');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = locale;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let transcript = '';
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0]?.transcript ?? '';
        if (event.results[i].isFinal) isFinal = true;
      }
      const cleaned = transcript.trim();
      if (!cleaned) return;
      if (isFinal) setListening(false);
      onResultRef.current(cleaned, isFinal);
    };

    recognition.onerror = (event: any) => {
      const code: DictationError =
        event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? 'denied'
          : 'failed';
      setError(code);
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
    } catch {
      setError('failed');
      setListening(false);
    }
  }, [locale]);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // Already stopped.
    }
    setListening(false);
  }, []);

  return { listening, error, supported: getRecognitionCtor() !== null, start, stop };
}
