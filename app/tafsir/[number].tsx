import { AmiriQuran_400Regular, useFonts } from '@expo-google-fonts/amiri-quran';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
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
import { COLORS } from '../../src/constants/config';
import { getVerseTranslation } from '../../src/constants/translations';
import { useLocale } from '../../src/context/LocaleContext';
import type { SurahDetail, Verse } from '../../src/types/quran';
import type { Tafsir } from '../../src/types/tafsir';

export default function TafsirSurahScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const params = useLocalSearchParams<{ number: string }>();
  const surahNumber = Number(params.number);

  const [fontsLoaded] = useFonts({ AmiriQuran_400Regular });
  const arabicFont = fontsLoaded ? { fontFamily: 'AmiriQuran_400Regular' } : null;

  const [detail, setDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Verses read in the language of the profile; Arabic profiles keep the
  // mushaf text itself.
  const verseText = (verse: Verse) =>
    getVerseTranslation(verse, language) ?? verse.arabic.trim();
  const verseIsArabic = (verse: Verse) => !getVerseTranslation(verse, language);

  const renderVerse = ({ item }: { item: Verse }) => (
    <TouchableOpacity
      style={[styles.card, dark && styles.cardDark]}
      onPress={() => openVerse(item)}
    >
      <View style={[styles.cardHeader, isRTL && styles.rowRTL]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.ayah}</Text>
        </View>
        <Text style={styles.explainHint}>{t('tafsir.button')}</Text>
      </View>
      <Text
        style={[
          styles.verse,
          dark && styles.textDark,
          verseIsArabic(item) && styles.verseArabic,
          verseIsArabic(item) && arabicFont,
          !verseIsArabic(item) && {
            textAlign: isRTL ? 'right' : 'left',
            writingDirection: isRTL ? 'rtl' : 'ltr',
          },
        ]}
      >
        {verseText(item)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <Stack.Screen options={{ title }} />

      <FlatList
        data={detail.verses}
        keyExtractor={(item) => item.verse_key}
        renderItem={renderVerse}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.headerTitle, dark && styles.textDark]}>
              {detail.surah.name_english} · {detail.surah.name_translation}
            </Text>
            <Text style={[styles.headerHint, dark && styles.mutedDark]}>{t('tafsir.tapHint')}</Text>
          </View>
        }
      />

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

              {tafsirLoading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : tafsirError ? (
                <Text style={styles.errorTitle}>{t('tafsir.error')}</Text>
              ) : tafsir ? (
                <>
                  <Text style={styles.tafsirName}>{tafsir.tafseer_name}</Text>
                  <Text style={[styles.tafsirText, dark && styles.textDark, arabicFont]}>
                    {tafsir.text}
                  </Text>
                </>
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
  header: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerHint: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
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
    gap: 8,
  },
  cardDark: {
    backgroundColor: COLORS.cardDark,
    borderColor: COLORS.borderDark,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  explainHint: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
  },
  verse: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.text,
  },
  verseArabic: {
    fontSize: 22,
    lineHeight: 46,
    textAlign: 'right',
    writingDirection: 'rtl',
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
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
