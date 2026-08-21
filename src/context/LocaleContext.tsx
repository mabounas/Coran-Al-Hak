import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import i18n from '../i18n';
import { DEFAULT_LANGUAGE_CODE, isRtlLanguage } from '../constants/languages';

const STORAGE_KEY = 'coran_al_hak.language';

interface LocaleContextValue {
  language: string;
  isRTL: boolean;
  isReady: boolean;
  setLanguage: (code: string) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE_CODE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const initial = stored ?? DEFAULT_LANGUAGE_CODE;
        await i18n.changeLanguage(initial);
        setLanguageState(initial);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const setLanguage = async (code: string) => {
    await i18n.changeLanguage(code);
    setLanguageState(code);
    await AsyncStorage.setItem(STORAGE_KEY, code);
  };

  const value = useMemo<LocaleContextValue>(
    () => ({ language, isRTL: isRtlLanguage(language), isReady, setLanguage }),
    [language, isReady]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
