import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

import { fetchSurahDetail } from '../../src/api/quran';
import { COLORS } from '../../src/constants/config';
import { RECITERS, buildReciterAudioUrl } from '../../src/constants/reciters';
import { getVerseTranslation, hasTranslation } from '../../src/constants/translations';
import { useAudioPlayerContext } from '../../src/context/AudioPlayerContext';
import { useLocale } from '../../src/context/LocaleContext';
import { useSurahs } from '../../src/context/SurahsContext';
import type { Surah, SurahDetail, Verse } from '../../src/types/quran';

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

export default function ReadSurahScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const params = useLocalSearchParams<{
    number: string;
    sound?: string;
    translation?: string;
    reciter?: string;
  }>();

  const surahNumber = Number(params.number);
  const translationAvailable = hasTranslation(language);

  const { surahs } = useSurahs();
  const { currentSurah, isPlaying, isBuffering, playSurah, togglePlayPause } =
    useAudioPlayerContext();

  const [detail, setDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(
    params.translation === '1' && translationAvailable
  );
  const autoPlayedRef = useRef(false);

  const reciter = useMemo(
    () => RECITERS.find((r) => r.linkReciter === params.reciter) ?? RECITERS[0],
    [params.reciter]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSurahDetail(surahNumber);
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [surahNumber]);

  useEffect(() => {
    if (Number.isFinite(surahNumber)) load();
  }, [surahNumber, load]);

  // The audio player works on the full Surah shape from the summary list; when
  // that list has not loaded yet we rebuild the minimal object from the detail.
  const playableSurah = useMemo<Surah | null>(() => {
    const fromList = surahs.find((s) => s.number === surahNumber);
    if (fromList) return fromList;
    if (!detail) return null;
    const info = detail.surah;
    return {
      ...info,
      name_complex: info.name_english,
      pages: [],
      audio: { reciters_available: 0, example_audio: '' },
    };
  }, [surahs, surahNumber, detail]);

  const active = currentSurah?.number === surahNumber;

  const handleTogglePlay = useCallback(() => {
    if (active) {
      togglePlayPause();
      return;
    }
    if (!playableSurah) return;
    playSurah(playableSurah, buildReciterAudioUrl(reciter, surahNumber), reciter);
  }, [active, playableSurah, playSurah, reciter, surahNumber, togglePlayPause]);

  useEffect(() => {
    if (autoPlayedRef.current) return;
    if (params.sound !== '1' || !playableSurah) return;
    autoPlayedRef.current = true;
    playSurah(playableSurah, buildReciterAudioUrl(reciter, surahNumber), reciter);
  }, [params.sound, playableSurah, playSurah, reciter, surahNumber]);

  const title = detail
    ? `${detail.surah.number}. ${detail.surah.name_arabic}`
    : t('landing.read');

  if (loading) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Stack.Screen options={{ title }} />
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={[styles.loadingText, dark && styles.mutedDark]}>{t('read.loading')}</Text>
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Stack.Screen options={{ title }} />
        <Text style={[styles.errorTitle, dark && styles.textDark]}>{t('read.error')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>{t('home.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderVerse = ({ item }: { item: Verse }) => {
    const translated = showTranslation ? getVerseTranslation(item, language) : undefined;
    return (
      <View style={[styles.verseCard, dark && styles.verseCardDark]}>
        <View style={styles.verseHeader}>
          <View style={[styles.verseBadge, dark && styles.verseBadgeDark]}>
            <Text style={[styles.verseBadgeText, dark && styles.verseBadgeTextDark]}>
              {item.ayah}
            </Text>
          </View>
        </View>
        <Text style={[styles.arabic, dark && styles.textDark]}>{item.arabic}</Text>
        {translated ? (
          <Text
            style={[
              styles.translation,
              dark && styles.mutedDark,
              { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' },
            ]}
          >
            {translated}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <Stack.Screen options={{ title }} />

      <View style={[styles.toolbar, dark && styles.toolbarDark]}>
        <View style={styles.toolbarInfo}>
          <Text style={[styles.toolbarTitle, dark && styles.textDark]}>
            {detail.surah.name_english} · {detail.surah.name_translation}
          </Text>
          <Text style={[styles.toolbarMeta, dark && styles.mutedDark]}>
            {t('home.verses', { count: detail.total_verses })}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowTranslation((v) => !v)}
          disabled={!translationAvailable}
          style={[
            styles.chip,
            dark && styles.chipDark,
            showTranslation && styles.chipActive,
            !translationAvailable && styles.chipDisabled,
          ]}
        >
          <Text style={[styles.chipText, showTranslation && styles.chipTextActive]}>
            {t('read.translation')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleTogglePlay}
          style={[styles.playButton, active && isPlaying && styles.playButtonActive]}
          accessibilityLabel={active && isPlaying ? t('home.pause') : t('home.play')}
        >
          <Text style={styles.playGlyph}>
            {active && isBuffering ? '…' : active && isPlaying ? '❚❚' : '▶'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={detail.verses}
        keyExtractor={(item) => item.verse_key}
        renderItem={renderVerse}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          detail.surah.bismillah_pre ? (
            <Text style={[styles.bismillah, dark && styles.textDark]}>{BISMILLAH}</Text>
          ) : null
        }
        initialNumToRender={12}
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toolbarDark: {
    backgroundColor: COLORS.cardDark,
    borderBottomColor: COLORS.borderDark,
  },
  toolbarInfo: {
    flex: 1,
    gap: 2,
  },
  toolbarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  toolbarMeta: {
    fontSize: 12,
    color: COLORS.muted,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  chipDark: {
    borderColor: COLORS.borderDark,
    backgroundColor: COLORS.backgroundDark,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chipTextActive: {
    color: '#fff',
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
  listContent: {
    paddingBottom: 32,
  },
  bismillah: {
    fontSize: 24,
    lineHeight: 46,
    textAlign: 'center',
    color: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 16,
    writingDirection: 'rtl',
  },
  verseCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  verseCardDark: {
    backgroundColor: COLORS.cardDark,
    borderColor: COLORS.borderDark,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verseBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseBadgeDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  verseBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  verseBadgeTextDark: {
    color: COLORS.gold,
  },
  arabic: {
    fontSize: 26,
    lineHeight: 52,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: COLORS.text,
  },
  translation: {
    fontSize: 15,
    lineHeight: 24,
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
