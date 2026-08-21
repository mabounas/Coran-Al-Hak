import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { COLORS } from '../constants/config';
import { buildReciterAudioUrl, type Reciter } from '../constants/reciters';
import { useAudioPlayerContext } from '../context/AudioPlayerContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useLocale } from '../context/LocaleContext';
import type { Surah } from '../types/quran';
import { ReciterPicker } from './ReciterPicker';

interface Props {
  surah: Surah;
}

export function SurahCard({ surah }: Props) {
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const { currentSurah, isPlaying, isBuffering, playSurah, togglePlayPause } =
    useAudioPlayerContext();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [pickerVisible, setPickerVisible] = useState(false);

  const active = currentSurah?.number === surah.number;
  const bookmarked = isBookmarked(surah.number);

  const handlePlayPress = () => {
    if (active) {
      togglePlayPause();
    } else {
      setPickerVisible(true);
    }
  };

  const handleReciterSelect = (reciter: Reciter) => {
    setPickerVisible(false);
    const audioUrl = buildReciterAudioUrl(reciter, surah.number);
    playSurah(surah, audioUrl, reciter);
  };

  return (
    <View style={[styles.card, dark && styles.cardDark, active && styles.cardActive]}>
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <View style={[styles.badge, dark && styles.badgeDark]}>
          <Text style={[styles.badgeText, dark && styles.badgeTextDark]}>{surah.number}</Text>
        </View>

        <View style={styles.info}>
          <View style={[styles.namesRow, isRTL && styles.rowRTL]}>
            <Text style={[styles.arabicName, dark && styles.textDark]}>{surah.name_arabic}</Text>
          </View>
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
          {active && (
            <TouchableOpacity
              onPress={() => setPickerVisible(true)}
              accessibilityLabel={t('reciter.title')}
              style={styles.iconButton}
              hitSlop={8}
            >
              <Text style={styles.iconGlyph}>🎙️</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handlePlayPress}
            accessibilityLabel={active && isPlaying ? t('home.pause') : t('home.play')}
            style={[styles.playButton, active && styles.playButtonActive]}
            hitSlop={8}
          >
            <Text style={styles.playGlyph}>
              {active && isBuffering ? '…' : active && isPlaying ? '❚❚' : '▶'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ReciterPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleReciterSelect}
      />
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
  cardActive: {
    borderColor: COLORS.primary,
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
  namesRow: {
    alignItems: 'center',
  },
  arabicName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  englishName: {
    fontSize: 14,
    color: COLORS.muted,
  },
  metaRow: {
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
    gap: 10,
  },
  iconButton: {
    padding: 4,
  },
  iconGlyph: {
    fontSize: 20,
    color: COLORS.gold,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: COLORS.primaryDark,
  },
  playGlyph: {
    color: '#fff',
    fontSize: 14,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
