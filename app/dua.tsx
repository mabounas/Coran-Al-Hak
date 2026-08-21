import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { fetchDuaCategories, fetchDuasByCategory } from '../src/api/duas';
import { DuaCategoryPicker } from '../src/components/DuaCategoryPicker';
import { COLORS } from '../src/constants/config';
import { getCategoryDisplayName } from '../src/constants/duaCategoryNames';
import { useLocale } from '../src/context/LocaleContext';
import type { Dua, DuaCategory } from '../src/types/dua';

type CategoriesStatus = 'loading' | 'error' | 'ready';
type DuasStatus = 'idle' | 'loading' | 'error' | 'ready';

export default function DuaScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const [categoriesStatus, setCategoriesStatus] = useState<CategoriesStatus>('loading');
  const [categories, setCategories] = useState<DuaCategory[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DuaCategory | null>(null);
  const [duasStatus, setDuasStatus] = useState<DuasStatus>('idle');
  const [duas, setDuas] = useState<Dua[]>([]);

  const loadCategories = () => {
    setCategoriesStatus('loading');
    fetchDuaCategories()
      .then((result) => {
        setCategories(result);
        setCategoriesStatus('ready');
      })
      .catch(() => setCategoriesStatus('error'));
  };

  useEffect(loadCategories, []);

  const selectCategory = (category: DuaCategory) => {
    setPickerVisible(false);
    setSelectedCategory(category);
    setDuasStatus('loading');
    fetchDuasByCategory(category.id)
      .then((result) => {
        setDuas(result);
        setDuasStatus('ready');
      })
      .catch(() => setDuasStatus('error'));
  };

  const duaText = (dua: Dua): string => {
    if (language === 'ar') return dua.arabic ?? dua.translation ?? '';
    return dua.translation ?? dua.arabic ?? '';
  };

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      {categoriesStatus === 'loading' && (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={[styles.message, dark && styles.textDark]}>
            {t('dua.loadingCategories')}
          </Text>
        </View>
      )}

      {categoriesStatus === 'error' && (
        <View style={styles.centered}>
          <Text style={[styles.errorTitle, dark && styles.textDark]}>
            {t('dua.errorCategories')}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
            <Text style={styles.retryText}>{t('home.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {categoriesStatus === 'ready' && (
        <>
          <TouchableOpacity
            style={[styles.selector, dark && styles.selectorDark]}
            onPress={() => setPickerVisible(true)}
          >
            <Text
              style={[
                styles.selectorText,
                dark && styles.textDark,
                { textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {selectedCategory
                ? getCategoryDisplayName(selectedCategory, language)
                : t('dua.selectCategory')}
            </Text>
            <Text style={[styles.selectorChevron, dark && styles.mutedDark]}>▾</Text>
          </TouchableOpacity>

          <DuaCategoryPicker
            visible={pickerVisible}
            categories={categories}
            onClose={() => setPickerVisible(false)}
            onSelect={selectCategory}
          />

          {duasStatus === 'loading' && (
            <View style={styles.centered}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={[styles.message, dark && styles.textDark]}>
                {t('dua.loadingDuas')}
              </Text>
            </View>
          )}

          {duasStatus === 'error' && (
            <View style={styles.centered}>
              <Text style={[styles.errorTitle, dark && styles.textDark]}>
                {t('dua.errorDuas')}
              </Text>
              {selectedCategory && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => selectCategory(selectedCategory)}
                >
                  <Text style={styles.retryText}>{t('home.retry')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {duasStatus === 'ready' && (
            <ScrollView contentContainerStyle={styles.list}>
              {duas.map((dua, index) => (
                <View key={index} style={[styles.card, dark && styles.cardDark]}>
                  <Text
                    style={[
                      styles.duaText,
                      dark && styles.textDark,
                      language === 'ar' && styles.duaTextArabic,
                    ]}
                  >
                    {duaText(dua)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  message: {
    fontSize: 14,
    color: COLORS.text,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.danger,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorDark: {
    backgroundColor: COLORS.cardDark,
    borderColor: COLORS.borderDark,
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectorChevron: {
    fontSize: 14,
    color: COLORS.muted,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  cardDark: {
    backgroundColor: COLORS.cardDark,
    borderColor: COLORS.borderDark,
  },
  duaText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
  },
  duaTextArabic: {
    fontSize: 18,
    lineHeight: 30,
    textAlign: 'right',
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
