import type { Verse, VerseTranslations } from '../types/quran';

export type TranslationKey = keyof VerseTranslations;

// Maps an app language to the matching field of `verse.translations`
// returned by /api/quran/surah/{number}.
// Arabic is always displayed on its own, so it needs no translation field.
// Chinese is not translated by the API yet, hence undefined.
export const TRANSLATION_KEY_BY_LANGUAGE: Record<string, TranslationKey | undefined> = {
  ar: undefined,
  en: 'sahih_international',
  fr: 'french',
  ur: 'urdu',
  tr: 'turkish',
  id: 'indonesian',
  de: 'german',
  bn: 'bengali',
  es: 'spanish',
  ms: 'malay',
  bs: 'bosnian',
  zh: undefined,
};

export function getTranslationKey(language: string): TranslationKey | undefined {
  return TRANSLATION_KEY_BY_LANGUAGE[language];
}

export function hasTranslation(language: string): boolean {
  return getTranslationKey(language) !== undefined;
}

export function getVerseTranslation(verse: Verse, language: string): string | undefined {
  const key = getTranslationKey(language);
  if (!key) return undefined;
  return verse.translations?.[key];
}
