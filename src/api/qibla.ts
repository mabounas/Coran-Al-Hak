import { QIBLA_API_URL, QURAN_API_KEY } from '../constants/config';
import type { QiblaResponse } from '../types/qibla';

export async function fetchQiblaDirection(latitude: number, longitude: number): Promise<number> {
  const url = `${QIBLA_API_URL}?lat=${latitude}&lng=${longitude}&apikey=${QURAN_API_KEY}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json: QiblaResponse = await response.json();
  const data = json.data;
  const bearing = data?.direction ?? data?.qibla_direction ?? data?.bearing ?? data?.angle;

  if (!json.success || typeof bearing !== 'number' || Number.isNaN(bearing)) {
    throw new Error('Unexpected API response');
  }

  return bearing;
}
