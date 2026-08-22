import * as Location from 'expo-location';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { fetchMonthlyPrayerTimes } from '../src/api/prayerTimes';
import { CityPicker } from '../src/components/CityPicker';
import type { City } from '../src/constants/cities';
import { COLORS } from '../src/constants/config';
import { useLocale } from '../src/context/LocaleContext';
import { PRAYER_KEYS, type PrayerDay, type PrayerMonth } from '../src/types/prayerTimes';

type Status = 'idle' | 'loading' | 'denied' | 'error' | 'ready';

const DATE_COLUMN_WIDTH = 68;
const TIME_COLUMN_WIDTH = 52;

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function PrayerTimesScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const [status, setStatus] = useState<Status>('idle');
  const [month, setMonth] = useState<PrayerMonth | null>(null);
  const [cityPickerVisible, setCityPickerVisible] = useState(false);

  const load = async (latitude: number, longitude: number) => {
    setStatus('loading');
    try {
      setMonth(await fetchMonthlyPrayerTimes(latitude, longitude));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  // Must run straight from the tap: iOS Safari refuses the geolocation prompt
  // when it is asked for from an effect on mount.
  const useMyPosition = async () => {
    setStatus('loading');
    const { status: permission } = await Location.requestForegroundPermissionsAsync();
    if (permission !== 'granted') {
      setStatus('denied');
      return;
    }
    try {
      const position = await Location.getCurrentPositionAsync({});
      await load(position.coords.latitude, position.coords.longitude);
    } catch {
      setStatus('error');
    }
  };

  const selectCity = async (city: City) => {
    setCityPickerVisible(false);
    await load(city.latitude, city.longitude);
  };

  const cityFallback = (
    <>
      <TouchableOpacity onPress={() => setCityPickerVisible(true)} style={styles.linkButton}>
        <Text style={styles.linkText}>{t('qibla.chooseCity')}</Text>
      </TouchableOpacity>
      <CityPicker
        visible={cityPickerVisible}
        onClose={() => setCityPickerVisible(false)}
        onSelect={selectCity}
      />
    </>
  );

  if (status !== 'ready' || !month) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        {status === 'loading' ? (
          <>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={[styles.muted, dark && styles.mutedDark]}>{t('qibla.locating')}</Text>
          </>
        ) : (
          <>
            <Text style={styles.glyph}>🕰️</Text>
            <Text style={[styles.intro, dark && styles.mutedDark]}>
              {status === 'denied'
                ? t('prayer.permissionDenied')
                : status === 'error'
                  ? t('prayer.error')
                  : t('prayer.intro')}
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={useMyPosition}>
              <Text style={styles.primaryButtonText}>{t('prayer.start')}</Text>
            </TouchableOpacity>
            {cityFallback}
          </>
        )}
      </View>
    );
  }

  const today = todayIso();

  const renderRow = (day: PrayerDay) => {
    const isToday = day.date === today;
    return (
      <View
        key={day.date}
        style={[styles.row, isToday && styles.rowToday, dark && styles.rowDark]}
      >
        <View style={[styles.dateCell, { width: DATE_COLUMN_WIDTH }]}>
          <Text style={[styles.dateNumber, dark && styles.textDark, isToday && styles.todayText]}>
            {day.day}
          </Text>
          <Text style={[styles.dateName, dark && styles.mutedDark]}>
            {day.day_name.slice(0, 3)}
          </Text>
        </View>
        {PRAYER_KEYS.map((key) => (
          <Text
            key={key}
            style={[
              styles.timeCell,
              { width: TIME_COLUMN_WIDTH },
              dark && styles.textDark,
              isToday && styles.todayText,
            ]}
          >
            {day.prayer_times[key]}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <View style={[styles.header, dark && styles.headerDark]}>
        <Text style={[styles.monthTitle, dark && styles.textDark]}>
          {month.month_name} {month.year}
        </Text>
        <Text style={[styles.muted, dark && styles.mutedDark]}>
          {month.timezone} · {month.calculation_method} · {month.madhab}
        </Text>
        <TouchableOpacity onPress={() => setCityPickerVisible(true)} style={styles.linkButton}>
          <Text style={styles.linkText}>{t('qibla.chooseCity')}</Text>
        </TouchableOpacity>
      </View>

      {/* Eight narrow columns: on a small screen the table scrolls sideways
          rather than squeezing the times. */}
      <ScrollView horizontal contentContainerStyle={styles.tableWrap}>
        <View>
          <View style={[styles.row, styles.headRow]}>
            <Text style={[styles.headCell, { width: DATE_COLUMN_WIDTH }]}>{t('prayer.date')}</Text>
            {PRAYER_KEYS.map((key) => (
              <Text key={key} style={[styles.headCell, { width: TIME_COLUMN_WIDTH }]}>
                {t(`prayer.${key}`)}
              </Text>
            ))}
          </View>
          <ScrollView contentContainerStyle={styles.body}>
            {month.days.map(renderRow)}
          </ScrollView>
        </View>
      </ScrollView>

      <CityPicker
        visible={cityPickerVisible}
        onClose={() => setCityPickerVisible(false)}
        onSelect={selectCity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: COLORS.background,
  },
  centeredDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  glyph: {
    fontSize: 38,
  },
  intro: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  muted: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  linkButton: {
    paddingVertical: 6,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 2,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerDark: {
    backgroundColor: COLORS.cardDark,
    borderBottomColor: COLORS.borderDark,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  tableWrap: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  body: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 7,
  },
  rowDark: {
    borderBottomColor: COLORS.borderDark,
  },
  rowToday: {
    backgroundColor: 'rgba(201,162,75,0.18)',
    borderRadius: 8,
  },
  headRow: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  headCell: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  dateCell: {
    alignItems: 'center',
  },
  dateNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  dateName: {
    fontSize: 10,
    color: COLORS.muted,
  },
  timeCell: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
  },
  todayText: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
