import { AmiriQuran_400Regular, useFonts } from '@expo-google-fonts/amiri-quran';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { fetchMushafPage } from '../../src/api/quran';
import { MushafFrame } from '../../src/components/MushafFrame';
import { VerseSheet } from '../../src/components/VerseSheet';
import { toArabicNumerals } from '../../src/constants/arabic';
import { COLORS } from '../../src/constants/config';
import { useLocale } from '../../src/context/LocaleContext';
import { useSurahs } from '../../src/context/SurahsContext';
import type { MushafPage, MushafWord } from '../../src/types/quran';

const TOTAL_PAGES = 604;
const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
const PAGE_MAX_WIDTH = 560;

interface Line {
  number: number;
  words: MushafWord[];
}

/**
 * The API leaves the lines that carry a surah banner (and its basmalah) empty,
 * so a run of blank lines before the first verse of a surah is exactly the
 * space the printed mushaf reserves for its heading.
 */
function buildLines(page: MushafPage): Line[] {
  const byLine = new Map<number, MushafWord[]>();
  page.words.forEach((word) => {
    const line = byLine.get(word.line_number);
    if (line) line.push(word);
    else byLine.set(word.line_number, [word]);
  });

  const lines: Line[] = [];
  for (let number = 1; number <= (page.lines_per_page || 15); number += 1) {
    lines.push({ number, words: byLine.get(number) ?? [] });
  }
  return lines;
}

function startsSurah(line: Line): number | null {
  const first = line.words[0];
  if (!first) return null;
  return first.ayah_number === 1 && first.position === 1 ? first.surah_number : null;
}

