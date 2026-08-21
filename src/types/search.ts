export interface SearchResult {
  verse_key: string;
  surah_number: number;
  surah_name: string;
  ayah: number;
  arabic: string;
  transliteration: string;
  matched_in: string;
  translation: string;
  translation_source: string;
}

export interface SearchData {
  query: string;
  searched_in: string[];
  results_count: number;
  limit: number;
  results: SearchResult[];
}

export interface SearchResponse {
  success: boolean;
  service: string;
  data: SearchData;
  timestamp: string;
  api_info?: Record<string, string>;
}
