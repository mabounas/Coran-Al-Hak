import { AmiriQuran_400Regular, useFonts } from '@expo-google-fonts/amiri-quran';
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
import { SearchResultCard, type SearchResultItem } from '../src/components/SearchResultCard';
import { containsArabic } from '../src/constants/arabic';
import { COLORS } from '../src/constants/config';
import { getSpeechLocale } from '../src/constants/speechLocales';
import { getTranslationKey } from '../src/constants/translations';
import { useLocale } from '../src/context/LocaleContext';
import { useSurahs } from '../src/context/SurahsContext';
import { searchLocal } from '../src/data/localSearch';
import { useDictation, type DictationError } from '../src/hooks/useDictation';

const MIC_ERROR_KEYS: Record<DictationError, string> = {
  denied: 'search.micDenied',
  unsupported: 'search.micUnavailable',
  failed: 'search.micError',
};

interface Results {
  query: string;
  total: number;
  capped: boolean;
  items: SearchResultItem[];
}

export default function SearchScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const [fontsLoaded] = useFonts({ AmiriQuran_400Regular });
  const arabicFont = fontsLoaded ? 'AmiriQuran_400Regular' : undefined;

  const { surahs } = useSurahs();
  const [query, setQuery] = useState('');
  const [data, setData] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translationKey = getTranslationKey(language);
  const speechLocale = getSpeechLocale(language);

  const runSearch = useCallback(
    async (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      setLoading(true);
      setError(null);
      try {
        if (containsArabic(trimmed)) {
          // The API compares the vocalised text literally, so an Arabic word
          // written or dictated without tashkeel never matches there. We match
          // the mushaf text locally on folded letters instead.
          const matches = searchLocal(trimmed);
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
                `${match.surahNumber}`,
              arabic: match.arabic,
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
              // The endpoint answers in English whatever we asked for; the card
              // fetches the profile language itself when it differs.
              translation:
                translationKey === 'sahih_international' ? item.translation : undefined,
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

  // Dictation feeds the very same search as the keyboard does.
  const {
    listening,
    error: micError,
    supported: micSupported,
    start: startListening,
    stop: stopListening,
  } = useDictation({
    locale: speechLocale,
    onResult: (transcript, isFinal) => {
      setQuery(transcript);
      if (!isFinal) return;
      runSearch(transcript);
      // The searched word stays visible in the results header, so the field is
      // emptied and ready for the next dictation.
      setQuery('');
    },
  });

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
          {micSupported ? (
            <TouchableOpacity
              onPress={listening ? stopListening : startListening}
              style={[styles.micButton, listening && styles.micButtonActive]}
              accessibilityLabel={t('search.micStart')}
            >
              <Text style={styles.micGlyph}>{listening ? '■' : '🎤'}</Text>
            </TouchableOpacity>
          ) : null}
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
          renderItem={({ item }) => (
            <SearchResultCard item={item} translationKey={translationKey} arabicFont={arabicFont} />
          )}
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
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
