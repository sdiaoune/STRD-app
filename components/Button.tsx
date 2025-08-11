import React, { useState } from 'react';
import { Pressable, Text, PressableProps } from 'react-native';
import { typography } from '../tokens';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive';

interface Props extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  disabled?: boolean;
}

export const Button: React.FC<Props> = ({
  title,
  variant = 'primary',
  disabled,
  onPress,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  const baseClasses = 'flex-row items-center justify-center rounded-lg px-4';
  const heightClass = variant === 'primary' ? 'h-14' : 'h-11';
  const variantClasses: Record<ButtonVariant, string> = {
    primary: `bg-primary`,
    outline: `border border-primary`,
    ghost: 'bg-transparent',
    destructive: 'border border-error',
  };
  const textClasses: Record<ButtonVariant, string> = {
    primary: 'text-onPrimary',
    outline: 'text-primary',
    ghost: 'text-primary',
    destructive: 'text-error',
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={[baseClasses, heightClass, variantClasses[variant],
        focused ? 'ring-2 ring-info' : '', disabled ? 'opacity-50' : ''].join(' ')}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
      {...rest}
    >
      <Text
        className={`font-semibold ${textClasses[variant]}`}
        style={typography.title}
      >
        {title}
      </Text>
    </Pressable>
  );
};
