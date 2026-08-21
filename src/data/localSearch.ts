import { containsArabic, normalizeArabic } from '../constants/arabic';

import quranText from './quranText.json';

export interface LocalMatch {
  verseKey: string;
  surahNumber: number;
  ayah: number;
  arabic: string;
  /** The vocalised word(s) of the verse that matched, used to ask the API for translations. */
  forms: string[];
}

interface NormalizedVerse {
  surahNumber: number;
  ayah: number;
  arabic: string;
  words: string[];
  normalizedWords: string[];
}

const SURAHS: string[][] = quranText as string[][];

let index: NormalizedVerse[] | null = null;

// Folding 6236 verses takes a few milliseconds and only ever happens once,
// the first time someone searches an Arabic word.
function getIndex(): NormalizedVerse[] {
  if (index) return index;
  const built: NormalizedVerse[] = [];
  SURAHS.forEach((verses, surahIndex) => {
    verses.forEach((arabic, verseIndex) => {
      const words = arabic.split(/\s+/).filter(Boolean);
      built.push({
        surahNumber: surahIndex + 1,
        ayah: verseIndex + 1,
        arabic,
        words,
        normalizedWords: words.map(normalizeArabic),
      });
    });
  });
  index = built;
  return index;
}

/**
 * Searches the mushaf text ignoring tashkeel, which the API cannot do: it
 * compares the vocalised text character for character, so a word typed or
 * dictated without diacritics never matches there.
 */
export function searchLocal(query: string): LocalMatch[] {
  const needle = normalizeArabic(query);
  if (!needle || !containsArabic(query)) return [];

  const matches: LocalMatch[] = [];

  for (const verse of getIndex()) {
    const forms = new Set<string>();
    verse.normalizedWords.forEach((word, i) => {
      if (word.includes(needle)) forms.add(verse.words[i]);
    });
    if (forms.size === 0) continue;
    matches.push({
      verseKey: `${verse.surahNumber}:${verse.ayah}`,
      surahNumber: verse.surahNumber,
      ayah: verse.ayah,
      arabic: verse.arabic,
      forms: [...forms],
    });
  }

  return matches;
}
