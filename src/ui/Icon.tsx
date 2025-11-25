import React from 'react';
import { View, Text } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

// Ikon sederhana tanpa library eksternal.
// Untuk nama tertentu (printer/discount/scan) kita gambar bentuk custom.
// Untuk nama lain, fallback ke ikon huruf bulat.
export function Icon({ name, size = 20, color = '#000' }: IconProps) {
  const dimension = size + 8;
  const circleStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    backgroundColor: color,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (name === 'home') {
    return (
      <View style={circleStyle}>
        {/* rumah putih sederhana di dalam lingkaran */}
        <View
          style={{
            width: dimension * 0.55,
            height: dimension * 0.36,
            backgroundColor: '#ffffff',
            borderRadius: 4,
            position: 'relative',
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: dimension * 0.36,
            width: dimension * 0.4,
            height: dimension * 0.24,
            backgroundColor: '#ffffff',
            transform: [{ rotate: '45deg' }],
            borderRadius: 3,
          }}
        />
      </View>
    );
  }

  if (name === 'stock') {
    return (
      <View style={circleStyle}>
        {/* panah naik putih */}
        <View
          style={{
            width: dimension * 0.4,
            height: 2,
            backgroundColor: '#ffffff',
            transform: [{ rotate: '-45deg' }],
            borderRadius: 1,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: dimension * 0.3,
            width: 0,
            height: 0,
            borderLeftWidth: 4,
            borderRightWidth: 4,
            borderBottomWidth: 6,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#ffffff',
          }}
        />
      </View>
    );
  }

  if (name === 'monitor') {
    return (
      <View style={circleStyle}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            width: dimension * 0.55,
          }}>
          <View
            style={{ width: 3, height: 6, backgroundColor: '#ffffff', borderRadius: 1 }}
          />
          <View
            style={{ width: 3, height: 10, backgroundColor: '#ffffff', borderRadius: 1 }}
          />
          <View
            style={{ width: 3, height: 7, backgroundColor: '#ffffff', borderRadius: 1 }}
          />
          <View
            style={{ width: 3, height: 12, backgroundColor: '#ffffff', borderRadius: 1 }}
          />
        </View>
      </View>
    );
  }

  if (name === 'price') {
    return (
      <View style={circleStyle}>
        <View
          style={{
            width: dimension * 0.6,
            height: dimension * 0.32,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: '#ffffff',
            transform: [{ rotate: '-15deg' }],
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#ffffff',
              position: 'absolute',
              left: 4,
              top: 4,
            }}
          />
        </View>
      </View>
    );
  }

  if (name === 'archive') {
    return (
      <View style={circleStyle}>
        <View
          style={{
            width: dimension * 0.7,
            height: dimension * 0.42,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: '#ffffff',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: dimension * 0.32,
              height: 3,
              borderRadius: 2,
              backgroundColor: '#ffffff',
            }}
          />
        </View>
      </View>
    );
  }

  if (name === 'printer') {
    return (
      <View style={circleStyle}>
        {/* kertas */}
        <View
          style={{
            position: 'absolute',
            top: dimension * 0.22,
            width: dimension * 0.42,
            height: dimension * 0.22,
            borderRadius: 3,
            backgroundColor: '#ffffff',
          }}
        />
        {/* badan printer */}
        <View
          style={{
            position: 'absolute',
            top: dimension * 0.38,
            width: dimension * 0.52,
            height: dimension * 0.26,
            borderRadius: 4,
            backgroundColor: '#ffffff',
          }}
        />
        {/* tray bawah */}
        <View
          style={{
            position: 'absolute',
            bottom: dimension * 0.22,
            width: dimension * 0.36,
            height: dimension * 0.10,
            borderRadius: 2,
            backgroundColor: '#ffffff',
          }}
        />
      </View>
    );
  }

  if (name === 'profile') {
    return (
      <View style={circleStyle}>
        {/* kepala */}
        <View
          style={{
            width: dimension * 0.34,
            height: dimension * 0.34,
            borderRadius: (dimension * 0.34) / 2,
            borderWidth: 1.6,
            borderColor: '#ffffff',
            marginBottom: 1,
          }}
        />
        {/* badan */}
        <View
          style={{
            width: dimension * 0.6,
            height: dimension * 0.26,
            borderRadius: dimension * 0.16,
            borderWidth: 1.6,
            borderColor: '#ffffff',
          }}
        />
      </View>
    );
  }

  if (name === 'discount') {
    return (
      <View style={circleStyle}>
        <Text
          style={{
            color: '#ffffff',
            fontSize: size * 0.9,
            fontWeight: '700',
          }}>
          %
        </Text>
      </View>
    );
  }

  if (name === 'camera') {
    return (
      <View style={circleStyle}>
        <View
          style={{
            width: dimension * 0.6,
            height: dimension * 0.4,
            borderRadius: 6,
            backgroundColor: '#ffffff',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {/* lensa */}
          <View
            style={{
              width: dimension * 0.22,
              height: dimension * 0.22,
              borderRadius: (dimension * 0.22) / 2,
              borderWidth: 2,
              borderColor: color,
            }}
          />
        </View>
      </View>
    );
  }

  if (name === 'search') {
    return (
      <View style={circleStyle}>
        {/* lingkaran utama kaca pembesar */}
        <View
          style={{
            width: dimension * 0.32,
            height: dimension * 0.32,
            borderRadius: (dimension * 0.32) / 2,
            borderWidth: 2,
            borderColor: '#ffffff',
          }}
        />
        {/* gagang */}
        <View
          style={{
            position: 'absolute',
            bottom: dimension * 0.26,
            right: dimension * 0.28,
            width: dimension * 0.18,
            height: 2,
            backgroundColor: '#ffffff',
            borderRadius: 1,
            transform: [{ rotate: '35deg' }],
          }}
        />
      </View>
    );
  }

  if (name === 'scan') {
    return (
      <View style={circleStyle}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 2,
              height: dimension * 0.35,
              backgroundColor: '#ffffff',
              borderRadius: 1,
            }}
          />
          <View
            style={{
              width: 2,
              height: dimension * 0.35,
              backgroundColor: '#ffffff',
              borderRadius: 1,
            }}
          />
          <View
            style={{
              width: 2,
              height: dimension * 0.35,
              backgroundColor: '#ffffff',
              borderRadius: 1,
            }}
          />
        </View>
      </View>
    );
  }

  // fallback: ikon bulat dengan huruf
  const letter = name?.[0]?.toUpperCase() ?? '?';

  return (
    <View style={circleStyle}>
      <Text style={{ color: '#ffffff', fontSize: size * 0.8, fontWeight: '600' }}>
        {letter}
      </Text>
    </View>
  );
}
