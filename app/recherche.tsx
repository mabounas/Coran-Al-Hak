import { AmiriQuran_400Regular, useFonts } from '@expo-google-fonts/amiri-quran';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { SEARCH_LIMIT, searchQuran } from '../src/api/search';
import { containsArabic } from '../src/constants/arabic';
import { COLORS } from '../src/constants/config';
import { getSpeechLocale } from '../src/constants/speechLocales';
import { getTranslationKey } from '../src/constants/translations';
import { useLocale } from '../src/context/LocaleContext';
import { useSurahs } from '../src/context/SurahsContext';
import { collectForms, searchLocal } from '../src/data/localSearch';
import { useDictation, type DictationError } from '../src/hooks/useDictation';

// How many vocalised spellings of an Arabic word we ask the API to translate.
const MAX_FORMS = 6;

interface ResultItem {
  verseKey: string;
  surahNumber: number;
  ayah: number;
  surahName: string;
  arabic: string;
  translation?: string;
  matchedIn: string;
}

interface Results {
  query: string;
  total: number;
  capped: boolean;
  items: ResultItem[];
}

const MIC_ERROR_KEYS: Record<DictationError, string> = {
  denied: 'search.micDenied',
  unsupported: 'search.micUnavailable',
  failed: 'search.micError',
};

const MATCH_LABELS: Record<string, string> = {
  arabic: 'العربية',
  transliteration: 'Translit.',
  sahih_international: 'EN',
};

export default function SearchScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const router = useRouter();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const [fontsLoaded] = useFonts({ AmiriQuran_400Regular });
  const arabicStyle = fontsLoaded ? { fontFamily: 'AmiriQuran_400Regular' } : null;

  const { surahs } = useSurahs();
  const [query, setQuery] = useState('');
  const [data, setData] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translationKey = getTranslationKey(language);

  const runSearch = useCallback(
    async (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      setLoading(true);
      setError(null);
      try {
        if (containsArabic(trimmed)) {
          // The API matches the vocalised text literally, so an Arabic word
          // typed or dictated without tashkeel finds nothing there. We match
          // locally, then ask the API to translate the spellings we found.
          const matches = searchLocal(trimmed);
          const forms = collectForms(matches, MAX_FORMS);
          const translations = new Map<string, string>();

          const responses = await Promise.allSettled(
            forms.map((form) => searchQuran(form, translationKey))
          );
          responses.forEach((response) => {
            if (response.status !== 'fulfilled') return;
            response.value.results.forEach((result) => {
              translations.set(result.verse_key, result.translation);
            });
          });

          setData({
            query: trimmed,
            total: matches.length,
            capped: false,
            items: matches.map((match) => ({
              verseKey: match.verseKey,
              surahNumber: match.surahNumber,
              ayah: match.ayah,
              surahName:
                surahs.find((s) => s.number === match.surahNumber)?.name_english ??
                `Surah ${match.surahNumber}`,
              arabic: match.arabic,
              translation: translations.get(match.verseKey),
              matchedIn: 'arabic',
            })),
          });
        } else {
          const result = await searchQuran(trimmed, translationKey);
          setData({
            query: trimmed,
            total: result.results_count,
            capped: result.results_count >= SEARCH_LIMIT,
            items: result.results.map((item) => ({
              verseKey: item.verse_key,
              surahNumber: item.surah_number,
              ayah: item.ayah,
              surahName: item.surah_name,
              arabic: item.arabic,
              translation: item.translation,
              matchedIn: item.matched_in,
            })),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [surahs, translationKey]
  );

  const speechLocale = getSpeechLocale(language);

  // Dictation feeds the very same search as the keyboard does.
  const { listening, error: micError, start: startListening, stop: stopListening } = useDictation({
    locale: speechLocale,
    onResult: (transcript, isFinal) => {
      setQuery(transcript);
      if (isFinal) runSearch(transcript);
    },
  });

  const renderResult = ({ item }: { item: ResultItem }) => (
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
          <Text style={styles.matchTagText}>{MATCH_LABELS[item.matchedIn] ?? item.matchedIn}</Text>
        </View>
      </View>

      <Text style={[styles.arabic, dark && styles.textDark, arabicStyle]}>{item.arabic}</Text>
      {item.translation ? (
        <Text style={[styles.translation, dark && styles.mutedDark]}>{item.translation}</Text>
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

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <View style={styles.searchWrap}>
        <View style={[styles.searchRow, isRTL && styles.rowRTL]}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => runSearch(query)}
            placeholder={t('search.placeholder')}
            placeholderTextColor={COLORS.muted}
            returnKeyType="search"
            style={[
              styles.input,
              dark && styles.inputDark,
              { textAlign: isRTL ? 'right' : 'left' },
            ]}
          />
          <TouchableOpacity
            onPress={listening ? stopListening : startListening}
            style={[styles.micButton, listening && styles.micButtonActive]}
            accessibilityLabel={t('search.micStart')}
          >
            <Text style={styles.micGlyph}>{listening ? '■' : '🎤'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => runSearch(query)} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>🔎</Text>
          </TouchableOpacity>
        </View>

        {listening ? (
          <Text style={styles.listening}>
            {t('search.listening')} · {speechLocale}
          </Text>
        ) : micError ? (
          <Text style={styles.micErrorText}>{t(MIC_ERROR_KEYS[micError])}</Text>
        ) : (
          <Text style={[styles.hint, dark && styles.mutedDark]}>{t('search.hint')}</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={[styles.loadingText, dark && styles.mutedDark]}>{t('search.loading')}</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>{t('search.error')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => runSearch(query)}>
            <Text style={styles.retryText}>{t('home.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : data ? (
        <FlatList
          data={data.items}
          keyExtractor={(item) => item.verseKey}
          renderItem={renderResult}
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsCount, dark && styles.textDark]}>
                {t('search.resultsCount', { count: data.total, query: data.query })}
              </Text>
              {data.capped ? (
                <Text style={[styles.capNotice, dark && styles.mutedDark]}>
                  {t('search.limitNotice', { limit: SEARCH_LIMIT })}
                </Text>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <Text style={[styles.empty, dark && styles.mutedDark]}>
              {t('search.noResults', { query: data.query })}
            </Text>
          }
        />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.introGlyph}>🔎</Text>
          <Text style={[styles.intro, dark && styles.mutedDark]}>{t('search.intro')}</Text>
        </View>
      )}
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
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  inputDark: {
    backgroundColor: COLORS.cardDark,
    borderColor: COLORS.borderDark,
    color: COLORS.textDark,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  micGlyph: {
    fontSize: 18,
    color: '#fff',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  hint: {
    fontSize: 12,
    color: COLORS.muted,
  },
  listening: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
  micErrorText: {
    fontSize: 12,
    color: COLORS.danger,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  introGlyph: {
    fontSize: 34,
  },
  intro: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
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
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 2,
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  capNotice: {
    fontSize: 11,
    color: COLORS.muted,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.muted,
    paddingHorizontal: 24,
    paddingTop: 20,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
