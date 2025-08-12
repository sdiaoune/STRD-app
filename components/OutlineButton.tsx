import React from 'react';
import { Button, ButtonProps } from './Button';

interface OutlineButtonProps extends Omit<ButtonProps, 'variant'> {
  children: React.ReactNode;
}

export const OutlineButton: React.FC<OutlineButtonProps> = ({ children, ...props }) => {
  return (
    <Button variant="outline" {...props}>
      {children}
    </Button>
  );
};
