import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { COLORS } from '../constants/config';
import { useLocale } from '../context/LocaleContext';

interface MenuEntry {
  key: string;
  labelKey: string;
  icon: string;
  route: '/' | '/bookmarks' | '/settings' | '/about';
}

const ENTRIES: MenuEntry[] = [
  { key: 'summary', labelKey: 'menu.summary', icon: '📖', route: '/' },
  { key: 'bookmarks', labelKey: 'menu.bookmarks', icon: '🔖', route: '/bookmarks' },
  { key: 'settings', labelKey: 'menu.settings', icon: '🌐', route: '/settings' },
  { key: 'about', labelKey: 'menu.about', icon: 'ℹ️', route: '/about' },
];

export function TopMenu() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const router = useRouter();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const navigate = (route: MenuEntry['route']) => {
    setOpen(false);
    router.push(route);
  };

  return (
    <View>
      <TouchableOpacity
        accessibilityLabel={t('menu.open')}
        onPress={() => setOpen(true)}
        style={styles.trigger}
        hitSlop={12}
      >
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.dropdown,
              dark && styles.dropdownDark,
              isRTL ? { left: 12 } : { right: 12 },
            ]}
          >
            {ENTRIES.map((entry) => (
              <TouchableOpacity
                key={entry.key}
                style={[styles.item, isRTL && styles.itemRTL]}
                onPress={() => navigate(entry.route)}
              >
                <Text style={styles.itemIcon}>{entry.icon}</Text>
                <Text style={[styles.itemLabel, dark && styles.itemLabelDark]}>
                  {t(entry.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  hamburgerLine: {
    width: 22,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: COLORS.card,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  dropdown: {
    position: 'absolute',
    top: 64,
    minWidth: 220,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  dropdownDark: {
    backgroundColor: COLORS.cardDark,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemRTL: {
    flexDirection: 'row-reverse',
  },
  itemIcon: {
    fontSize: 18,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  itemLabelDark: {
    color: COLORS.textDark,
  },
});
