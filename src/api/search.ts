import { QURAN_API_BASE_URL, QURAN_API_KEY } from '../constants/config';
import type { SearchData, SearchResponse } from '../types/search';

// The endpoint caps `limit` at 50 and offers no paging, so 50 is the most the
// API will ever return for one term.
export const SEARCH_LIMIT = 50;

/**
 * @param translation which translation field to search, e.g. `french`.
 *   The API defaults to `sahih_international` when omitted.
 */
export async function searchQuran(query: string, translation?: string): Promise<SearchData> {
  const params = new URLSearchParams({
    q: query,
    limit: String(SEARCH_LIMIT),
    apikey: QURAN_API_KEY,
  });
  if (translation) params.set('translation', translation);

  const response = await fetch(`${QURAN_API_BASE_URL}/search?${params.toString()}`, {
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
