export interface Reciter {
  linkReciter: string;
  nameArabic: string;
  nameTranslation: string;
}

// Single source of truth for reciters (kept separate from components, no DB needed).
export const RECITERS: Reciter[] = [
  {
    linkReciter: 'mishaari_raashid_al_3afaasee',
    nameArabic: 'مشاري راشد العفاسي',
    nameTranslation: 'Mishary Rashid Alafasy',
  },
  {
    linkReciter: 'abdurrahmaan_as-sudais',
    nameArabic: 'عبدالرحمن السديس',
    nameTranslation: 'Abdul Rahman Al-Sudais',
  },
  {
    linkReciter: 'abdul_basit_murattal',
    nameArabic: 'عبدالباسط عبدالصمد',
    nameTranslation: 'Abdul Basit Abdul Samad',
  },
  {
    linkReciter: 'abdul_basit_mujawwad',
    nameArabic: 'عبدالباسط عبدالصمد - مجود',
    nameTranslation: 'Abdul Basit Abdul Samad (Mujawwad)',
  },
  {
    linkReciter: 'maher_al_muaiqly',
    nameArabic: 'ماهر المعيقلي',
    nameTranslation: 'Maher Al Muaiqly',
  },
  {
    linkReciter: 'sa3d_al-ghaamidi',
    nameArabic: 'سعد الغامدي',
    nameTranslation: 'Saad Al-Ghamdi',
  },
  {
    linkReciter: 'hani_ar-rifai',
    nameArabic: 'هاني الرفاعي',
    nameTranslation: 'Hani Ar-Rifai',
  },
];

export function buildReciterAudioUrl(linkReciter: string, surahNumber: number): string {
  const paddedNumber = String(surahNumber).padStart(3, '0');
  return `https://download.quranicaudio.com/quran/${linkReciter}/${paddedNumber}.mp3`;
}
