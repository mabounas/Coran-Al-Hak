import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { COLORS } from '../constants/config';
import { useBookmarks } from '../context/BookmarksContext';
import { useLocale } from '../context/LocaleContext';
import type { Surah } from '../types/quran';
import { ReadOptionsModal, type ReadOptions } from './ReadOptionsModal';

interface Props {
  surah: Surah;
}

export function SurahReadCard({ surah }: Props) {
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const router = useRouter();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [optionsVisible, setOptionsVisible] = useState(false);

  const bookmarked = isBookmarked(surah.number);

  const handleConfirm = ({ sound, textMode, reciter }: ReadOptions) => {
    setOptionsVisible(false);
    router.push({
      pathname: '/lecture/[number]',
      params: {
        number: String(surah.number),
        sound: sound ? '1' : '0',
        mode: textMode,
        reciter: reciter.linkReciter,
      },
    } as never);
  };

  return (
    <View style={[styles.card, dark && styles.cardDark]}>
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <View style={[styles.badge, dark && styles.badgeDark]}>
          <Text style={[styles.badgeText, dark && styles.badgeTextDark]}>{surah.number}</Text>
        </View>

        <View style={styles.info}>
          <Text style={[styles.arabicName, dark && styles.textDark]}>{surah.name_arabic}</Text>
          <Text style={[styles.englishName, dark && styles.textDark]}>
            {surah.name_english} · {surah.name_translation}
          </Text>
          <View style={[styles.metaRow, isRTL && styles.rowRTL]}>
            <View style={[styles.tag, dark && styles.tagDark]}>
              <Text style={[styles.tagText, dark && styles.tagTextDark]}>
                {surah.revelation_place === 'makkah' ? t('home.makkah') : t('home.madinah')}
              </Text>
            </View>
            <Text style={[styles.metaText, dark && styles.mutedDark]}>
              {t('home.verses', { count: surah.verses_count })}
            </Text>
          </View>
        </View>

        <View style={[styles.actions, isRTL && styles.rowRTL]}>
          <TouchableOpacity
            onPress={() => toggleBookmark(surah.number)}
            accessibilityLabel={bookmarked ? t('home.bookmarkRemove') : t('home.bookmarkAdd')}
            style={styles.iconButton}
            hitSlop={8}
          >
            <Text style={styles.iconGlyph}>{bookmarked ? '★' : '☆'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.displayButton} onPress={() => setOptionsVisible(true)}>
            <Text style={styles.displayText}>{t('read.display')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {optionsVisible && (
        <ReadOptionsModal
          visible={optionsVisible}
          surah={surah}
          onClose={() => setOptionsVisible(false)}
          onConfirm={handleConfirm}
        />
      )}
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
    gap: 4,
  },
  arabicName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  englishName: {
    fontSize: 14,
    color: COLORS.muted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  tagDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  tagTextDark: {
    color: COLORS.gold,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  actions: {
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  iconGlyph: {
    fontSize: 20,
    color: COLORS.gold,
  },
  displayButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  displayText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
