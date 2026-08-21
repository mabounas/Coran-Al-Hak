import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { COLORS } from '../constants/config';

const ORNAMENT_SIZE = 46;

// Slightly warmer than the app background so the page reads as paper.
const PAGE_LIGHT = '#FCF9F0';

interface Props {
  children: React.ReactNode;
  dark?: boolean;
  style?: ViewStyle;
}

// One decorated corner, drawn once and rotated into the four corners so the
// arabesque always curls toward the inside of the page.
function CornerOrnament({ rotation }: { rotation: number }) {
  return (
    <Svg
      width={ORNAMENT_SIZE}
      height={ORNAMENT_SIZE}
      viewBox="0 0 46 46"
      style={{ transform: [{ rotate: `${rotation}deg` }] }}
    >
      <Path
        d="M1 45 C1 21 21 1 45 1"
        stroke={COLORS.gold}
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M8 45 C8 26 26 8 45 8"
        stroke={COLORS.gold}
        strokeWidth={1}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M14 30 C14 20 20 14 30 14 C22 18 18 22 14 30 Z"
        fill={COLORS.gold}
        opacity={0.55}
      />
      <Circle cx={20} cy={20} r={2.4} fill={COLORS.gold} />
      <Path
        d="M31 12 C34 15 34 18 31 21"
        stroke={COLORS.gold}
        strokeWidth={1}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M12 31 C15 34 18 34 21 31"
        stroke={COLORS.gold}
        strokeWidth={1}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MushafFrame({ children, dark, style }: Props) {
  return (
    <View style={[styles.outer, dark && styles.outerDark, style]}>
      <View style={[styles.inner, dark && styles.innerDark]}>{children}</View>

      <View style={[styles.corner, styles.topLeft]} pointerEvents="none">
        <CornerOrnament rotation={0} />
      </View>
      <View style={[styles.corner, styles.topRight]} pointerEvents="none">
        <CornerOrnament rotation={90} />
      </View>
      <View style={[styles.corner, styles.bottomRight]} pointerEvents="none">
        <CornerOrnament rotation={180} />
      </View>
      <View style={[styles.corner, styles.bottomLeft]} pointerEvents="none">
        <CornerOrnament rotation={270} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 6,
    backgroundColor: PAGE_LIGHT,
    padding: 6,
    margin: 12,
  },
  outerDark: {
    backgroundColor: COLORS.cardDark,
  },
  inner: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 3,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  innerDark: {
    borderColor: COLORS.gold,
  },
  corner: {
    position: 'absolute',
    width: ORNAMENT_SIZE,
    height: ORNAMENT_SIZE,
  },
  topLeft: {
    top: 2,
    left: 2,
  },
  topRight: {
    top: 2,
    right: 2,
  },
  bottomRight: {
    bottom: 2,
    right: 2,
  },
  bottomLeft: {
    bottom: 2,
    left: 2,
  },
});
