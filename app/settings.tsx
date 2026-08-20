import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { COLORS } from '../src/constants/config';
import { LANGUAGES } from '../src/constants/languages';
import { useLocale } from '../src/context/LocaleContext';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language, isRTL, setLanguage } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <Text style={[styles.sectionTitle, dark && styles.mutedDark]}>{t('settings.language')}</Text>
      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
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
              onPress={() => setLanguage(item.code)}
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: COLORS.muted,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  rowDark: {
    backgroundColor: COLORS.cardDark,
    borderColor: COLORS.borderDark,
  },
  rowSelected: {
    borderColor: COLORS.primary,
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
