import { TAFSIR_PROXY_URL } from '../constants/config';
import type { Tafsir } from '../types/tafsir';

export async function fetchTafsir(surahNumber: number, ayah: number): Promise<Tafsir> {
  const params = new URLSearchParams({ sura: String(surahNumber), ayah: String(ayah) });

  const response = await fetch(`${TAFSIR_PROXY_URL}?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json: Tafsir = await response.json();

  if (!json?.text) {
    throw new Error('Unexpected API response');
  }

  return json;
}
