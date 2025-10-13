import React from 'react';
import type { ViewProps } from 'react-native';

import CardPrimitive from '@/src/design/components/Card';

interface Props extends ViewProps {
  onPress?: () => void;
  children: React.ReactNode;
  accessibilityHint?: string;
}

export const Card: React.FC<Props> = ({ onPress, children, accessibilityHint, ...rest }) => {
  return (
    <CardPrimitive
      interactive={Boolean(onPress)}
      onPress={onPress}
      accessibilityHint={accessibilityHint}
      {...rest}
    >
      {children}
    </CardPrimitive>
  );
};

export default Card;
