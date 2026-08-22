import { HADITH_API_BASE_URL, QURAN_API_KEY } from '../constants/config';
import type {
  HadithCollectionsData,
  HadithCollectionsResponse,
  HadithPage,
  HadithPageResponse,
} from '../types/hadith';

export const HADITH_PAGE_SIZE = 50;

export async function fetchHadithCollections(): Promise<HadithCollectionsData> {
  const response = await fetch(`${HADITH_API_BASE_URL}/collections?apikey=${QURAN_API_KEY}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json: HadithCollectionsResponse = await response.json();

  if (!json.success || !json.data?.collections) {
    throw new Error('Unexpected API response');
  }

  return json.data;
}

export async function fetchHadithPage(collection: string, page: number): Promise<HadithPage> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(HADITH_PAGE_SIZE),
    apikey: QURAN_API_KEY,
  });

  const response = await fetch(
    `${HADITH_API_BASE_URL}/${encodeURIComponent(collection)}?${params.toString()}`,
    { method: 'GET', headers: { Accept: 'application/json' } }
  );

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json: HadithPageResponse = await response.json();

  if (!json.success || !json.data?.hadiths) {
    throw new Error('Unexpected API response');
  }

  return json.data;
}
