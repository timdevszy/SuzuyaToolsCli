import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { PrinterSetupScreen } from './PrinterSetupScreen';
import { DiscountConfigScreen } from './DiscountConfigScreen';
import { DiscountScanScreen } from './DiscountScanScreen';
import { DiscountMenuScreen } from './DiscountMenuScreen';
import { colors } from '../ui/theme';
import { BottomNavBar } from '../ui/BottomNavBar';
import { Icon } from '../ui/Icon';
import { CurvedHeader } from '../ui/CurvedHeader';

type HomeScreenView = 'home' | 'printer' | 'config' | 'scan' | 'discount';

export function HomeScreen() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<HomeScreenView>('home');

  if (view === 'printer') {
    return <PrinterSetupScreen onDone={() => setView('home')} />;
  }

  if (view === 'config') {
    return <DiscountConfigScreen onDone={() => setView('home')} />;
  }

  if (view === 'scan') {
    return <DiscountScanScreen onBack={() => setView('home')} />;
  }

  if (view === 'discount') {
    return <DiscountMenuScreen onClose={() => setView('home')} />;
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <CurvedHeader
          title=""
          name={user?.name}
          subtitle={user?.jabatan}
        />
      </SafeAreaView>
      <View style={styles.body}>
        <View style={styles.root}>
          <View style={styles.contentCard}>
            <View style={styles.menuGrid}>
              {[
                { key: 'discount', label: 'Discount' },
                { key: 'productInternal', label: 'Product internal' },
                { key: 'productSupplier', label: 'Product supplier' },
                { key: 'dayliSales', label: 'Daily sales' },
                { key: 'group', label: 'Group' },
                { key: 'subgroup', label: 'Subgroup' },
                { key: 'newProduct', label: 'New product' },
                { key: 'scanDiscount', label: 'Scan discount' },
                { key: 'createDiscount', label: 'Create discount' },
              ].map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuItem}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (item.key === 'discount') {
                      setView('discount');
                    } else if (item.key === 'scanDiscount') {
                      setView('scan');
                    } else if (item.key === 'createDiscount') {
                      setView('discount');
                    }
                  }}>
                  <Icon name={item.label} size={28} color="#2563eb" />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
          <BottomNavBar
            activeKey={view === 'scan' ? 'scan' : 'home'}
            items={[
              { key: 'home', icon: 'home', label: 'Home' },
              { key: 'scan', icon: 'qr-code-scanner', label: 'Scan' },
              { key: 'logout', icon: 'logout', label: 'Logout' },
            ]}
            onPress={key => {
              if (key === 'logout') {
                logout();
              } else if (key === 'scan') {
                setView('scan');
              } else {
                setView('home');
              }
            }}
          />
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topSafeArea: {
    backgroundColor: '#2196f3',
  },
  body: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bottomSafeArea: {
    backgroundColor: colors.background,
  },
  root: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: colors.background,
  },
  contentCard: {
    flex: 1,
    marginTop: -32,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
  menuLabel: {
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  appBar: {
    height: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