export default function MushafPageScreen() {
  const { t } = useTranslation();
  const { language } = useLocale();
  const router = useRouter();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const params = useLocalSearchParams<{ page: string }>();

  const pageNumber = Math.min(Math.max(Number(params.page) || 1, 1), TOTAL_PAGES);

  const [fontsLoaded] = useFonts({ AmiriQuran_400Regular });
  const arabicFont = fontsLoaded ? 'AmiriQuran_400Regular' : undefined;

  const { surahs } = useSurahs();
  const [page, setPage] = useState<MushafPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<{ surahNumber: number; ayah: number } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPage(await fetchMushafPage(pageNumber));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPage(null);
    } finally {
      setLoading(false);
    }
  }, [pageNumber]);

  useEffect(() => {
    load();
  }, [load]);

  const lines = useMemo(() => (page ? buildLines(page) : []), [page]);

  // Mushaf lines run edge to edge, so the type shrinks with the page width.
  const fontSize = useMemo(() => {
    const usable = Math.min(width || PAGE_MAX_WIDTH, PAGE_MAX_WIDTH);
    return Math.max(13, Math.min(24, usable / 15.5));
  }, [width]);

  const surahName = useCallback(
    (number: number) =>
      surahs.find((s) => s.number === number)?.name_arabic ?? `${toArabicNumerals(number)}`,
    [surahs]
  );

  const goTo = (target: number) => {
    if (target < 1 || target > TOTAL_PAGES) return;
    router.replace({ pathname: '/mushaf/[page]', params: { page: String(target) } } as never);
  };

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const title = t('mushaf.page', { page: pageNumber, total: TOTAL_PAGES });

  if (loading) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Stack.Screen options={{ title }} />
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (error || !page) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Stack.Screen options={{ title }} />
        <Text style={styles.errorTitle}>{t('read.error')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>{t('home.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <Stack.Screen options={{ title }} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.pageWrap} onLayout={onLayout}>
          <MushafFrame dark={dark} style={styles.frame}>
            {lines.map((line) => {
              const surahStart = startsSurah(line);

              if (line.words.length === 0) {
                return <View key={line.number} style={[styles.line, { height: fontSize * 2 }]} />;
              }

              return (
                <View key={line.number}>
                  {surahStart ? (
                    <>
                      <View style={styles.banner}>
                        <Text style={[styles.bannerText, arabicFont ? { fontFamily: arabicFont } : null]}>
                          سورة {surahName(surahStart)}
                        </Text>
                      </View>
                      {surahStart !== 1 && surahStart !== 9 ? (
                        <Text
                          style={[
                            styles.basmallah,
                            { fontSize: fontSize * 0.95 },
                            arabicFont ? { fontFamily: arabicFont } : null,
                          ]}
                        >
                          {BISMILLAH}
                        </Text>
                      ) : null}
                    </>
                  ) : null}

                  <View style={[styles.line, { minHeight: fontSize * 2.2 }]}>
                    {line.words.map((word) => (
                      <Text
                        key={`${word.verse_key}-${word.position}`}
                        onPress={() =>
                          setSelected({ surahNumber: word.surah_number, ayah: word.ayah_number })
                        }
                        style={[
                          word.char_type_name === 'end' ? styles.endMark : styles.word,
                          { fontSize },
                          arabicFont ? { fontFamily: arabicFont } : null,
                          dark && word.char_type_name !== 'end' && styles.textDark,
                        ]}
                      >
                        {word.text_uthmani}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })}

            <View style={styles.pageFooter}>
              <Text style={[styles.pageFooterText, arabicFont ? { fontFamily: arabicFont } : null]}>
                {toArabicNumerals(page.page)}
              </Text>
            </View>
          </MushafFrame>
        </View>

        <Text style={[styles.hint, dark && styles.mutedDark]}>{t('mushaf.tapHint')}</Text>
      </ScrollView>

      <View style={[styles.nav, dark && styles.navDark]}>
        <TouchableOpacity
          style={[styles.navButton, pageNumber <= 1 && styles.navButtonDisabled]}
          disabled={pageNumber <= 1}
          onPress={() => goTo(pageNumber - 1)}
        >
          <Text style={styles.navText}>{t('mushaf.previous')}</Text>
        </TouchableOpacity>
        <Text style={[styles.navPage, dark && styles.textDark]}>
          {pageNumber} / {TOTAL_PAGES}
        </Text>
        <TouchableOpacity
          style={[styles.navButton, pageNumber >= TOTAL_PAGES && styles.navButtonDisabled]}
          disabled={pageNumber >= TOTAL_PAGES}
          onPress={() => goTo(pageNumber + 1)}
        >
          <Text style={styles.navText}>{t('mushaf.next')}</Text>
        </TouchableOpacity>
      </View>

      <VerseSheet
        surahNumber={selected?.surahNumber}
        ayah={selected?.ayah}
        language={language}
        arabicFont={arabicFont}
        onClose={() => setSelected(null)}
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
  scroll: {
    paddingBottom: 16,
    alignItems: 'center',
  },
  pageWrap: {
    width: '100%',
    maxWidth: PAGE_MAX_WIDTH,
  },
  frame: {
    marginHorizontal: 10,
  },
  line: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  word: {
    color: COLORS.text,
    textAlign: 'center',
  },
  endMark: {
    color: COLORS.gold,
    textAlign: 'center',
  },
  banner: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 4,
    paddingVertical: 4,
    marginVertical: 6,
    marginHorizontal: 18,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 16,
    color: COLORS.primaryDark,
    writingDirection: 'rtl',
  },
  basmallah: {
    textAlign: 'center',
    color: COLORS.primaryDark,
    writingDirection: 'rtl',
    paddingBottom: 4,
  },
  pageFooter: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gold,
    marginTop: 10,
    paddingTop: 6,
  },
  pageFooterText: {
    fontSize: 14,
    color: COLORS.primaryDark,
  },
  hint: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    paddingTop: 6,
    paddingHorizontal: 20,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navDark: {
    backgroundColor: COLORS.cardDark,
    borderTopColor: COLORS.borderDark,
  },
  navButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  navText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  navPage: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
