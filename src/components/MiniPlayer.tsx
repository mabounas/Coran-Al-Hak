import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../constants/config';
import { useAudioPlayerContext } from '../context/AudioPlayerContext';
import { useLocale } from '../context/LocaleContext';

export function MiniPlayer() {
  const { currentSurah, isPlaying, isBuffering, currentTime, duration, togglePlayPause, stop } =
    useAudioPlayerContext();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  if (!currentSurah) return null;

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  return (
    <View
      style={[
        styles.container,
        dark && styles.containerDark,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <View style={styles.info}>
          <Text style={[styles.nowPlaying, dark && styles.mutedDark]}>
            {t('player.nowPlaying')}
          </Text>
          <Text style={[styles.title, dark && styles.textDark]} numberOfLines={1}>
            {currentSurah.name_arabic} · {currentSurah.name_english}
          </Text>
        </View>
        <TouchableOpacity onPress={togglePlayPause} style={styles.playButton} hitSlop={10}>
          <Text style={styles.playGlyph}>{isBuffering ? '…' : isPlaying ? '❚❚' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={stop} style={styles.closeButton} hitSlop={10}>
          <Text style={[styles.closeGlyph, dark && styles.mutedDark]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  containerDark: {
    backgroundColor: COLORS.cardDark,
    borderTopColor: COLORS.borderDark,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  info: {
    flex: 1,
  },
  nowPlaying: {
    fontSize: 11,
    color: COLORS.muted,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: {
    color: '#fff',
    fontSize: 13,
  },
  closeButton: {
    padding: 4,
  },
  closeGlyph: {
    fontSize: 16,
    color: COLORS.muted,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
