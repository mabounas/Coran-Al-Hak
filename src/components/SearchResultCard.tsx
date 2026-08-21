import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { COLORS } from '../constants/config';
import type { TranslationKey } from '../constants/translations';
import { useLocale } from '../context/LocaleContext';
import { getSurahTranslations } from '../data/translationCache';

const MATCH_LABELS: Record<string, string> = {
  arabic: 'العربية',
  transliteration: 'Translit.',
  sahih_international: 'EN',
};

export interface SearchResultItem {
  verseKey: string;
  surahNumber: number;
  ayah: number;
  surahName: string;
  arabic: string;
  /** Translation already known, in the profile language. */
  translation?: string;
  matchedIn: string;
}

interface Props {
  item: SearchResultItem;
  translationKey?: TranslationKey;
  arabicFont?: string;
}

export function SearchResultCard({ item, translationKey, arabicFont }: Props) {
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const router = useRouter();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const [translation, setTranslation] = useState(item.translation);

  // Cards fetch their own translation as they scroll into view; the cache
  // collapses that into one request per surah.
  useEffect(() => {
    setTranslation(item.translation);
    if (item.translation || !translationKey) return;

    let active = true;
    getSurahTranslations(item.surahNumber, translationKey)
      .then((map) => {
        if (active) setTranslation(map.get(item.ayah));
      })
      .catch(() => {
        // Leave the verse untranslated rather than failing the whole list.
      });

    return () => {
      active = false;
    };
  }, [item.translation, item.surahNumber, item.ayah, translationKey]);

  return (
    <View style={[styles.card, dark && styles.cardDark]}>
      <View style={[styles.cardHeader, isRTL && styles.rowRTL]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.surahNumber}:{item.ayah}
          </Text>
        </View>
        <Text style={[styles.surahName, dark && styles.textDark]} numberOfLines={1}>
          {item.surahName}
        </Text>
        <View style={styles.matchTag}>
          <Text style={styles.matchTagText}>
            {MATCH_LABELS[item.matchedIn] ?? item.matchedIn}
          </Text>
        </View>
      </View>

      <Text
        style={[styles.arabic, dark && styles.textDark, arabicFont ? { fontFamily: arabicFont } : null]}
      >
        {item.arabic}
      </Text>

      {translation ? (
        <Text style={[styles.translation, dark && styles.mutedDark]}>{translation}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.openButton}
        onPress={() =>
          router.push({
            pathname: '/lecture/[number]',
            params: { number: String(item.surahNumber), sound: '0' },
          } as never)
        }
      >
        <Text style={styles.openButtonText}>{t('search.openSurah')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  surahName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  matchTag: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  matchTagText: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: '600',
  },
  arabic: {
    fontSize: 22,
    lineHeight: 46,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: COLORS.text,
  },
  translation: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.muted,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  openButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  openButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
