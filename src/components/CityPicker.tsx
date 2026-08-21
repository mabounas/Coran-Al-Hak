import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { COLORS } from '../constants/config';
import { CITIES, type City } from '../constants/cities';
import { useLocale } from '../context/LocaleContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
}

export function CityPicker({ visible, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter((city) => city.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, dark && styles.sheetDark]} onPress={() => {}}>
          <View style={[styles.header, isRTL && styles.headerRTL]}>
            <Text style={[styles.title, dark && styles.textDark]}>{t('qibla.chooseCity')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeButton}>
              <Text style={[styles.closeGlyph, dark && styles.mutedDark]}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('qibla.citySearch')}
            placeholderTextColor={COLORS.muted}
            style={[
              styles.search,
              dark && styles.searchDark,
              { textAlign: isRTL ? 'right' : 'left' },
            ]}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, dark && styles.rowDark]}
                onPress={() => onSelect(item)}
              >
                <Text
                  style={[
                    styles.rowLabel,
                    dark && styles.textDark,
                    { textAlign: isRTL ? 'right' : 'left' },
                  ]}
                >
                  {item.name}
                </Text>
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
  search: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  searchDark: {
    backgroundColor: COLORS.backgroundDark,
    borderColor: COLORS.borderDark,
    color: COLORS.textDark,
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
