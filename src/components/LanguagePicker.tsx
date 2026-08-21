import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { COLORS } from '../constants/config';
import { LANGUAGES } from '../constants/languages';
import { useLocale } from '../context/LocaleContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function LanguagePicker({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { language, isRTL, setLanguage } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const handleSelect = (code: string) => {
    setLanguage(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, dark && styles.sheetDark]} onPress={() => {}}>
          <View style={[styles.header, isRTL && styles.headerRTL]}>
            <Text style={[styles.title, dark && styles.textDark]}>{t('settings.language')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeButton}>
              <Text style={[styles.closeGlyph, dark && styles.mutedDark]}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={LANGUAGES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const selected = item.code === language;
              return (
                <TouchableOpacity
                  style={[
                    styles.row,
                    isRTL && styles.rowRTL,
                    dark && styles.rowDark,
                    selected && styles.rowSelected,
                  ]}
                  onPress={() => handleSelect(item.code)}
                >
                  <View style={styles.labels}>
                    <Text style={[styles.native, dark && styles.textDark]}>{item.nativeLabel}</Text>
                    <Text style={[styles.english, dark && styles.mutedDark]}>{item.englishLabel}</Text>
                  </View>
                  {selected && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              );
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
    paddingBottom: 10,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  rowSelected: {
    backgroundColor: COLORS.background,
  },
  labels: {
    gap: 2,
  },
  native: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  english: {
    fontSize: 12,
    color: COLORS.muted,
  },
  check: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
