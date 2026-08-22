import { normalizeArabic } from './arabic';
import type { Surah } from '../types/quran';

// Dictation and keyboards give bare letters, while the surah names carry
// diacritics, hyphens and capitals. Folding both sides makes "al-fatiha",
// "Al-Fatihah" and "الفاتحه" all match the same surah.
const SURAH_WORD = /^سوره\s*/;

// Spaces go too: a name written "Ya-Sin" loses its hyphen when folded, while
// dictation says "ya sin".
function fold(text: string): string {
  return normalizeArabic(text).replace(SURAH_WORD, '').replace(/\s+/g, '');
}

export function filterSurahs(surahs: Surah[], query: string): Surah[] {
  const needle = fold(query);
  if (!needle) return surahs;

  return surahs.filter(
    (surah) =>
      fold(surah.name_arabic).includes(needle) ||
      fold(surah.name_english).includes(needle) ||
      fold(surah.name_translation).includes(needle) ||
      String(surah.number).includes(needle)
  );
}
