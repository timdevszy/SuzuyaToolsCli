import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, spacing } from './theme';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
}

export function Screen({ children, style, ...rest }: ScreenProps) {
  return (
    <View style={[styles.root, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
});
