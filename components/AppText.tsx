import React from 'react';
import { Text, TextProps } from 'react-native';
import { typography, colors } from '../tokens';

type Variant = 'display' | 'h1' | 'h2' | 'body' | 'caption';

export interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: keyof typeof colors.text | 'accent';
  weight?: '400' | '500' | '600' | '700';
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'primary',
  weight,
  style,
  children,
  ...rest
}) => {
  const baseVariantStyle = typography[variant] as any;
  const colorValue = color === 'accent' ? colors.accent : colors.text[color];

  return (
    <Text
      style={[
        baseVariantStyle,
        variant === 'display' || variant === 'h1' || variant === 'h2'
          ? typography.monoDigits
          : null,
        { color: colorValue },
        weight ? { fontWeight: weight } : null,
        style,
      ]}
      maxFontSizeMultiplier={1.3}
      {...rest}
    >
      {children}
    </Text>
  );
};



