import { AmiriQuran_400Regular, useFonts } from '@expo-google-fonts/amiri-quran';
import { useRouter } from 'expo-router';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
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
import { COLORS } from '../src/constants/config';
import { getSpeechLocale } from '../src/constants/speechLocales';
import { useLocale } from '../src/context/LocaleContext';
import type { SearchData, SearchResult } from '../src/types/search';

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

  const [query, setQuery] = useState('');
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const runSearch = useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      setData(await searchQuran(trimmed));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Dictation feeds the very same search as the keyboard does.
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results?.[0]?.transcript ?? '';
    if (!transcript) return;
    setQuery(transcript);
    if (event.isFinal) {
      setListening(false);
      runSearch(transcript);
    }
  });

  useSpeechRecognitionEvent('end', () => setListening(false));

  useSpeechRecognitionEvent('error', () => {
    setListening(false);
    setMicError(t('search.micError'));
  });

  const startListening = useCallback(async () => {
    setMicError(null);
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setMicError(t('search.micDenied'));
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang: getSpeechLocale(language),
        interimResults: true,
        continuous: false,
      });
      setListening(true);
    } catch {
      setMicError(t('search.micUnavailable'));
    }
  }, [language, t]);

  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // The recognizer was already stopped.
    }
    setListening(false);
  }, []);

  const renderResult = ({ item }: { item: SearchResult }) => (
    <View style={[styles.card, dark && styles.cardDark]}>
      <View style={[styles.cardHeader, isRTL && styles.rowRTL]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.surah_number}:{item.ayah}
          </Text>
        </View>
        <Text style={[styles.surahName, dark && styles.textDark]} numberOfLines={1}>
          {item.surah_name}
        </Text>
        <View style={styles.matchTag}>
          <Text style={styles.matchTagText}>{MATCH_LABELS[item.matched_in] ?? item.matched_in}</Text>
        </View>
      </View>

      <Text style={[styles.arabic, dark && styles.textDark, arabicStyle]}>{item.arabic}</Text>
      <Text style={[styles.translation, dark && styles.mutedDark]}>{item.translation}</Text>

      <TouchableOpacity
        style={styles.openButton}
        onPress={() =>
          router.push({
            pathname: '/lecture/[number]',
            params: { number: String(item.surah_number), sound: '0' },
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
          <Text style={styles.listening}>{t('search.listening')}</Text>
        ) : micError ? (
          <Text style={styles.micErrorText}>{micError}</Text>
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
          data={data.results}
          keyExtractor={(item) => item.verse_key}
          renderItem={renderResult}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsCount, dark && styles.textDark]}>
                {t('search.resultsCount', { count: data.results_count, query: data.query })}
              </Text>
              {data.results_count >= SEARCH_LIMIT ? (
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
