import { fetchSurahDetail } from '../api/quran';
import type { TranslationKey } from '../constants/translations';

// The search endpoint always answers with sahih_international whatever the
// `translation` parameter says, so the translation shown in the profile
// language comes from the surah endpoint instead. One request per surah, kept
// for the session and shared by every card of that surah.
const cache = new Map<string, Promise<Map<number, string>>>();

export function getSurahTranslations(
  surahNumber: number,
  key: TranslationKey
): Promise<Map<number, string>> {
  const cacheKey = `${surahNumber}|${key}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const pending = fetchSurahDetail(surahNumber)
    .then((detail) => {
      const map = new Map<number, string>();
      detail.verses.forEach((verse) => {
        const text = verse.translations?.[key];
        if (text) map.set(verse.ayah, text);
      });
      return map;
    })
    .catch((error) => {
      cache.delete(cacheKey); // let a later card retry
      throw error;
    });

  cache.set(cacheKey, pending);
  return pending;
}
