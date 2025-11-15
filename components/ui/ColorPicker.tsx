import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, PanResponder, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing } from '../../theme';

type Props = {
  initialHex?: string;
  onChange?: (hex: string) => void;
};

type HSV = { h: number; s: number; v: number };

const hexToHsv = (hex: string): HSV => {
  try {
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized;
    const r = parseInt(full.slice(0, 2), 16) / 255;
    const g = parseInt(full.slice(2, 4), 16) / 255;
    const b = parseInt(full.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
      switch (max) {
        case r: h = ((g - b) / d) % 6; break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
    }
    h = Math.round((h < 0 ? h + 6 : h) * 60);
    const s = max === 0 ? 0 : d / max;
    const v = max;
    return { h, s, v };
  } catch {
    return { h: 270, s: 0.6, v: 0.7 };
  }
};

const hsvToHex = ({ h, s, v }: HSV): string => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const to255 = (n: number) => Math.round((n + m) * 255);
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const R = to255(r), G = to255(g), B = to255(b);
  return `#${toHex(R)}${toHex(G)}${toHex(B)}`.toUpperCase();
};

export const ColorPicker: React.FC<Props> = ({ initialHex = '#A855F7', onChange }) => { // color-literal-ok
  const [svSize, setSvSize] = useState({ w: 1, h: 1 });
  const [hueWidth, setHueWidth] = useState(1);
  const initial = useMemo(() => hexToHsv(initialHex), [initialHex]);
  const [hsv, setHsv] = useState<HSV>(initial);

  const update = useCallback((next: HSV) => {
    setHsv(next);
    const hex = hsvToHex(next);
    onChange?.(hex);
  }, [onChange]);

  const onSvLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSvSize({ w: Math.max(1, width), h: Math.max(1, height) });
  };

  const svResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent as any;
      const s = Math.min(1, Math.max(0, locationX / svSize.w));
      const v = Math.min(1, Math.max(0, 1 - locationY / svSize.h));
      update({ h: hsv.h, s, v });
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent as any;
      const s = Math.min(1, Math.max(0, locationX / svSize.w));
      const v = Math.min(1, Math.max(0, 1 - locationY / svSize.h));
      update({ h: hsv.h, s, v });
    },
  }), [svSize.w, svSize.h, hsv.h, update]);

  const hueResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX } = evt.nativeEvent as any;
      const t = Math.min(1, Math.max(0, locationX / hueWidth));
      update({ h: Math.round(t * 360), s: hsv.s, v: hsv.v });
    },
    onPanResponderMove: (evt) => {
      const { locationX } = evt.nativeEvent as any;
      const t = Math.min(1, Math.max(0, locationX / hueWidth));
      update({ h: Math.round(t * 360), s: hsv.s, v: hsv.v });
    },
  }), [hueWidth, hsv.s, hsv.v, update]);

  const hueColor = useMemo(() => hsvToHex({ h: hsv.h, s: 1, v: 1 }), [hsv.h]);

  const svThumbStyle = useMemo(() => ({
    position: 'absolute' as const,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ffffff', // color-literal-ok
    backgroundColor: hueColor,
    left: hsv.s * svSize.w - 11,
    top: (1 - hsv.v) * svSize.h - 11,
  }), [svSize.w, svSize.h, hueColor, hsv.s, hsv.v]);

  const hueThumbStyle = useMemo(() => ({
    position: 'absolute' as const,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff', // color-literal-ok
    backgroundColor: hueColor,
    left: (hsv.h / 360) * hueWidth - 10,
    top: -6,
  }), [hueWidth, hueColor, hsv.h]);

  return (
    <View>
      {/* SV square */}
      <View onLayout={onSvLayout} {...svResponder.panHandlers} style={{ height: 180, borderRadius: borderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
        <LinearGradient
          colors={[ '#ffffff', hueColor ]} // color-literal-ok
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
        <LinearGradient
          colors={[ 'transparent', '#000000' ]} // color-literal-ok
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <View pointerEvents="none" style={svThumbStyle} />
      </View>
      <View style={{ height: spacing.md }} />
      {/* Hue bar */}
      <View onLayout={(e) => setHueWidth(Math.max(1, e.nativeEvent.layout.width))} {...hueResponder.panHandlers} style={{ height: 8, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
        <LinearGradient
          colors={[ '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000' ]} // color-literal-ok
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
        <View pointerEvents="none" style={hueThumbStyle} />
      </View>
    </View>
  );
};

export default ColorPicker;


