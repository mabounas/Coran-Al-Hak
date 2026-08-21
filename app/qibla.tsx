import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { fetchQiblaDirection } from '../src/api/qibla';
import { COLORS } from '../src/constants/config';
import { useLocale } from '../src/context/LocaleContext';

type Status = 'loading' | 'denied' | 'error' | 'ready';

export default function QiblaScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const [status, setStatus] = useState<Status>('loading');
  const [bearing, setBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState(0);
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== 'loading') return;

    let cancelled = false;
    let headingSubscription: Location.LocationSubscription | undefined;

    (async () => {
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
      if (permissionStatus !== 'granted') {
        if (!cancelled) setStatus('denied');
        return;
      }

      try {
        const position = await Location.getCurrentPositionAsync({});
        const direction = await fetchQiblaDirection(
          position.coords.latitude,
          position.coords.longitude
        );
        if (cancelled) return;
        setBearing(direction);
        setStatus('ready');

        headingSubscription = await Location.watchHeadingAsync((event) => {
          const value = event.trueHeading >= 0 ? event.trueHeading : event.magHeading;
          setHeading(value);
        });
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      headingSubscription?.remove();
    };
  }, [status]);

  useEffect(() => {
    if (bearing === null) return;
    const target = bearing - heading;
    Animated.timing(rotation, {
      toValue: target,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [bearing, heading, rotation]);

  const retry = () => setStatus('loading');

  if (status === 'loading') {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Text style={[styles.message, dark && styles.textDark]}>{t('qibla.locating')}</Text>
      </View>
    );
  }

  if (status === 'denied' || status === 'error') {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Text style={[styles.errorTitle, dark && styles.textDark]}>
          {status === 'denied' ? t('qibla.permissionDenied') : t('qibla.error')}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={retry}>
          <Text style={styles.retryText}>{t('home.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rotateDeg = rotation.interpolate({
    inputRange: [-720, 720],
    outputRange: ['-720deg', '720deg'],
  });

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <View style={[styles.dial, dark && styles.dialDark]}>
        <Text style={[styles.dialNorth, dark && styles.textDark]}>N</Text>
        <Animated.View style={[styles.needle, { transform: [{ rotate: rotateDeg }] }]}>
          <Text style={styles.needleIcon}>🕋</Text>
          <View style={styles.needleLine} />
        </Animated.View>
        <View style={styles.dialCenterDot} />
      </View>
      <Text style={[styles.instructions, dark && styles.mutedDark, isRTL && styles.textCenter]}>
        {t('qibla.instructions')}
      </Text>
      {bearing !== null && (
        <Text style={[styles.bearingText, dark && styles.mutedDark]}>
          {t('qibla.bearing', { degrees: Math.round(bearing) })}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 24,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: COLORS.background,
  },
  centeredDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  message: {
    fontSize: 15,
    color: COLORS.text,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.danger,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  dial: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.card,
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialDark: {
    backgroundColor: COLORS.cardDark,
  },
  dialNorth: {
    position: 'absolute',
    top: 12,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  needle: {
    alignItems: 'center',
  },
  needleIcon: {
    fontSize: 34,
  },
  needleLine: {
    width: 3,
    height: 90,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  dialCenterDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  instructions: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  bearingText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  textCenter: {
    textAlign: 'center',
  },
  textDark: {
    color: COLORS.textDark,
  },
  mutedDark: {
    color: COLORS.mutedDark,
  },
});
