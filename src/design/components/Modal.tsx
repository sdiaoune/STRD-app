import React, { useEffect } from "react";
import {
  AccessibilityInfo,
  Modal as RNModal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewProps,
} from "react-native";

import Heading from "./Heading";
import { useTheme } from "../useTheme";

interface Props extends ViewProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({
  visible,
  onDismiss,
  title,
  children,
  style,
  ...rest
}: Props) {
  const theme = useTheme();

  useEffect(() => {
    if (visible && title) {
      AccessibilityInfo.announceForAccessibility?.(title);
    }
  }, [visible, title]);

  return (
    <RNModal
      animationType={Platform.OS === "ios" ? "slide" : "fade"}
      transparent
      visible={visible}
      onRequestClose={onDismiss}
      presentationStyle="overFullScreen"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close modal"
        style={[styles.backdrop, { backgroundColor: `${theme.colors.text}AA` }]}
        onPress={onDismiss}
      />
      <View style={styles.centered}>
        <View
          {...rest}
          accessibilityViewIsModal
          style={StyleSheet.flatten([
            styles.container,
            {
              backgroundColor: theme.colors.bg,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.xl,
            },
            style,
          ])}
        >
          {title ? <Heading level="h3" style={styles.title}>{title}</Heading> : null}
          {children}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.65,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    minWidth: "80%",
    maxWidth: 420,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    marginBottom: 16,
  },
});
