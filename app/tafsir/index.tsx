import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { COLORS } from '../../src/constants/config';
import { useLocale } from '../../src/context/LocaleContext';
import { useSurahs } from '../../src/context/SurahsContext';
import type { Surah } from '../../src/types/quran';

export default function TafsirSurahListScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const router = useRouter();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const { surahs, loading, error, refresh } = useSurahs();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter(
      (s: Surah) =>
        s.name_english.toLowerCase().includes(q) ||
        s.name_translation.toLowerCase().includes(q) ||
        s.name_arabic.includes(q) ||
        String(s.number).includes(q)
    );
  }, [surahs, query]);

  if (loading && surahs.length === 0) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={[styles.muted, dark && styles.mutedDark]}>{t('home.loading')}</Text>
      </View>
    );
  }

  if (error && surahs.length === 0) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Text style={styles.errorTitle}>{t('home.errorTitle')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>{t('home.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderSurah = ({ item }: { item: Surah }) => (
    <View style={[styles.card, dark && styles.cardDark]}>
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <View style={[styles.badge, dark && styles.badgeDark]}>
          <Text style={[styles.badgeText, dark && styles.badgeTextDark]}>{item.number}</Text>
        </View>

        <View style={styles.info}>
          <Text style={[styles.arabicName, dark && styles.textDark]}>{item.name_arabic}</Text>
          <Text style={[styles.englishName, dark && styles.mutedDark]}>
            {item.name_english} · {item.name_translation}
          </Text>
          <Text style={[styles.meta, dark && styles.mutedDark]}>
            {t('home.verses', { count: item.verses_count })}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.explainButton}
          onPress={() =>
            router.push({
              pathname: '/tafsir/[number]',
              params: { number: String(item.number) },
            } as never)
          }
        >
          <Text style={styles.explainText}>{t('tafsir.button')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <View style={styles.searchWrap}>
        <Text style={[styles.subtitle, dark && styles.mutedDark]}>{t('tafsir.choose')}</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('home.searchPlaceholder')}
          placeholderTextColor={COLORS.muted}
          style={[styles.search, dark && styles.searchDark, { textAlign: isRTL ? 'right' : 'left' }]}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.number)}
        renderItem={renderSurah}
        contentContainerStyle={styles.listContent}
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
  muted: {
    color: COLORS.muted,
    fontSize: 13,
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
  subtitle: {
    fontSize: 12,
    color: COLORS.muted,
    paddingHorizontal: 2,
  },
  search: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  searchDark: {
    backgroundColor: COLORS.cardDark,
    borderColor: COLORS.borderDark,
    color: COLORS.textDark,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardDark: {
    backgroundColor: COLORS.cardDark,
    borderColor: COLORS.borderDark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  badgeText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  badgeTextDark: {
    color: COLORS.gold,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  arabicName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  englishName: {
    fontSize: 13,
    color: COLORS.muted,
  },
  meta: {
    fontSize: 12,
    color: COLORS.muted,
  },
  explainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  explainText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
