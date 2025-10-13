import { colors } from '../theme';

// Simple contrast approximation using relative luminance
function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrast(hex1: string, hex2: string) {
  const L1 = luminance(hex1) + 0.05;
  const L2 = luminance(hex2) + 0.05;
  return L1 > L2 ? L1 / L2 : L2 / L1;
}

test('primary on surface meets 4.5:1', () => {
  const bg = colors.surface;
  const fg = colors.text.primary;
  expect(contrast(bg, fg)).toBeGreaterThanOrEqual(4.5);
});

test('onPrimary on primary meets 4.5:1', () => {
  const bg = colors.primary;
  const fg = colors.onPrimary;
  expect(contrast(bg, fg)).toBeGreaterThanOrEqual(4.5);
});

