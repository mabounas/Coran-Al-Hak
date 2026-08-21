export interface SurahAudio {
  reciters_available: number;
  example_audio: string;
}

export interface Surah {
  number: number;
  name_arabic: string;
  name_english: string;
  name_complex: string;
  name_translation: string;
  revelation_place: 'makkah' | 'madinah' | string;
  revelation_order: number;
  bismillah_pre: boolean;
  verses_count: number;
  pages: number[];
  audio: SurahAudio;
}

export interface SurahsResponse {
  success: boolean;
  service: string;
  data: {
    total: number;
    surahs: Surah[];
  };
  timestamp: string;
  api_info?: Record<string, string>;
}

// Translations shipped by /api/quran/surah/{number} for every verse.
export interface VerseTranslations {
  sahih_international?: string;
  pickthall?: string;
  yusuf_ali?: string;
  urdu?: string;
  turkish?: string;
  indonesian?: string;
  french?: string;
  german?: string;
  bengali?: string;
  spanish?: string;
  malay?: string;
  bosnian?: string;
}

export interface VerseAudio {
  ayah_audio: string;
  all_reciters: string;
}

export interface Verse {
  verse_key: string;
  ayah: number;
  arabic: string;
  transliteration: string;
  translations: VerseTranslations;
  audio: VerseAudio;
}

export interface SurahSummary {
  number: number;
  name_arabic: string;
  name_english: string;
  name_translation: string;
  revelation_place: string;
  revelation_order: number;
  verses_count: number;
  bismillah_pre: boolean;
}

export interface SurahDetail {
  surah: SurahSummary;
  total_verses: number;
  verses: Verse[];
}

export interface SurahDetailResponse {
  success: boolean;
  service: string;
  data: SurahDetail;
  timestamp: string;
  api_info?: Record<string, string>;
}

export interface MushafWord {
  position: number;
  text_uthmani: string;
  text_uthmani_tajweed: string;
  line_number: number;
  char_type_name: 'word' | 'end' | string;
  verse_key: string;
  surah_number: number;
  ayah_number: number;
}

export interface MushafPage {
  page: number;
  total_pages: number;
  lines_per_page: number;
  total_words: number;
  words: MushafWord[];
}

export interface MushafPageResponse {
  success: boolean;
  service: string;
  data: MushafPage;
  timestamp: string;
  api_info?: Record<string, string>;
}
