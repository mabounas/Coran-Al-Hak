import { AmiriQuran_400Regular, useFonts } from '@expo-google-fonts/amiri-quran';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { fetchHadithPage } from '../../src/api/hadith';
import { COLORS } from '../../src/constants/config';
import { useLocale } from '../../src/context/LocaleContext';
import type { Hadith, HadithPage } from '../../src/types/hadith';

export default function HadithListScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const params = useLocalSearchParams<{ collection: string }>();
  const collection = params.collection ?? '';

  const [fontsLoaded] = useFonts({ AmiriQuran_400Regular });
  const arabicFont = fontsLoaded ? { fontFamily: 'AmiriQuran_400Regular' } : null;

  const [page, setPage] = useState<HadithPage | null>(null);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const loadPage = useCallback(
    async (pageNumber: number) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const data = await fetchHadithPage(collection, pageNumber);
        setPage(data);
        setHadiths((previous) => (pageNumber === 1 ? data.hadiths : [...previous, ...data.hadiths]));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [collection]
  );

  useEffect(() => {
    if (collection) loadPage(1);
  }, [collection, loadPage]);

  // Big collections run into the thousands, so the next page is fetched as the
  // reader reaches the end of the current one.
  const loadMore = () => {
    if (!page || loadingRef.current) return;
    if (page.page >= page.total_pages) return;
    loadPage(page.page + 1);
  };

  const title = page?.collection_name ?? t('landing.hadith');

  if (loading) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Stack.Screen options={{ title }} />
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={[styles.muted, dark && styles.mutedDark]}>{t('hadith.loading')}</Text>
      </View>
    );
  }

  if (error && hadiths.length === 0) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Stack.Screen options={{ title }} />
        <Text style={styles.errorTitle}>{t('hadith.error')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadPage(1)}>
          <Text style={styles.retryText}>{t('home.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderHadith = ({ item }: { item: Hadith }) => (
    <View style={[styles.card, dark && styles.cardDark]}>
      <View style={[styles.cardHeader, isRTL && styles.rowRTL]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.hadithnumber}</Text>
        </View>
        {item.grade ? (
          <View style={styles.gradeTag}>
            <Text style={styles.gradeText}>{item.grade}</Text>
          </View>
        ) : null}
      </View>

      {item.arabic ? (
        <Text style={[styles.arabic, dark && styles.textDark, arabicFont]}>{item.arabic}</Text>
      ) : null}
      {item.english ? (
        <Text style={[styles.english, dark && styles.mutedDark]}>{item.english}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <Stack.Screen options={{ title }} />
      <FlatList
        data={hadiths}
        keyExtractor={(item) => item.id}
        renderItem={renderHadith}
        contentContainerStyle={styles.listContent}
        initialNumToRender={8}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListHeaderComponent={
          page ? (
            <View style={styles.header}>
              <Text style={[styles.headerTitle, dark && styles.textDark]}>
                {page.collection_name}
              </Text>
              <Text style={[styles.headerCount, dark && styles.mutedDark]}>
                {t('hadith.total', { count: page.total })}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={COLORS.primary} style={styles.footerSpinner} />
          ) : null
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
  listContent: {
    paddingBottom: 28,
  },
  header: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  cardDark: {
    backgroundColor: COLORS.cardDark,
    borderColor: COLORS.borderDark,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  gradeTag: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gold,
  },
  arabic: {
    fontSize: 22,
    lineHeight: 46,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: COLORS.text,
  },
  english: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.muted,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  footerSpinner: {
    paddingVertical: 16,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
