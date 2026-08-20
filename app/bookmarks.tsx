import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { SurahCard } from '../src/components/SurahCard';
import { COLORS } from '../src/constants/config';
import { useBookmarks } from '../src/context/BookmarksContext';
import { useSurahs } from '../src/context/SurahsContext';

export default function BookmarksScreen() {
  const { t } = useTranslation();
  const { surahs } = useSurahs();
  const { bookmarks } = useBookmarks();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const bookmarkedSurahs = useMemo(
    () => surahs.filter((s) => bookmarks.includes(s.number)),
    [surahs, bookmarks]
  );

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      {bookmarkedSurahs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyGlyph}>🔖</Text>
          <Text style={[styles.emptyTitle, dark && styles.textDark]}>{t('bookmarks.empty')}</Text>
          <Text style={[styles.emptyHint, dark && styles.mutedDark]}>
            {t('bookmarks.emptyHint')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarkedSurahs}
          keyExtractor={(item) => String(item.number)}
          renderItem={({ item }) => <SurahCard surah={item} />}
          contentContainerStyle={styles.listContent}
        />
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
  listContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  emptyGlyph: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
