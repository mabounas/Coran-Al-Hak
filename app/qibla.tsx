import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { fetchQiblaDirection } from '../src/api/qibla';
import { COLORS } from '../src/constants/config';
import { useLocale } from '../src/context/LocaleContext';

type Status = 'idle' | 'loading' | 'denied' | 'error' | 'ready';

export default function QiblaScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const [status, setStatus] = useState<Status>('idle');
  const [bearing, setBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState(0);
  const rotation = useRef(new Animated.Value(0)).current;
  const headingSubscription = useRef<Location.LocationSubscription | undefined>(undefined);

  useEffect(() => {
    return () => {
      headingSubscription.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (bearing === null) return;
    const target = bearing - heading;
    Animated.timing(rotation, {
      toValue: target,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [bearing, heading, rotation]);

  // Must run directly from a user tap (onPress), not from an effect on mount:
  // Safari on iOS silently refuses the geolocation prompt otherwise.
  const start = async () => {
    setStatus('loading');

    const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
    if (permissionStatus !== 'granted') {
      setStatus('denied');
      return;
    }

    try {
      const position = await Location.getCurrentPositionAsync({});
      const direction = await fetchQiblaDirection(
        position.coords.latitude,
        position.coords.longitude
      );
      setBearing(direction);
      setStatus('ready');

      headingSubscription.current = await Location.watchHeadingAsync((event) => {
        const value = event.trueHeading >= 0 ? event.trueHeading : event.magHeading;
        setHeading(value);
      });
    } catch {
      setStatus('error');
    }
  };

  if (status === 'idle' || status === 'loading') {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Text style={styles.compassIcon}>🧭</Text>
        {status === 'loading' ? (
          <Text style={[styles.message, dark && styles.textDark]}>{t('qibla.locating')}</Text>
        ) : (
          <>
            <Text style={[styles.message, dark && styles.textDark, styles.textCenter]}>
              {t('qibla.intro')}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={start}>
              <Text style={styles.retryText}>{t('qibla.start')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  if (status === 'denied' || status === 'error') {
    return (
      <View style={[styles.centered, dark && styles.centeredDark]}>
        <Text style={[styles.errorTitle, dark && styles.textDark]}>
          {status === 'denied' ? t('qibla.permissionDenied') : t('qibla.error')}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={start}>
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
    gap: 14,
    padding: 24,
    backgroundColor: COLORS.background,
  },
  centeredDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  compassIcon: {
    fontSize: 48,
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
