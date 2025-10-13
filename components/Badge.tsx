import React from 'react';
import type { ViewProps } from 'react-native';

import BadgePrimitive from '@/src/design/components/Badge';

interface Props extends ViewProps {
  label: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<Props> = ({ label, children, ...rest }) => (
  <BadgePrimitive label={label} leading={children ?? undefined} {...rest} />
);

export default Badge;
