import React from 'react';
import type { TextProps as RNTextProps } from 'react-native';

import Text from '@/src/design/components/Text';
import type { TextVariant } from '@/src/design/typography';

type LegacyVariant = 'display' | 'h1' | 'h2' | 'body' | 'caption';
type LegacyTone = 'primary' | 'secondary' | 'tertiary' | 'muted' | 'accent';

type Props = RNTextProps & {
  variant?: LegacyVariant;
  color?: LegacyTone;
  weight?: '400' | '500' | '600' | '700';
};

const variantMap: Record<LegacyVariant, TextVariant> = {
  display: 'display',
  h1: 'headline',
  h2: 'title',
  body: 'body',
  caption: 'caption',
};

const emphasisMap: Record<Props['weight'], 'regular' | 'semiBold' | 'bold'> = {
  '400': 'regular',
  '500': 'semiBold',
  '600': 'semiBold',
  '700': 'bold',
};

const toneMap = (
  tone: LegacyTone | undefined,
): { token?: 'primary'; muted?: boolean } => {
  switch (tone) {
    case 'accent':
      return { token: 'primary' };
    case 'secondary':
    case 'tertiary':
    case 'muted':
      return { muted: true };
    case 'primary':
    default:
      return {};
  }
};

export const AppText: React.FC<Props> = ({
  variant = 'body',
  color = 'primary',
  weight = '400',
  style,
  children,
  ...rest
}) => {
  const { token, muted } = toneMap(color);
  const emphasis = emphasisMap[weight] ?? 'regular';

  return (
    <Text
      variant={variantMap[variant]}
      emphasis={emphasis}
      muted={muted}
      colorToken={token}
      style={style}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default AppText;
