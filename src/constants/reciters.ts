export interface Reciter {
  linkReciter: string;
  nameArabic: string;
  nameTranslation: string;
  urlTemplate: string;
}

// Single source of truth for reciters (kept separate from components, no DB needed).
// urlTemplate uses {number} as a placeholder for the zero-padded surah number,
// since not every reciter's audio is hosted under the same URL pattern/domain.
export const RECITERS: Reciter[] = [
  {
    linkReciter: 'mishaari_raashid_al_3afaasee',
    nameArabic: 'مشاري راشد العفاسي',
    nameTranslation: 'Mishary Rashid Alafasy',
    urlTemplate: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/{number}.mp3',
  },
  {
    linkReciter: 'abdul_basit_murattal',
    nameArabic: 'عبدالباسط عبدالصمد',
    nameTranslation: 'Abdul Basit Abdul Samad',
    urlTemplate: 'https://download.quranicaudio.com/quran/abdul_basit_murattal/{number}.mp3',
  },
  {
    linkReciter: 'abu_bakr_ash-shaatree',
    nameArabic: 'أبوبكر الشاطري',
    nameTranslation: 'Abu Bakr Al Shatri',
    urlTemplate: 'https://download.quranicaudio.com/quran/abu_bakr_ash-shaatree/{number}.mp3',
  },
  {
    linkReciter: 'yasser_ad-dussary',
    nameArabic: 'ياسر الدوسري',
    nameTranslation: 'Yasser Al-Dosari',
    urlTemplate: 'https://download.quranicaudio.com/quran/yasser_ad-dussary/{number}.mp3',
  },
  {
    linkReciter: 'sa3ood_al-shuraym',
    nameArabic: 'سعود الشريم',
    nameTranslation: 'Saud Al-Shuraim',
    urlTemplate: 'https://download.quranicaudio.com/quran/sa3ood_al-shuraym/{number}.mp3',
  },
  {
    linkReciter: 'abdullaah_3awwaad_al-juhaynee',
    nameArabic: 'عبدالله الجهني',
    nameTranslation: 'Abdullah Al-Juhany',
    urlTemplate: 'https://download.quranicaudio.com/quran/abdullaah_3awwaad_al-juhaynee/{number}.mp3',
  },
  {
    linkReciter: 'bandar_baleela',
    nameArabic: 'بندر بليلة',
    nameTranslation: 'Bandar Baleela',
    urlTemplate: 'https://download.quranicaudio.com/quran/bandar_baleela/complete/{number}.mp3',
  },
  {
    linkReciter: 'buajan',
    nameArabic: 'عبدالله البعيجان',
    nameTranslation: 'Abdullah Al-Buajan',
    urlTemplate: 'https://server8.mp3quran.net/buajan/{number}.mp3',
  },
];

export function buildReciterAudioUrl(reciter: Reciter, surahNumber: number): string {
  const paddedNumber = String(surahNumber).padStart(3, '0');
  return reciter.urlTemplate.replace('{number}', paddedNumber);
}
