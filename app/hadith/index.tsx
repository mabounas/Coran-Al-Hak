import { AmiriQuran_400Regular, useFonts } from '@expo-google-fonts/amiri-quran';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

import { fetchHadithCollections } from '../../src/api/hadith';
import { COLORS } from '../../src/constants/config';
import { useLocale } from '../../src/context/LocaleContext';
import type { HadithCollection } from '../../src/types/hadith';

export default function HadithCollectionsScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const router = useRouter();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const arabicUi = language === 'ar';

  const [fontsLoaded] = useFonts({ AmiriQuran_400Regular });
  const arabicFont = fontsLoaded ? { fontFamily: 'AmiriQuran_400Regular' } : null;

  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHadithCollections();
      setCollections(data.collections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={[styles.muted, dark && styles.mutedDark]}>{t('hadith.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Text style={styles.errorTitle}>{t('hadith.error')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>{t('home.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderCollection = ({ item }: { item: HadithCollection }) => (
    <TouchableOpacity
      style={[styles.card, dark && styles.cardDark]}
      onPress={() =>
        router.push({
          pathname: '/hadith/[collection]',
          params: { collection: item.key },
        } as never)
      }
    >
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <View style={styles.info}>
          <Text style={[styles.arabicName, dark && styles.textDark, arabicFont]}>
            {item.arabic_name}
          </Text>
          {!arabicUi ? (
            <Text style={[styles.name, dark && styles.textDark]}>{item.name}</Text>
          ) : null}
          <Text style={[styles.meta, dark && styles.mutedDark]}>
            {item.author} · {item.reliability}
          </Text>
          <Text style={[styles.count, dark && styles.mutedDark]}>
            {t('hadith.total', { count: item.total_hadiths })}
          </Text>
        </View>
        <Text style={styles.chevron}>{isRTL ? '‹' : '›'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <FlatList
        data={collections}
        keyExtractor={(item) => item.key}
        renderItem={renderCollection}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={[styles.header, dark && styles.mutedDark]}>{t('hadith.choose')}</Text>
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
  header: {
    fontSize: 12,
    color: COLORS.muted,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 4,
  },
  listContent: {
    paddingBottom: 28,
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
    gap: 10,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  arabicName: {
    fontSize: 22,
    lineHeight: 44,
    color: COLORS.text,
    writingDirection: 'rtl',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  meta: {
    fontSize: 12,
    color: COLORS.muted,
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.muted,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
