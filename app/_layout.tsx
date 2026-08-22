import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../src/i18n';
import { MiniPlayer } from '../src/components/MiniPlayer';
import { TopMenu } from '../src/components/TopMenu';
import { COLORS } from '../src/constants/config';
import { AudioPlayerProvider } from '../src/context/AudioPlayerContext';
import { BookmarksProvider } from '../src/context/BookmarksContext';
import { LocaleProvider, useLocale } from '../src/context/LocaleContext';
import { SurahsProvider } from '../src/context/SurahsContext';

function RootStack() {
  const { t } = useTranslation();
  const { isReady } = useLocale();

  if (!isReady) return null;

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          headerTitleAlign: 'center',
          headerRight: () => <TopMenu />,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: t('app.name') }} />
        <Stack.Screen name="sommaire" options={{ title: t('landing.listen') }} />
        <Stack.Screen name="lecture/index" options={{ title: t('landing.read') }} />
        <Stack.Screen name="lecture/[number]" options={{ title: t('landing.read') }} />
        <Stack.Screen name="recherche" options={{ title: t('landing.search') }} />
        <Stack.Screen name="mushaf/[page]" options={{ title: t('mushaf.open') }} />
        <Stack.Screen name="noms" options={{ title: t('names.title') }} />
        <Stack.Screen name="horaires" options={{ title: t('prayer.title') }} />
        <Stack.Screen name="hadith/index" options={{ title: t('landing.hadith') }} />
        <Stack.Screen name="hadith/[collection]" options={{ title: t('landing.hadith') }} />
        <Stack.Screen name="bookmarks" options={{ title: t('bookmarks.title') }} />
        <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
        <Stack.Screen name="about" options={{ title: t('about.title') }} />
        <Stack.Screen name="qibla" options={{ title: t('landing.qibla') }} />
        <Stack.Screen name="dua" options={{ title: t('landing.dua') }} />
      </Stack>
      <MiniPlayer />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LocaleProvider>
          <SurahsProvider>
            <BookmarksProvider>
              <AudioPlayerProvider>
                <RootStack />
              </AudioPlayerProvider>
            </BookmarksProvider>
          </SurahsProvider>
        </LocaleProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
