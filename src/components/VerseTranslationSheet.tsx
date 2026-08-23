import React from 'react';
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
import { getVerseTranslation } from '../constants/translations';
import { useLocale } from '../context/LocaleContext';
import type { Verse } from '../types/quran';

interface Props {
  verse: Verse | null;
  arabicFont?: string;
  onClose: () => void;
}

export function VerseTranslationSheet({ verse, arabicFont, onClose }: Props) {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  if (!verse) return null;

  const translated = getVerseTranslation(verse, language);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, dark && styles.sheetDark]} onPress={() => {}}>
          <View style={[styles.header, isRTL && styles.headerRTL]}>
            <Text style={[styles.title, dark && styles.textDark]}>
              {t('read.verse', { number: verse.ayah })}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeButton}>
              <Text style={[styles.closeGlyph, dark && styles.mutedDark]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            <Text
              style={[
                styles.arabic,
                dark && styles.textDark,
                arabicFont ? { fontFamily: arabicFont } : null,
              ]}
            >
              {verse.arabic.trim()}
            </Text>

            {verse.transliteration ? (
              <Text style={[styles.transliteration, dark && styles.mutedDark]}>
                {verse.transliteration}
              </Text>
            ) : null}

            {translated ? (
              <Text
                style={[
                  styles.translation,
                  dark && styles.textDark,
                  { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' },
                ]}
              >
                {translated}
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
  transliteration: {
    fontSize: 13,
    fontStyle: 'italic',
    color: COLORS.muted,
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
