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
