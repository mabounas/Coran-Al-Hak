import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'coran_al_hak.bookmarks';

interface BookmarksContextValue {
  bookmarks: number[];
  isBookmarked: (surahNumber: number) => boolean;
  toggleBookmark: (surahNumber: number) => void;
}

const BookmarksContext = createContext<BookmarksContextValue | undefined>(undefined);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setBookmarks(JSON.parse(stored));
        } catch {
          setBookmarks([]);
        }
      }
    })();
  }, []);

  const toggleBookmark = (surahNumber: number) => {
    setBookmarks((prev) => {
      const next = prev.includes(surahNumber)
        ? prev.filter((n) => n !== surahNumber)
        : [...prev, surahNumber];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo<BookmarksContextValue>(
    () => ({
      bookmarks,
      isBookmarked: (surahNumber: number) => bookmarks.includes(surahNumber),
      toggleBookmark,
    }),
    [bookmarks]
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks(): BookmarksContextValue {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
}
