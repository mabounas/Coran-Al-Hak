import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { COLORS } from '../constants/config';
import { LANGUAGES } from '../constants/languages';
import { RECITERS, type Reciter } from '../constants/reciters';
import { hasTranslation } from '../constants/translations';
import { useLocale } from '../context/LocaleContext';
import type { Surah } from '../types/quran';
import { ReciterPicker } from './ReciterPicker';

// Which text the reading screen shows: the Arabic mushaf or the translation
// matching the language picked in the profile.
export type TextMode = 'ar' | 'translation';

export interface ReadOptions {
  sound: boolean;
  textMode: TextMode;
  reciter: Reciter;
}

interface Props {
  visible: boolean;
  surah: Surah;
  onClose: () => void;
  onConfirm: (options: ReadOptions) => void;
}

export function ReadOptionsModal({ visible, surah, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const translationAvailable = hasTranslation(language);

  const profileLanguage = LANGUAGES.find((lang) => lang.code === language);

  const [sound, setSound] = useState(false);
  // The profile language wins by default; Arabic stays one tap away.
  const [textMode, setTextMode] = useState<TextMode>(translationAvailable ? 'translation' : 'ar');
  const [reciter, setReciter] = useState<Reciter>(RECITERS[0]);
  const [reciterPickerVisible, setReciterPickerVisible] = useState(false);

  const handleConfirm = () => {
    onConfirm({ sound, textMode: translationAvailable ? textMode : 'ar', reciter });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, dark && styles.sheetDark]} onPress={() => {}}>
          <View style={[styles.header, isRTL && styles.rowRTL]}>
            <Text style={[styles.title, dark && styles.textDark]}>{t('read.options')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeButton}>
              <Text style={[styles.closeGlyph, dark && styles.mutedDark]}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.surahName, dark && styles.mutedDark, isRTL && styles.textRTL]}>
            {surah.number}. {surah.name_arabic} · {surah.name_english}
          </Text>

          <View style={[styles.row, isRTL && styles.rowRTL, dark && styles.rowDark]}>
            <View style={styles.rowLabelWrap}>
              <Text style={[styles.rowLabel, dark && styles.textDark, isRTL && styles.textRTL]}>
                {t('read.sound')}
              </Text>
              <Text style={[styles.rowHint, dark && styles.mutedDark, isRTL && styles.textRTL]}>
                {sound ? t('read.soundOn') : t('read.soundOff')}
              </Text>
            </View>
            <Switch
              value={sound}
              onValueChange={setSound}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>

          {sound && (
            <TouchableOpacity
              style={[styles.row, isRTL && styles.rowRTL, dark && styles.rowDark]}
              onPress={() => setReciterPickerVisible(true)}
            >
              <View style={styles.rowLabelWrap}>
                <Text style={[styles.rowLabel, dark && styles.textDark, isRTL && styles.textRTL]}>
                  {t('reciter.title')}
                </Text>
                <Text style={[styles.rowHint, dark && styles.mutedDark, isRTL && styles.textRTL]}>
                  {language === 'ar' ? reciter.nameArabic : reciter.nameTranslation}
                </Text>
              </View>
              <Text style={styles.chevron}>{isRTL ? '‹' : '›'}</Text>
            </TouchableOpacity>
          )}

          <View style={[styles.textModeRow, dark && styles.rowDark]}>
            <Text style={[styles.rowLabel, dark && styles.textDark, isRTL && styles.textRTL]}>
              {t('read.textLanguage')}
            </Text>
            {translationAvailable ? (
              <View style={[styles.segmented, isRTL && styles.rowRTL]}>
                <TouchableOpacity
                  style={[styles.segment, textMode === 'ar' && styles.segmentActive]}
                  onPress={() => setTextMode('ar')}
                >
                  <Text
                    style={[styles.segmentText, textMode === 'ar' && styles.segmentTextActive]}
                  >
                    العربية
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, textMode === 'translation' && styles.segmentActive]}
                  onPress={() => setTextMode('translation')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      textMode === 'translation' && styles.segmentTextActive,
                    ]}
                  >
                    {profileLanguage?.nativeLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.rowHint, dark && styles.mutedDark, isRTL && styles.textRTL]}>
                {t('read.noTranslation')}
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>{t('read.display')}</Text>
          </TouchableOpacity>

          <ReciterPicker
            visible={reciterPickerVisible}
            onClose={() => setReciterPickerVisible(false)}
            onSelect={(selected) => {
              setReciter(selected);
              setReciterPickerVisible(false);
            }}
          />
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
    paddingBottom: 28,
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
    paddingBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  closeGlyph: {
    fontSize: 18,
    color: COLORS.muted,
  },
  surahName: {
    fontSize: 13,
    color: COLORS.muted,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  rowDark: {
    borderTopColor: COLORS.borderDark,
  },
  rowLabelWrap: {
    flex: 1,
    gap: 2,
  },
  textModeRow: {
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  segmented: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  segmentTextActive: {
    color: '#fff',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  rowHint: {
    fontSize: 12,
    color: COLORS.muted,
  },
  textRTL: {
    textAlign: 'right',
  },
  chevron: {
    fontSize: 22,
    color: COLORS.muted,
  },
  confirmButton: {
    marginTop: 18,
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
