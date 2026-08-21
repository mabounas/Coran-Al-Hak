import { HIJRI_DATE_API_URL, QURAN_API_KEY } from '../constants/config';
import type { HijriDateResponse, HijriInfo } from '../types/hijriDate';

export async function fetchTodayHijri(): Promise<HijriInfo> {
  const url = `${HIJRI_DATE_API_URL}?q=${encodeURIComponent('فَضْلُ')}&apikey=${QURAN_API_KEY}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json: HijriDateResponse = await response.json();
  const hijri = Array.isArray(json.data?.hijri) ? json.data?.hijri[0] : json.data?.hijri;

  if (!json.success || !hijri || hijri.day == null || !hijri.month_name_arabic || hijri.year == null) {
    throw new Error('Unexpected API response');
  }

  return hijri;
}
