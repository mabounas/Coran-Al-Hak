import { ASMA_UL_HUSNA_API_URL, QURAN_API_KEY } from '../constants/config';
import type { AsmaUlHusnaData, AsmaUlHusnaResponse } from '../types/asmaUlHusna';

export async function fetchAsmaUlHusna(): Promise<AsmaUlHusnaData> {
  const url = `${ASMA_UL_HUSNA_API_URL}?apikey=${QURAN_API_KEY}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json: AsmaUlHusnaResponse = await response.json();

  if (!json.success || !json.data?.names) {
    throw new Error('Unexpected API response');
  }

  return json.data;
}
