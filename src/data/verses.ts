import quranText from './quranText.json';

const SURAHS: string[][] = quranText as string[][];

export function getSurahVerses(surahNumber: number): string[] {
  return SURAHS[surahNumber - 1] ?? [];
}

/** The vocalised text of one verse, straight from the bundled mushaf text. */
export function getVerseArabic(surahNumber: number, ayah: number): string | undefined {
  return getSurahVerses(surahNumber)[ayah - 1];
}

export function getAllSurahs(): string[][] {
  return SURAHS;
}
