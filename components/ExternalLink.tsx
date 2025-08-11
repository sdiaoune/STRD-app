import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform, Text, Linking } from 'react-native';

type Props = ComponentProps<typeof Text> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Text
      {...rest}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          event?.preventDefault?.();
          await openBrowserAsync(href);
        } else {
          Linking.openURL(href);
        }
      }}
    />
  );
}
