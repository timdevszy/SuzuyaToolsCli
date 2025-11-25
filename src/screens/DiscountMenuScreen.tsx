import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../ui/theme';
import { Icon } from '../ui/Icon';

interface DiscountMenuScreenProps {
  onOpenPrinter: () => void;
  onOpenConfig: () => void;
  onOpenScan: () => void;
}

export function DiscountMenuScreen({ onOpenPrinter, onOpenConfig, onOpenScan }: DiscountMenuScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.body}>
        <View style={styles.emptyState}>
          <Text style={styles.title}>Discount</Text>
          <Text style={styles.subtitle}>
            Pilih menu untuk mengelola promo dan scanning produk.
          </Text>
        </View>

      </View>

      {menuOpen && (
        <View style={styles.dialOverlay}>
          {/* Tap di area kosong akan menutup menu */}
          <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <View style={styles.dialContainer}>
            <TouchableOpacity
              style={styles.dialItemRow}
              activeOpacity={0.85}
              onPress={onOpenPrinter}>
            <View style={styles.dialLabelChip}>
              <Text style={styles.dialLabelText}>Setup printer</Text>
            </View>
            <View style={styles.dialIconCircle}>
              <Icon name="printer" size={20} color="#2563eb" />
            </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dialItemRow}
              activeOpacity={0.85}
              onPress={onOpenConfig}>
            <View style={styles.dialLabelChip}>
              <Text style={styles.dialLabelText}>Setup discount</Text>
            </View>
            <View style={styles.dialIconCircle}>
              <Icon name="discount" size={20} color="#2563eb" />
            </View>
          </TouchableOpacity>

            <TouchableOpacity
              style={styles.dialItemRow}
              activeOpacity={0.85}
              onPress={onOpenScan}>
            <View style={styles.dialLabelChip}>
              <Text style={styles.dialLabelText}>Scan product</Text>
            </View>
            <View style={styles.dialIconCircle}>
              <Icon name="scan" size={20} color="#2563eb" />
            </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.fabContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.fabButton}
          onPress={() => setMenuOpen(prev => !prev)}>
          <Text style={styles.fabLabel}>{menuOpen ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 0,
    paddingHorizontal: 16,
  },
  dialOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  dialContainer: {
    position: 'absolute',
    right: 5,
    bottom: 80,
    alignItems: 'flex-end',
  },
  dialItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  dialLabelChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dialLabelText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  dialIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialIconText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Style cadangan untuk MenuItem grid (saat ini tidak digunakan di speed-dial,
  // tapi tetap disediakan karena komponen MenuItem mereferensikan style ini).
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  fabContainer: {
    position: 'absolute',
    right: 0,
    bottom: 10,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabLabel: {
    fontSize: 28,
    color: '#ffffff',
    marginTop: -2,
  },
});
