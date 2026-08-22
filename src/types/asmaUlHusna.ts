export interface DivineName {
  number: number;
  arabic: string;
  transliteration: string;
  english: string;
  meaning: string;
}

export interface AsmaUlHusnaData {
  names: DivineName[];
  total_count: number;
  arabic_title: string;
  english_title: string;
  description: string;
  source: string;
  recitation_benefits?: string;
  hadith?: string;
}

export interface AsmaUlHusnaResponse {
  success: boolean;
  service: string;
  data: AsmaUlHusnaData;
  timestamp: string;
  api_info?: Record<string, string>;
}
