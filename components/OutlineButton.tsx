import React from 'react';
import { Button, ButtonVariant } from './Button';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

export const OutlineButton: React.FC<Props> = ({
  title,
  onPress,
  variant = 'outline',
  disabled,
}) => {
  return <Button title={title} onPress={onPress} variant={variant} disabled={disabled} />;
};
