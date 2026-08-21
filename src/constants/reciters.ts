export interface Reciter {
  linkReciter: string;
  nameArabic: string;
  nameTranslation: string;
  audioUrlOverride?: string;
}

// Single source of truth for reciters (kept separate from components, no DB needed).
// Audio URL formula: https://download.quranicaudio.com/quran/{linkReciter}/{number}.mp3
// audioUrlOverride is only set when a reciter isn't hosted on that domain/pattern
// (e.g. Abdullah Al-Buajan lives on a different domain entirely).
export const RECITERS: Reciter[] = [
  {
    linkReciter: 'mishaari_raashid_al_3afaasee',
    nameArabic: 'مشاري راشد العفاسي',
    nameTranslation: 'Mishary Rashid Alafasy',
  },
  {
    linkReciter: 'abdul_basit_murattal',
    nameArabic: 'عبدالباسط عبدالصمد',
    nameTranslation: 'Abdul Basit Abdul Samad',
  },
  {
    linkReciter: 'abu_bakr_ash-shaatree',
    nameArabic: 'أبوبكر الشاطري',
    nameTranslation: 'Abu Bakr Al Shatri',
  },
  {
    linkReciter: 'yasser_ad-dussary',
    nameArabic: 'ياسر الدوسري',
    nameTranslation: 'Yasser Al-Dosari',
  },
  {
    linkReciter: 'sa3ood_al-shuraym',
    nameArabic: 'سعود الشريم',
    nameTranslation: 'Saud Al-Shuraim',
  },
  {
    linkReciter: 'abdullaah_3awwaad_al-juhaynee',
    nameArabic: 'عبدالله الجهني',
    nameTranslation: 'Abdullah Al-Juhany',
  },
  {
    linkReciter: 'bandar_baleela/complete',
    nameArabic: 'بندر بليلة',
    nameTranslation: 'Bandar Baleela',
  },
  {
    linkReciter: 'buajan',
    nameArabic: 'عبدالله البعيجان',
    nameTranslation: 'Abdullah Al-Buajan',
    audioUrlOverride: 'https://server8.mp3quran.net/buajan/{number}.mp3',
  },
];

export function buildReciterAudioUrl(reciter: Reciter, surahNumber: number): string {
  const paddedNumber = String(surahNumber).padStart(3, '0');
  if (reciter.audioUrlOverride) {
    return reciter.audioUrlOverride.replace('{number}', paddedNumber);
  }
  return `https://download.quranicaudio.com/quran/${reciter.linkReciter}/${paddedNumber}.mp3`;
}
