import { PRAYER_TIMES_API_URL, QURAN_API_KEY } from '../constants/config';
import type { PrayerMonth, PrayerMonthResponse } from '../types/prayerTimes';

export async function fetchMonthlyPrayerTimes(
  latitude: number,
  longitude: number
): Promise<PrayerMonth> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lng: String(longitude),
    apikey: QURAN_API_KEY,
  });

  const response = await fetch(`${PRAYER_TIMES_API_URL}/month?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json: PrayerMonthResponse = await response.json();

  if (!json.success || !json.data?.days) {
    throw new Error('Unexpected API response');
  }

  return json.data;
}
