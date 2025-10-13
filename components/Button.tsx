import React from 'react';
import type { GestureResponderEvent } from 'react-native';

import UIButton from './ui/Button';
import type { ThemeMode } from '@/src/design/useTheme';

type LegacyVariant = 'primary' | 'outline' | 'ghost' | 'destructive' | 'icon';
type LegacySize = 'primary' | 'secondary';

type PrimitiveProps = React.ComponentProps<typeof UIButton>;

export interface ButtonProps
  extends Omit<PrimitiveProps, 'variant' | 'size' | 'tone' | 'title' | 'leadingIcon' | 'trailingIcon'> {
  variant?: LegacyVariant;
  size?: LegacySize;
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  themeOverride?: ThemeMode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'primary',
  children,
  themeOverride: _themeOverride,
  ...rest
}) => {
  const mappedVariant: PrimitiveProps['variant'] =
    variant === 'outline' ? 'secondary' : variant === 'ghost' || variant === 'icon' ? 'tertiary' : variant === 'destructive' ? 'destructive' : 'primary';

  return <UIButton variant={mappedVariant} title={String(children)} {...(rest as any)} />;
};

export { Button };
export default Button;
