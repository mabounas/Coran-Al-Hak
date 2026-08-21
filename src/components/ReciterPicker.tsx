import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { COLORS } from '../constants/config';
import { RECITERS, type Reciter } from '../constants/reciters';
import { useLocale } from '../context/LocaleContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (reciter: Reciter) => void;
}

export function ReciterPicker({ visible, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, dark && styles.sheetDark]} onPress={() => {}}>
          <View style={[styles.header, isRTL && styles.headerRTL]}>
            <Text style={[styles.title, dark && styles.textDark]}>{t('reciter.title')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeButton}>
              <Text style={[styles.closeGlyph, dark && styles.mutedDark]}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={RECITERS}
            keyExtractor={(item) => item.linkReciter}
            renderItem={({ item }) => {
              const label = language === 'ar' ? item.nameArabic : item.nameTranslation;
              return (
                <TouchableOpacity
                  style={[styles.row, isRTL && styles.rowRTL, dark && styles.rowDark]}
                  onPress={() => onSelect(item)}
                >
                  <Text
                    style={[
                      styles.rowLabel,
                      dark && styles.textDark,
                      { textAlign: isRTL ? 'right' : 'left' },
                    ]}
                  >
                    {label}
                  </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rowRTL: {
    alignItems: 'flex-end',
  },
  rowDark: {
    borderTopColor: COLORS.borderDark,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
