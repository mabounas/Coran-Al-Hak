import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

import { COLORS } from '../constants/config';
import { getSpeechLocale } from '../constants/speechLocales';
import { useLocale } from '../context/LocaleContext';
import { useDictation, type DictationError } from '../hooks/useDictation';

const MIC_ERROR_KEYS: Record<DictationError, string> = {
  denied: 'search.micDenied',
  unsupported: 'search.micUnavailable',
  failed: 'search.micError',
};

interface Props {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

/** Surah search box, typed or dictated, shared by the listen, read and tafsir lists. */
export function SurahSearchField({ value, onChangeText, placeholder }: Props) {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const speechLocale = getSpeechLocale(language);

  const { listening, error, supported, start, stop } = useDictation({
    locale: speechLocale,
    onResult: (transcript) => {
      // Recognisers like to end a phrase with punctuation; the filter does not.
      onChangeText(transcript.replace(/[.,!?;:]+$/, ''));
    },
  });

  return (
    <View style={styles.wrap}>
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? t('home.searchPlaceholder')}
          placeholderTextColor={COLORS.muted}
          style={[styles.input, dark && styles.inputDark, { textAlign: isRTL ? 'right' : 'left' }]}
        />
        {supported ? (
          <TouchableOpacity
            onPress={listening ? stop : start}
            style={[styles.micButton, listening && styles.micButtonActive]}
            accessibilityLabel={t('search.micStart')}
          >
            <Text style={styles.micGlyph}>{listening ? '■' : '🎤'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {listening ? (
        <Text style={styles.listening}>
          {t('search.listening')} · {speechLocale}
        </Text>
      ) : error ? (
        <Text style={styles.error}>{t(MIC_ERROR_KEYS[error])}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  row: {
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
    width: 42,
    height: 42,
    borderRadius: 21,
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
    fontSize: 17,
    color: '#fff',
  },
  listening: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },
  error: {
    fontSize: 11,
    color: COLORS.danger,
  },
});
