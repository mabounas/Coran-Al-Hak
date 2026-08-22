export const PRAYER_KEYS = [
  'imsak',
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
] as const;

export type PrayerKey = (typeof PRAYER_KEYS)[number];

export type PrayerTimes = Record<PrayerKey, string>;

export interface PrayerDay {
  date: string;
  day: number;
  day_name: string;
  prayer_times: PrayerTimes;
  prayer_datetimes: Record<PrayerKey, string>;
}

export interface PrayerMonth {
  location: { latitude: number; longitude: number };
  timezone: string;
  month: number;
  year: number;
  month_name: string;
  calculation_method: string;
  madhab: string;
  total_days: number;
  days: PrayerDay[];
}

export interface PrayerMonthResponse {
  success: boolean;
  service: string;
  data: PrayerMonth;
  timestamp: string;
  api_info?: Record<string, string>;
}
