import Constants from 'expo-constants';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { COLORS } from '../src/constants/config';
import { LANGUAGES } from '../src/constants/languages';
import { useLocale } from '../src/context/LocaleContext';

export default function AboutScreen() {
  const { t } = useTranslation();
  const { language } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const isArabic = language === 'ar';
  const sadaqah = isArabic ? 'صدقة جارية' : 'Sadaqah Jariyah';
  const creator = isArabic ? 'بقلم محمد أبوالنصر' : 'by Mohamed Abounasser';

  return (
    <ScrollView
      style={[styles.container, dark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.crescent}>🌙</Text>
      <Text style={[styles.sadaqah, dark && styles.mutedDark]}>{sadaqah}</Text>
      <Text style={[styles.appName, dark && styles.textDark]}>{t('app.name')}</Text>
      <Text style={[styles.creator, dark && styles.mutedDark]}>{creator}</Text>
      <Text style={[styles.description, dark && styles.mutedDark]}>{t('about.description')}</Text>

      <View style={[styles.card, dark && styles.cardDark]}>
        <Text style={[styles.cardTitle, dark && styles.textDark]}>
          {t('menu.language')} ({LANGUAGES.length})
        </Text>
        <Text style={[styles.languagesList, dark && styles.mutedDark]}>
          {LANGUAGES.map((l) => l.nativeLabel).join(' · ')}
        </Text>
      </View>

      <View style={[styles.card, dark && styles.cardDark]}>
        <Text style={[styles.cardTitle, dark && styles.textDark]}>{t('about.apiCredit')}</Text>
      </View>

      <Text style={[styles.version, dark && styles.mutedDark]}>
        {t('about.version')} {version}
      </Text>
    </ScrollView>
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
  content: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  crescent: {
    fontSize: 44,
  },
  sadaqah: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: COLORS.gold,
    textTransform: 'uppercase',
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  creator: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: -6,
  },
  description: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginTop: 8,
    gap: 6,
  },
  cardDark: {
    backgroundColor: COLORS.cardDark,
    borderColor: COLORS.borderDark,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 19,
  },
  languagesList: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 19,
  },
  version: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 8,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
