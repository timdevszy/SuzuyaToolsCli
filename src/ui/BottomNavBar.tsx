import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
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

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {items.map(item => {
          const isActive = item.key === activeKey;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.item}
              onPress={() => onPress(item.key)}>
              <View style={[styles.indicator, isActive && styles.indicatorActive]} />
              <Icon
                name={item.icon}
                size={24}
                color={isActive ? '#2563eb' : colors.textSecondary}
              />
              {item.label ? (
                <View style={{ height: 4 }} />
              ) : null}
              {item.label ? (
                <IconLabel text={item.label} active={isActive} />
              ) : null}
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
    paddingBottom: 8,
  },
  bar: {
    marginHorizontal: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
    elevation: 2,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    height: 2,
    width: 24,
    borderRadius: 999,
    backgroundColor: 'transparent',
    marginBottom: 6,
  },
  indicatorActive: {
    backgroundColor: '#2563eb',
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
