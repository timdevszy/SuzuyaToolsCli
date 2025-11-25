import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { PrinterSetupScreen } from './PrinterSetupScreen';
import { DiscountConfigScreen } from './DiscountConfigScreen';
import { DiscountScanScreen } from './DiscountScanScreen';
import { DiscountMenuScreen } from './DiscountMenuScreen';
import { ProductSearchScreen } from './ProductSearchScreen';
import { colors } from '../ui/theme';
import { BottomNavBar } from '../ui/BottomNavBar';
import { Icon } from '../ui/Icon';
import { CurvedHeader } from '../ui/CurvedHeader';
import { DiscountProvider } from '../hooks/useDiscount';

type HomeScreenView = 'home' | 'printer' | 'config' | 'scan' | 'discount' | 'profile';

export function HomeScreen() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<HomeScreenView>('home');
  const [scanModalVisible, setScanModalVisible] = useState(false);

  const getTitleForView = () => {
    if (view === 'discount') return 'Discount';
    if (view === 'printer') return 'Setup Printer';
    if (view === 'config') return 'Setup Discount';
    if (view === 'scan') return 'Scan Product';
    if (view === 'profile') return 'Profile';
    return '';
  };

  const handleBack = () => {
    if (view === 'discount') {
      setView('home');
    } else if (view === 'printer' || view === 'config' || view === 'scan') {
      setView('discount');
    } else if (view === 'profile') {
      setView('home');
    }
  };

  const getActiveOutletCode = () => {
    if (!user) return '';
    if (user.default_outlet) return String(user.default_outlet);
    const outletArr = (user as any).outlet as
      | Array<{ outlet_code: string; outlet_name: string }>
      | undefined;
    if (Array.isArray(outletArr) && outletArr.length > 0) {
      return outletArr[0].outlet_code;
    }
    return '';
  };

  return (
    <View style={styles.screen}>
      {/* Status bar: terang di atas biru (home), gelap di atas putih (halaman lain) */}
      <StatusBar
        barStyle={view === 'home' ? 'light-content' : 'dark-content'}
        backgroundColor={view === 'home' ? '#2196f3' : colors.background}
      />
      <SafeAreaView
        edges={['top']}
        style={view === 'home' ? styles.topSafeArea : styles.topSafeAreaPlain}>
        {view === 'home' ? (
          <CurvedHeader
            title=""
            name={user?.name}
            subtitle={user?.jabatan}
            outletCode={getActiveOutletCode()}
          />
        ) : (
          <View style={styles.appBar}>
            {/* Left: default back button */}
            <TouchableOpacity
              style={styles.appBarBack}
              activeOpacity={0.7}
              onPress={handleBack}>
              <Text style={styles.appBarBackText}>{'\u2190'}</Text>
            </TouchableOpacity>

            {/* Center: title */}
            <View style={styles.appBarTitleContainer}>
              <Text style={styles.appBarTitle}>{getTitleForView()}</Text>
            </View>

            {/* Right: default_outlet badge (non-clickable) */}
            <View style={styles.appBarBadge}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#22c55e',
                  marginRight: 6,
                }}
              />
              <Text style={styles.appBarBadgeText}>{getActiveOutletCode()}</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
      <View style={styles.body}>
        <View style={styles.root}>
          <View
            style={[
              styles.contentCard,
              view !== 'home' && styles.contentCardPlain,
            ]}>
            {view === 'home' && (
              <View style={styles.menuGrid}>
                {[
                  { key: 'stockInfo', label: 'Stock Info', icon: 'stock' },
                  { key: 'discount', label: 'Discount', icon: 'discount' },
                  { key: 'monitoring', label: 'Monitoring', icon: 'monitor' },
                  { key: 'priceChange', label: 'Price Change', icon: 'price' },
                  { key: 'archiveDoc', label: 'Archive Doc', icon: 'archive' },
                ].map(item => (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.menuItem}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (item.key === 'discount') {
                        setView('discount');
                      } else {
                        Alert.alert(item.label, 'Fitur ini belum diimplementasikan.');
                      }
                    }}>
                    <Icon name={item.icon} size={28} color="#2563eb" />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <DiscountProvider>
              {view === 'discount' && (
                <DiscountMenuScreen
                  onOpenPrinter={() => setView('printer')}
                  onOpenConfig={() => setView('config')}
                  onOpenScan={() => setView('scan')}
                />
              )}

              {view === 'printer' && (
                <PrinterSetupScreen onDone={() => setView('home')} />
              )}

              {view === 'config' && (
                <DiscountConfigScreen onDone={() => setView('discount')} />
              )}

              {view === 'scan' && <DiscountScanScreen onBack={() => setView('home')} />}
            </DiscountProvider>

            {view === 'profile' && (
              <View style={{ flex: 1, paddingTop: 8 }}>
                <Text style={styles.sectionTitle}>Profil</Text>
                <Text style={{ marginBottom: 16 }}>
                  {user?.name} ({getActiveOutletCode()})
                </Text>
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: '#ef4444',
                    alignSelf: 'flex-start',
                  }}
                  onPress={logout}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
          <BottomNavBar
            activeKey={scanModalVisible ? 'scan' : 'home'}
            items={[
              { key: 'home', icon: 'home', label: 'Home' },
              { key: 'scan', icon: 'scan', label: 'Scan' },
              { key: 'profile', icon: 'profile', label: 'Profile' },
            ]}
            onPress={key => {
              if (key === 'scan') {
                setScanModalVisible(true);
              } else if (key === 'profile') {
                setView('profile');
              } else {
                setView('home');
              }
            }}
          />
        </SafeAreaView>
      </View>

      <Modal
        visible={scanModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setScanModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setScanModalVisible(false)}>
          <View style={styles.scanModalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.scanModalContainer}>
                <ProductSearchScreen onBack={() => setScanModalVisible(false)} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  topSafeAreaPlain: {
    backgroundColor: colors.background,
  },
  contentCardPlain: {
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 0,
  },
  scanModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  scanModalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  appBarBack: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  appBarBackText: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  appBarTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  appBarBadge: {
    minWidth: 60,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(226, 232, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 255, 0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1d4ed8',
  },
});
