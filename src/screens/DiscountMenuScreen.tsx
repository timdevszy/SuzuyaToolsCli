import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../ui/theme';
import { PrinterSetupScreen } from './PrinterSetupScreen';
import { DiscountConfigScreen } from './DiscountConfigScreen';
import { DiscountScanScreen } from './DiscountScanScreen';
import { Icon } from '../ui/Icon';

type DiscountView = 'menu' | 'printer' | 'config' | 'scan';

interface Props {
  onClose: () => void;
}

export function DiscountMenuScreen({ onClose }: Props) {
  const [view, setView] = useState<DiscountView>('menu');

  if (view === 'printer') {
    return <PrinterSetupScreen onDone={() => setView('menu')} />;
  }

  if (view === 'config') {
    return <DiscountConfigScreen onDone={() => setView('menu')} />;
  }

  if (view === 'scan') {
    return <DiscountScanScreen onBack={() => setView('menu')} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Discount</Text>
        <Text style={styles.subtitle}>Pilih menu untuk mengelola promo dan scanning produk.</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.menuGrid}>
          <MenuItem
            icon="Scan"
            label="Scan product"
            onPress={() => setView('scan')}
          />
          <MenuItem
            icon="Config"
            label="Setup discount"
            onPress={() => setView('config')}
          />
          <MenuItem
            icon="Printer"
            label="Setup printer"
            onPress={() => setView('printer')}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>Tutup</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={onPress}>
      <Icon name={icon} size={28} color="#2563eb" />
      <Text style={styles.menuItemLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  info: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    bottom: 24,
  },
  closeText: {
    fontSize: 14,
    color: '#2563eb',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '25%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
    color: colors.textPrimary,
  },
});
