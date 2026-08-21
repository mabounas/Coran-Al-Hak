import { QURAN_API_BASE_URL, QURAN_API_KEY } from '../constants/config';
import type { SearchData, SearchResponse } from '../types/search';

// The endpoint caps `limit` at 50 and offers no paging, so 50 is the most the
// API will ever return for one word.
export const SEARCH_LIMIT = 50;

export async function searchQuran(query: string): Promise<SearchData> {
  const url = `${QURAN_API_BASE_URL}/search?q=${encodeURIComponent(
    query
  )}&limit=${SEARCH_LIMIT}&apikey=${QURAN_API_KEY}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json: SearchResponse = await response.json();

  if (!json.success || !json.data) {
    throw new Error('Unexpected API response');
  }

  return json.data;
}
