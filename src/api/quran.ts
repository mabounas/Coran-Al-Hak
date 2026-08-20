import { QURAN_API_BASE_URL, QURAN_API_KEY } from '../constants/config';
import type { Surah, SurahsResponse } from '../types/quran';

export async function fetchSurahs(): Promise<Surah[]> {
  const url = `${QURAN_API_BASE_URL}/surahs?apikey=${QURAN_API_KEY}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json: SurahsResponse = await response.json();

  if (!json.success || !json.data?.surahs) {
    throw new Error('Unexpected API response');
  }

  return json.data.surahs;
}
