import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { COLORS } from '../../src/constants/config';

export default function ComingSoonScreen() {
  const { t } = useTranslation();
  const { feature } = useLocalSearchParams<{ feature: string }>();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const title = feature ? t(`landing.${feature}`) : '';

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <Stack.Screen options={{ title }} />
      <Text style={styles.icon}>🚧</Text>
      <Text style={[styles.title, dark && styles.textDark]}>{title}</Text>
      <Text style={[styles.message, dark && styles.mutedDark]}>{t('landing.comingSoon')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  message: {
    fontSize: 14,
    color: COLORS.muted,
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
