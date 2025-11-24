import React from 'react';
import { View, Text } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

// Ikon sederhana berbasis huruf pertama, tanpa library eksternal.
export function Icon({ name, size = 20, color = '#000' }: IconProps) {
  const letter = name?.[0]?.toUpperCase() ?? '?';

  return (
    <View
      style={{
        width: size + 8,
        height: size + 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color, fontSize: size * 0.8, fontWeight: '600' }}>
        {letter}
      </Text>
    </View>
  );
}
