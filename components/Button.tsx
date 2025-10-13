import React from 'react';
import type { GestureResponderEvent } from 'react-native';

import ButtonPrimitive from '@/src/design/components/Button';
import type { ThemeMode } from '@/src/design/useTheme';

type LegacyVariant = 'primary' | 'outline' | 'ghost' | 'destructive' | 'icon';
type LegacySize = 'primary' | 'secondary';

type PrimitiveProps = React.ComponentProps<typeof ButtonPrimitive>;

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
    variant === 'outline' ? 'outline' : variant === 'ghost' || variant === 'icon' ? 'ghost' : 'solid';
  const mappedTone: PrimitiveProps['tone'] = variant === 'destructive' ? 'danger' : 'default';
  const mappedSize: PrimitiveProps['size'] = size === 'secondary' || variant === 'icon' ? 'sm' : 'md';

  return (
    <ButtonPrimitive variant={mappedVariant} size={mappedSize} tone={mappedTone} {...rest}>
      {children}
    </ButtonPrimitive>
  );
};

export { Button };
export default Button;
