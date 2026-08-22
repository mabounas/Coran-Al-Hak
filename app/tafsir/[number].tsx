import { AmiriQuran_400Regular, useFonts } from '@expo-google-fonts/amiri-quran';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { fetchSurahDetail } from '../../src/api/quran';
import { fetchTafsir } from '../../src/api/tafsir';
import { MushafFrame } from '../../src/components/MushafFrame';
import type { TextMode } from '../../src/components/ReadOptionsModal';
import { ayahMarker, toArabicNumerals } from '../../src/constants/arabic';
import { COLORS } from '../../src/constants/config';
import { LANGUAGES } from '../../src/constants/languages';
import { getVerseTranslation, hasTranslation } from '../../src/constants/translations';
import { useLocale } from '../../src/context/LocaleContext';
import type { SurahDetail, Verse } from '../../src/types/quran';
import type { Tafsir } from '../../src/types/tafsir';

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

export default function TafsirSurahScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const params = useLocalSearchParams<{ number: string }>();
  const surahNumber = Number(params.number);

  const translationAvailable = hasTranslation(language);
  const profileLanguage = LANGUAGES.find((lang) => lang.code === language);

  const [fontsLoaded] = useFonts({ AmiriQuran_400Regular });
  const arabicFont = fontsLoaded ? { fontFamily: 'AmiriQuran_400Regular' } : null;

  const [detail, setDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [textMode, setTextMode] = useState<TextMode>(translationAvailable ? 'translation' : 'ar');

  const [selected, setSelected] = useState<Verse | null>(null);
  const [tafsir, setTafsir] = useState<Tafsir | null>(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirError, setTafsirError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDetail(await fetchSurahDetail(surahNumber));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [surahNumber]);

  useEffect(() => {
    if (Number.isFinite(surahNumber)) load();
  }, [surahNumber, load]);

  const openVerse = useCallback(
    async (verse: Verse) => {
      setSelected(verse);
      setTafsir(null);
      setTafsirError(false);
      setTafsirLoading(true);
      try {
        setTafsir(await fetchTafsir(surahNumber, verse.ayah));
      } catch {
        setTafsirError(true);
      } finally {
        setTafsirLoading(false);
      }
    },
    [surahNumber]
  );

  const title = detail
    ? `${detail.surah.number}. ${detail.surah.name_arabic}`
    : t('landing.tafsir');

  if (loading) {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Stack.Screen options={{ title }} />
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={[styles.muted, dark && styles.mutedDark]}>{t('read.loading')}</Text>
      </View>
    );
  }

  if (error || !detail) {
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

  const selectedTranslation = selected ? getVerseTranslation(selected, language) : undefined;

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
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MushafFrame dark={dark}>
          <View style={styles.cartouche}>
            {textMode === 'ar' ? (
              <Text style={[styles.cartoucheText, arabicFont]}>
                سورة {detail.surah.name_arabic} {toArabicNumerals(detail.surah.number)}
              </Text>
            ) : (
              <Text style={styles.cartoucheTextLatin}>
                {detail.surah.number}. {detail.surah.name_english} · {detail.surah.name_translation}
              </Text>
            )}
          </View>

          {detail.surah.bismillah_pre && textMode === 'ar' ? (
            <Text style={[styles.bismillah, arabicFont]}>{BISMILLAH}</Text>
          ) : null}

          {textMode === 'ar' ? (
            <Text style={[styles.mushaf, dark && styles.textDark, arabicFont]}>
              {detail.verses.map((verse) => (
                <Text
                  key={verse.verse_key}
                  onPress={() => openVerse(verse)}
                  style={selected?.verse_key === verse.verse_key ? styles.verseSelected : undefined}
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
                  onPress={() => openVerse(verse)}
                  style={selected?.verse_key === verse.verse_key ? styles.verseSelected : undefined}
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
              <Text style={[styles.cartoucheFooterText, arabicFont]}>
                وآياتها {toArabicNumerals(detail.total_verses)}
              </Text>
            ) : (
              <Text style={styles.cartoucheFooterTextLatin}>
                {t('home.verses', { count: detail.total_verses })}
              </Text>
            )}
          </View>
        </MushafFrame>

        <Text style={[styles.hint, dark && styles.mutedDark]}>{t('tafsir.tapHint')}</Text>
      </ScrollView>

      <Modal
        visible={selected !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          <Pressable style={[styles.sheet, dark && styles.sheetDark]} onPress={() => {}}>
            <View style={[styles.sheetHeader, isRTL && styles.rowRTL]}>
              <Text style={styles.sheetTitle}>
                {t('read.verse', { number: selected?.ayah ?? 0 })}
              </Text>
              <TouchableOpacity onPress={() => setSelected(null)} hitSlop={10}>
                <Text style={[styles.closeGlyph, dark && styles.mutedDark]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.sheetBody}>
              {selected ? (
                <Text style={[styles.sheetArabic, dark && styles.textDark, arabicFont]}>
                  {selected.arabic.trim()}
                </Text>
              ) : null}

              <Text
                style={[
                  styles.sheetTranslation,
                  dark && styles.textDark,
                  { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' },
                ]}
              >
                {selectedTranslation ?? t('read.noTranslation')}
              </Text>

              {tafsirLoading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : tafsirError ? (
                <Text style={styles.errorTitle}>{t('tafsir.error')}</Text>
              ) : tafsir ? (
                <View style={styles.tafsirBlock}>
                  <Text style={styles.tafsirName}>{tafsir.tafseer_name}</Text>
                  <Text style={[styles.tafsirText, dark && styles.textDark, arabicFont]}>
                    {tafsir.text}
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
    fontSize: 14,
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
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
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
  cartoucheTextLatin: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textAlign: 'center',
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
  cartoucheFooterTextLatin: {
    fontSize: 12,
    color: COLORS.primaryDark,
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  sheetDark: {
    backgroundColor: COLORS.cardDark,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  closeGlyph: {
    fontSize: 18,
    color: COLORS.muted,
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 12,
  },
  sheetArabic: {
    fontSize: 22,
    lineHeight: 46,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: COLORS.text,
  },
  sheetTranslation: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.text,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  tafsirBlock: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    gap: 6,
  },
  tafsirName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
    textAlign: 'right',
  },
  tafsirText: {
    fontSize: 17,
    lineHeight: 34,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: COLORS.text,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
