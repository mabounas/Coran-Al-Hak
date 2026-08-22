import { AmiriQuran_400Regular, useFonts } from '@expo-google-fonts/amiri-quran';
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

import { fetchAsmaUlHusna } from '../src/api/asmaUlHusna';
import { toArabicNumerals } from '../src/constants/arabic';
import { COLORS } from '../src/constants/config';
import { useLocale } from '../src/context/LocaleContext';
import type { AsmaUlHusnaData, DivineName } from '../src/types/asmaUlHusna';

export default function DivineNamesScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const arabicUi = language === 'ar';

  const [fontsLoaded] = useFonts({ AmiriQuran_400Regular });
  const arabicFont = fontsLoaded ? { fontFamily: 'AmiriQuran_400Regular' } : null;

  const [data, setData] = useState<AsmaUlHusnaData | null>(null);
  const [openName, setOpenName] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAsmaUlHusna());
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
        <Text style={[styles.loadingText, dark && styles.mutedDark]}>{t('names.loading')}</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Text style={styles.errorTitle}>{t('names.error')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>{t('home.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // The API only writes the explanation in English, so it is left out of the
  // Arabic reading, where nothing would be gained by a tap.
  const renderName = ({ item }: { item: DivineName }) => {
    const expandable = !arabicUi && Boolean(item.meaning);
    const expanded = openName === item.number;

    return (
      <TouchableOpacity
        activeOpacity={expandable ? 0.7 : 1}
        disabled={!expandable}
        onPress={() => setOpenName(expanded ? null : item.number)}
        style={[styles.card, dark && styles.cardDark, expanded && styles.cardOpen]}
      >
        <View style={[styles.row, isRTL && styles.rowRTL]}>
          <View style={[styles.badge, dark && styles.badgeDark]}>
            <Text style={[styles.badgeText, dark && styles.badgeTextDark]}>
              {arabicUi ? toArabicNumerals(item.number) : item.number}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={[styles.arabic, dark && styles.textDark, arabicFont]}>{item.arabic}</Text>
            <Text style={styles.transliteration}>{item.transliteration}</Text>
            <Text style={[styles.english, dark && styles.mutedDark]}>{item.english}</Text>
          </View>

          {expandable ? (
            <Text style={styles.chevron}>{expanded ? '▴' : '▾'}</Text>
          ) : null}
        </View>

        {expandable && expanded ? (
          <Text style={[styles.meaning, dark && styles.mutedDark]}>{item.meaning}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <FlatList
        data={data.names}
        keyExtractor={(item) => String(item.number)}
        renderItem={renderName}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        ListHeaderComponent={
          <View style={styles.header}>
            {!arabicUi ? (
              <Text style={[styles.headerTitle, arabicFont]}>{data.arabic_title}</Text>
            ) : null}
            <Text style={[styles.headerSubtitle, dark && styles.mutedDark]}>
              {t('names.count', {
                count: arabicUi ? toArabicNumerals(data.total_count) : data.total_count,
              })}
            </Text>
            {!arabicUi ? (
              <Text style={[styles.headerSubtitle, dark && styles.mutedDark]}>
                {t('names.tapHint')}
              </Text>
            ) : null}
            {!arabicUi && data.hadith ? (
              <Text style={[styles.hadith, dark && styles.mutedDark]}>{data.hadith}</Text>
            ) : null}
          </View>
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
  listContent: {
    paddingBottom: 28,
  },
  header: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 26,
    lineHeight: 52,
    color: COLORS.primary,
    writingDirection: 'rtl',
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
  },
  hadith: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.muted,
    textAlign: 'center',
    paddingTop: 4,
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
  cardOpen: {
    borderColor: COLORS.primary,
  },
  chevron: {
    fontSize: 16,
    color: COLORS.muted,
    paddingHorizontal: 4,
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
  arabic: {
    fontSize: 26,
    lineHeight: 52,
    color: COLORS.text,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  transliteration: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gold,
    textAlign: 'center',
  },
  english: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  meaning: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
