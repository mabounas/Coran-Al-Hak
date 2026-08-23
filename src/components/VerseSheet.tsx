import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { COLORS } from '../constants/config';
import { getTranslationKey } from '../constants/translations';
import { useLocale } from '../context/LocaleContext';
import { getSurahTranslations } from '../data/translationCache';
import { getVerseArabic } from '../data/verses';

interface Props {
  surahNumber?: number;
  ayah?: number;
  language: string;
  arabicFont?: string;
  onClose: () => void;
}

/**
 * Shows one verse picked from the mushaf page: the Arabic comes from the
 * bundled text, the translation from the cached surah request.
 */
export function VerseSheet({ surahNumber, ayah, language, arabicFont, onClose }: Props) {
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const [translation, setTranslation] = useState<string | undefined>(undefined);

  const translationKey = getTranslationKey(language);

  useEffect(() => {
    setTranslation(undefined);
    if (!surahNumber || !ayah || !translationKey) return;

    let active = true;
    getSurahTranslations(surahNumber, translationKey)
      .then((map) => {
        if (active) setTranslation(map.get(ayah));
      })
      .catch(() => {
        // The verse still reads fine without its translation.
      });

    return () => {
      active = false;
    };
  }, [surahNumber, ayah, translationKey]);

  if (!surahNumber || !ayah) return null;

  const arabic = getVerseArabic(surahNumber, ayah);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, dark && styles.sheetDark]} onPress={() => {}}>
          <View style={[styles.header, isRTL && styles.headerRTL]}>
            <Text style={[styles.title, dark && styles.textDark]}>
              {surahNumber}:{ayah}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeButton}>
              <Text style={[styles.closeGlyph, dark && styles.mutedDark]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            {arabic ? (
              <Text
                style={[
                  styles.arabic,
                  dark && styles.textDark,
                  arabicFont ? { fontFamily: arabicFont } : null,
                ]}
              >
                {arabic}
              </Text>
            ) : null}

            {translationKey ? (
              <Text
                style={[
                  styles.translation,
                  dark && styles.textDark,
                  { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' },
                ]}
              >
                {translation ?? '…'}
              </Text>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  sheetDark: {
    backgroundColor: COLORS.cardDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  closeButton: {
    padding: 4,
  },
  closeGlyph: {
    fontSize: 18,
    color: COLORS.muted,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },
  arabic: {
    fontSize: 24,
    lineHeight: 48,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: COLORS.text,
  },
  translation: {
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.text,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
