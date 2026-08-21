import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { LanguagePicker } from '../src/components/LanguagePicker';
import { COLORS } from '../src/constants/config';
import { LANGUAGES } from '../src/constants/languages';
import { useLocale } from '../src/context/LocaleContext';

interface Tile {
  key: string;
  icon: string;
  route: string;
}

const TILES: Tile[] = [
  { key: 'listen', icon: '🎧', route: '/quran-listen' },
  { key: 'read', icon: '📖', route: '/coming-soon/read' },
  { key: 'search', icon: '🔎', route: '/coming-soon/search' },
  { key: 'hadith', icon: '📜', route: '/coming-soon/hadith' },
  { key: 'tafsir', icon: '💡', route: '/coming-soon/tafsir' },
  { key: 'dua', icon: '🤲', route: '/coming-soon/dua' },
  { key: 'qibla', icon: '🧭', route: '/coming-soon/qibla' },
  { key: 'about', icon: 'ℹ️', route: '/about' },
];

export default function LandingScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const router = useRouter();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const [languagePickerVisible, setLanguagePickerVisible] = useState(false);
  const currentLanguage = LANGUAGES.find((lang) => lang.code === language);

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <TouchableOpacity
        style={[styles.languageBanner, isRTL && styles.languageBannerRTL]}
        onPress={() => setLanguagePickerVisible(true)}
      >
        <Text style={styles.languageBannerIcon}>🌐</Text>
        <View style={styles.languageBannerText}>
          <Text style={styles.languageBannerTitle}>{t('landing.chooseLanguage')}</Text>
          <Text style={styles.languageBannerCurrent}>{currentLanguage?.nativeLabel}</Text>
        </View>
      </TouchableOpacity>

      <LanguagePicker
        visible={languagePickerVisible}
        onClose={() => setLanguagePickerVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.grid}>
        {TILES.map((tile) => (
          <TouchableOpacity
            key={tile.key}
            style={[styles.tile, dark && styles.tileDark]}
            onPress={() => router.push(tile.route as never)}
          >
            <Text style={styles.tileIcon}>{tile.icon}</Text>
            <Text style={[styles.tileLabel, dark && styles.textDark]}>
              {tile.key === 'about' ? t('about.title') : t(`landing.${tile.key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  languageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
  },
  languageBannerRTL: {
    flexDirection: 'row-reverse',
  },
  languageBannerIcon: {
    fontSize: 24,
  },
  languageBannerText: {
    gap: 2,
  },
  languageBannerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  languageBannerCurrent: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 14,
  },
  tile: {
    width: '46%',
    aspectRatio: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  tileDark: {
    backgroundColor: COLORS.cardDark,
    borderColor: COLORS.borderDark,
  },
  tileIcon: {
    fontSize: 34,
  },
  tileLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  textDark: {
    color: COLORS.textDark,
  },
});
