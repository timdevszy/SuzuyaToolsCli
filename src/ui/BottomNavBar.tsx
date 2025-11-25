import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from './theme';
import { Icon } from './Icon';

export interface BottomNavItem {
  key: string;
  icon: string; // MaterialIcons name
  label?: string;
}

interface BottomNavBarProps {
  items: BottomNavItem[];
  activeKey: string;
  onPress: (key: string) => void;
}

// Navbar bergaya modern dan bersih:
// - Bar putih full-width dengan bayangan halus.
// - Tiga ikon sejajar rata, item aktif diberi warna aksen dan garis di atas.
export function BottomNavBar({ items, activeKey, onPress }: BottomNavBarProps) {
  if (!items.length) {
    return null;
  }

  const [width, setWidth] = useState(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.wrapper} onLayout={handleLayout}>
      {width > 0 ? (
        <Svg
          pointerEvents="none"
          width={width}
          height={64}
          style={styles.svgBackground}>
          <Path
            d={createNotchedPath(width)}
            fill={colors.surface}
          />
        </Svg>
      ) : null}

      <View style={styles.bar}>
        {items.map(item => {
          const isActive = item.key === activeKey;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.item}
              onPress={() => onPress(item.key)}>
              <View style={isActive ? styles.tabActive : styles.tab}>
                <Icon
                  name={item.icon}
                  size={22}
                  color={isActive ? '#2563eb' : colors.textSecondary}
                />
                {item.label ? (
                  <Text
                    style={isActive ? styles.labelActive : styles.labelDefault}>
                    {item.label}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    paddingBottom: 0,
  },
  svgBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  bar: {
    height: 64,
    paddingTop: 4,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelDefault: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary,
  },
  labelActive: {
    marginTop: 2,
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '600',
  },
});

interface IconLabelProps {
  text: string;
  active: boolean;
}

function IconLabel({ text, active }: IconLabelProps) {
  return (
    <View>
      <Text
        style={{
          fontSize: 11,
          textAlign: 'center',
          color: active ? '#2563eb' : colors.textSecondary,
        }}>
        {text}
      </Text>
    </View>
  );
}

function createNotchedPath(width: number): string {
  const height = 64;
  const notchWidth = 80;
  const notchDepth = 12;

  const center = width / 2;
  const notchLeft = center - notchWidth / 2;
  const notchRight = center + notchWidth / 2;

  // Path dimulai dari kiri atas, lalu membuat lekukan kecil ke atas di tengah,
  // kemudian ke kanan atas dan menutup ke bawah.
  return [
    `M0 0`,
    `H${notchLeft}`,
    // Lekukan naik ke atas (y negatif) lalu kembali ke garis 0
    `Q${center} ${-notchDepth} ${notchRight} 0`,
    `H${width}`,
    `V${height}`,
    `H0`,
    `Z`,
  ].join(' ');
}
