import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { fetchTodayHijri } from '../api/hijriDate';
import { COLORS } from '../constants/config';
import { useLocale } from '../context/LocaleContext';
import type { HijriInfo } from '../types/hijriDate';

export function DateBar() {
  const { language } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const [hijri, setHijri] = useState<HijriInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTodayHijri()
      .then((result) => {
        if (!cancelled) setHijri(result);
      })
      .catch(() => {
        // Silently keep showing just the Gregorian date if the API is unreachable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  let gregorian: string;
  try {
    gregorian = new Intl.DateTimeFormat(language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    gregorian = new Date().toDateString();
  }

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <Text style={[styles.text, dark && styles.textDark]} numberOfLines={1}>
        {gregorian}
        {hijri ? `  •  ${hijri.day} ${hijri.month_name_arabic} ${hijri.year} هـ` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
    alignItems: 'center',
  },
  containerDark: {
    backgroundColor: COLORS.cardDark,
    borderBottomColor: COLORS.borderDark,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  textDark: {
    color: COLORS.gold,
  },
});
