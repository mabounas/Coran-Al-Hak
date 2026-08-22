import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { LanguagePicker } from '../src/components/LanguagePicker';
import { SurahSearchField } from '../src/components/SurahSearchField';
import { SurahCard } from '../src/components/SurahCard';
import { COLORS } from '../src/constants/config';
import { filterSurahs } from '../src/constants/surahFilter';
import { LANGUAGES } from '../src/constants/languages';
import { useLocale } from '../src/context/LocaleContext';
import { useSurahs } from '../src/context/SurahsContext';
import type { Surah } from '../src/types/quran';

export default function SummaryScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const { surahs, loading, error, refresh } = useSurahs();
  const [query, setQuery] = useState('');
  const [languagePickerVisible, setLanguagePickerVisible] = useState(false);
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const currentLanguage = LANGUAGES.find((lang) => lang.code === language);

  const filtered = useMemo(() => filterSurahs(surahs, query), [surahs, query]);

  if (loading && surahs.length === 0) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={[styles.loadingText, dark && styles.textDark]}>{t('home.loading')}</Text>
      </View>
    );
  }

  if (error && surahs.length === 0) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Text style={[styles.errorTitle, dark && styles.textDark]}>{t('home.errorTitle')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>{t('home.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <View style={styles.searchWrap}>
        <View style={[styles.topRow, isRTL && styles.topRowRTL]}>
          <Text style={[styles.subtitle, dark && styles.mutedDark]}>
            {t('home.subtitle')}
          </Text>
          <TouchableOpacity
            onPress={() => setLanguagePickerVisible(true)}
            style={[styles.languageButton, dark && styles.languageButtonDark]}
          >
            <Text style={[styles.languageButtonText, dark && styles.textDark]}>
              {currentLanguage?.nativeLabel ?? t('settings.language')}
            </Text>
          </TouchableOpacity>
        </View>
        <SurahSearchField value={query} onChangeText={setQuery} />
      </View>
      <LanguagePicker
        visible={languagePickerVisible}
        onClose={() => setLanguagePickerVisible(false)}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.number)}
        renderItem={({ item }) => <SurahCard surah={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={COLORS.primary} />
        }
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
    backgroundColor: COLORS.background,
    padding: 24,
  },
  centeredDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  loadingText: {
    color: COLORS.muted,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.danger,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topRowRTL: {
    flexDirection: 'row-reverse',
  },
  languageButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  languageButtonDark: {
    backgroundColor: COLORS.cardDark,
    borderColor: COLORS.borderDark,
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.muted,
    paddingHorizontal: 2,
  },
  listContent: {
    paddingBottom: 24,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
