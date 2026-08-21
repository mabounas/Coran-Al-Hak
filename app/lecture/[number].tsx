import { AmiriQuran_400Regular, useFonts } from '@expo-google-fonts/amiri-quran';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { fetchSurahDetail } from '../../src/api/quran';
import { MushafFrame } from '../../src/components/MushafFrame';
import type { TextMode } from '../../src/components/ReadOptionsModal';
import { VerseTranslationSheet } from '../../src/components/VerseTranslationSheet';
import { ayahMarker, toArabicNumerals } from '../../src/constants/arabic';
import { COLORS } from '../../src/constants/config';
import { LANGUAGES } from '../../src/constants/languages';
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
  const router = useRouter();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const params = useLocalSearchParams<{
    number: string;
    sound?: string;
    mode?: string;
    reciter?: string;
  }>();

  const surahNumber = Number(params.number);
  const translationAvailable = hasTranslation(language);
  const profileLanguage = LANGUAGES.find((lang) => lang.code === language);

  const [fontsLoaded] = useFonts({ AmiriQuran_400Regular });
  const arabicFont = fontsLoaded ? 'AmiriQuran_400Regular' : undefined;

  const { surahs } = useSurahs();
  const { currentSurah, isPlaying, isBuffering, playSurah, togglePlayPause } =
    useAudioPlayerContext();

  const [detail, setDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [textMode, setTextMode] = useState<TextMode>(() => {
    if (!translationAvailable) return 'ar';
    return params.mode === 'ar' ? 'ar' : 'translation';
  });
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
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

  const mushafPage = useMemo(
    () => surahs.find((s) => s.number === surahNumber)?.pages?.[0],
    [surahs, surahNumber]
  );

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

  // The sheet always carries both sides, so a tap is useful in either mode.
  const handleVersePress = useCallback((verse: Verse) => setSelectedVerse(verse), []);

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

  const arabicStyle = arabicFont ? { fontFamily: arabicFont } : null;

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
          onPress={() => setTextMode((mode) => (mode === 'ar' ? 'translation' : 'ar'))}
          disabled={!translationAvailable}
          style={[styles.chip, dark && styles.chipDark, !translationAvailable && styles.chipDisabled]}
          accessibilityLabel={t('read.textLanguage')}
        >
          <Text style={styles.chipText}>
            {textMode === 'ar' ? profileLanguage?.nativeLabel : 'العربية'}
          </Text>
        </TouchableOpacity>

        {textMode === 'ar' && mushafPage ? (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/mushaf/[page]',
                params: { page: String(mushafPage) },
              } as never)
            }
            style={[styles.chip, dark && styles.chipDark]}
            accessibilityLabel={t('mushaf.open')}
          >
            <Text style={styles.chipText}>📖</Text>
          </TouchableOpacity>
        ) : null}

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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MushafFrame dark={dark}>
          <View style={styles.cartouche}>
            {textMode === 'ar' ? (
              <Text style={[styles.cartoucheText, arabicStyle]}>
                سورة {detail.surah.name_arabic} {toArabicNumerals(detail.surah.number)}
              </Text>
            ) : (
              <Text style={styles.cartoucheTextLatin}>
                {detail.surah.number}. {detail.surah.name_english} · {detail.surah.name_translation}
              </Text>
            )}
          </View>

          {detail.surah.bismillah_pre && textMode === 'ar' ? (
            <Text style={[styles.bismillah, arabicStyle]}>{BISMILLAH}</Text>
          ) : null}

          {textMode === 'ar' ? (
            <Text style={[styles.mushaf, dark && styles.textDark, arabicStyle]}>
              {detail.verses.map((verse) => (
                <Text
                  key={verse.verse_key}
                  onPress={() => handleVersePress(verse)}
                  style={
                    selectedVerse?.verse_key === verse.verse_key ? styles.verseSelected : undefined
                  }
                >
                  {verse.arabic.trim()}
                  <Text style={styles.marker}> {ayahMarker(verse.ayah)} </Text>
                </Text>
              ))}
            </Text>
          ) : (
            <Text
              style={[
                styles.translated,
                dark && styles.textDark,
                { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' },
              ]}
            >
              {detail.verses.map((verse) => (
                <Text
                  key={verse.verse_key}
                  onPress={() => handleVersePress(verse)}
                  style={
                    selectedVerse?.verse_key === verse.verse_key ? styles.verseSelected : undefined
                  }
                >
                  <Text style={styles.markerLatin}>{verse.ayah}. </Text>
                  {getVerseTranslation(verse, language) ?? verse.arabic.trim()}
                  {'  '}
                </Text>
              ))}
            </Text>
          )}

          <View style={styles.cartoucheFooter}>
            {textMode === 'ar' ? (
              <Text style={[styles.cartoucheFooterText, arabicStyle]}>
                وآياتها {toArabicNumerals(detail.total_verses)}
              </Text>
            ) : (
              <Text style={styles.cartoucheFooterTextLatin}>
                {t('home.verses', { count: detail.total_verses })}
              </Text>
            )}
          </View>
        </MushafFrame>

        <Text style={[styles.hint, dark && styles.mutedDark]}>{t('read.tapHint')}</Text>
      </ScrollView>

      <VerseTranslationSheet
        verse={selectedVerse}
        arabicFont={arabicFont}
        onClose={() => setSelectedVerse(null)}
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
  scrollContent: {
    paddingBottom: 32,
  },
  cartouche: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 26,
    marginBottom: 14,
    alignItems: 'center',
  },
  cartoucheText: {
    fontSize: 20,
    lineHeight: 40,
    color: COLORS.primaryDark,
    writingDirection: 'rtl',
  },
  cartoucheFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gold,
    marginTop: 14,
    marginHorizontal: 26,
    paddingTop: 8,
    alignItems: 'center',
  },
  cartoucheFooterText: {
    fontSize: 16,
    lineHeight: 34,
    color: COLORS.primaryDark,
    writingDirection: 'rtl',
  },
  bismillah: {
    fontSize: 22,
    lineHeight: 52,
    textAlign: 'center',
    color: COLORS.primaryDark,
    paddingBottom: 10,
    writingDirection: 'rtl',
  },
  mushaf: {
    fontSize: 24,
    lineHeight: 62,
    textAlign: 'justify',
    writingDirection: 'rtl',
    color: COLORS.text,
  },
  marker: {
    color: COLORS.gold,
    fontSize: 22,
  },
  translated: {
    fontSize: 17,
    lineHeight: 32,
    color: COLORS.text,
  },
  markerLatin: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  cartoucheTextLatin: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  cartoucheFooterTextLatin: {
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  verseSelected: {
    backgroundColor: 'rgba(201,162,75,0.22)',
  },
  hint: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
