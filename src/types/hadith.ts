export interface HadithCollection {
  key: string;
  name: string;
  arabic_name: string;
  author: string;
  reliability: string;
  total_hadiths: number;
}

export interface HadithCollectionsData {
  collections: HadithCollection[];
  total_hadiths: number;
  fetched_at: string;
  source: string;
}

export interface Hadith {
  id: string;
  collection: string;
  collection_name: string;
  hadithnumber: number;
  arabic: string;
  english: string;
  grade: string | null;
}

export interface HadithPage {
  collection: string;
  collection_name: string;
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  hadiths: Hadith[];
}

export interface HadithCollectionsResponse {
  success: boolean;
  data: HadithCollectionsData;
}

export interface HadithPageResponse {
  success: boolean;
  data: HadithPage;
}
