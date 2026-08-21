import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { COLORS } from '../constants/config';
import { getCategoryDisplayName } from '../constants/duaCategoryNames';
import { useLocale } from '../context/LocaleContext';
import type { DuaCategory } from '../types/dua';

interface Props {
  visible: boolean;
  categories: DuaCategory[];
  onClose: () => void;
  onSelect: (category: DuaCategory) => void;
}

export function DuaCategoryPicker({ visible, categories, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, dark && styles.sheetDark]} onPress={() => {}}>
          <View style={[styles.header, isRTL && styles.headerRTL]}>
            <Text style={[styles.title, dark && styles.textDark]}>{t('dua.selectCategory')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeButton}>
              <Text style={[styles.closeGlyph, dark && styles.mutedDark]}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
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
                  {getCategoryDisplayName(item, language)}
                </Text>
                <Text style={[styles.rowCount, dark && styles.mutedDark]}>{item.count}</Text>
              </TouchableOpacity>
            )}
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
    maxHeight: '75%',
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
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  rowCount: {
    fontSize: 12,
    color: COLORS.muted,
    marginHorizontal: 8,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
