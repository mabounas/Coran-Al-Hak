import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchSurahs } from '../api/quran';
import type { Surah } from '../types/quran';

interface SurahsContextValue {
  surahs: Surah[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const SurahsContext = createContext<SurahsContextValue | undefined>(undefined);

export function SurahsProvider({ children }: { children: React.ReactNode }) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSurahs();
      setSurahs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo<SurahsContextValue>(
    () => ({ surahs, loading, error, refresh: load }),
    [surahs, loading, error, load]
  );

  return <SurahsContext.Provider value={value}>{children}</SurahsContext.Provider>;
}

export function useSurahs(): SurahsContextValue {
  const context = useContext(SurahsContext);
  if (!context) {
    throw new Error('useSurahs must be used within a SurahsProvider');
  }
  return context;
}
