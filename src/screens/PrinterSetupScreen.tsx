import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PermissionsAndroid,
  Platform,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useDiscount } from '../hooks/useDiscount';
import {
  defaultPrinterSettings,
  printDiscountLabel,
  type DiscountLabelData,
  type PrinterSettings,
} from '../services/printerService';
import {
  scanClassicPrinters,
  connectToClassicPrinter,
  printSimpleTestLabel,
  type ClassicPrinterDevice,
  getCurrentPrinterAddress,
  getCurrentPrinterInfo,
  disconnectClassicPrinter,
} from '../services/classicPrinterService';

interface Props {
  onDone?: () => void;
}

export function PrinterSetupScreen({ onDone }: Props) {
  const [autoCut, setAutoCut] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [is88mm, setIs88mm] = useState(false);
  const [deviceType, setDeviceType] = useState<'none' | 'bluetooth' | 'usb' | 'network'>('none');
  const [deviceDropdownOpen, setDeviceDropdownOpen] = useState(false);
  const [printerName, setPrinterName] = useState('');
  const [devices, setDevices] = useState<ClassicPrinterDevice[]>([]);
  const [selectedDeviceAddress, setSelectedDeviceAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { setIsPrinterConfigured } = useDiscount();
  const [activeSlide, setActiveSlide] = useState(0);
  const { width } = useWindowDimensions();
  const slideWidth = width - 32; // container padding horizontal 16 + 16

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const index = Math.round(contentOffset.x / layoutMeasurement.width);
    setActiveSlide(index);
  };

  useEffect(() => {
    const { address, name } = getCurrentPrinterInfo();
    if (address) {
      setDeviceType('bluetooth');
      setPrinterName(name || address);
      setSelectedDeviceAddress(prev => prev || address);
      setIsConnected(true);
    }
  }, []);

  useEffect(() => {
    // Jika kita punya daftar devices dan sudah ada selectedDeviceAddress,
    // tapi printerName masih kosong atau hanya berisi address,
    // coba isi nama yang lebih ramah dari list devices.
    if (devices.length === 0 || !selectedDeviceAddress) {
      return;
    }
    const found = devices.find(d => d.address === selectedDeviceAddress);
    if (found) {
      const currentName = printerName?.trim();
      if (!currentName || currentName === selectedDeviceAddress) {
        setPrinterName(found.name || found.address);
      }
    }
  }, [devices, selectedDeviceAddress, printerName]);

  const handleSave = () => {
    // Untuk sekarang hanya simpan di state lokal / nanti bisa ke storage
    // dan integrasi dengan library printer beneran.
    // eslint-disable-next-line no-console
    console.log('[ClassicPrinter] Printer setup disimpan:', {
      autoCut,
      showDate,
      is88mm,
      deviceType,
      printerName,
      selectedDeviceAddress,
    });
    setIsPrinterConfigured(true);
  };

  const primaryButtonLabel =
    deviceType === 'bluetooth' && isConnected ? 'Disconnect' : 'Connect';

  return (
    <View style={styles.container}>
      {deviceDropdownOpen && (
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPress={() => setDeviceDropdownOpen(false)}
        />
      )}

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}>

        {/* Section: options */}
        <View style={styles.sectionCard}>
        <View style={styles.checkboxRow}>
          <Checkbox checked={autoCut} label="Auto Cut" onToggle={() => setAutoCut(v => !v)} />
          <Checkbox
            checked={showDate}
            label="Tanggal Cetak"
            onToggle={() => setShowDate(v => !v)}
          />
          <Checkbox
            checked={is88mm}
            label="Printer 88mm"
            onToggle={() => setIs88mm(v => !v)}
          />
        </View>

        <View style={styles.deviceRow}>
          <View style={styles.deviceSelectColumn}>
            <Text style={styles.label}>Device</Text>
            <TouchableOpacity
              style={styles.dropdown}
              activeOpacity={0.8}
              onPress={() => setDeviceDropdownOpen(v => !v)}>
              <Text style={styles.dropdownText}>
                {deviceType === 'none'
                  ? 'None'
                  : deviceType === 'bluetooth'
                  ? 'Bluetooth'
                  : deviceType === 'usb'
                  ? 'USB'
                  : 'Network'}
              </Text>
              <Text style={styles.dropdownIcon}>▾</Text>
            </TouchableOpacity>

            {deviceDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {[
                  { key: 'bluetooth', label: 'Bluetooth' },
                  { key: 'usb', label: 'USB' },
                  { key: 'network', label: 'Network' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setDeviceType(opt.key as any);
                      setDeviceDropdownOpen(false);
                    }}>
                    <Text style={styles.dropdownItemText}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.deviceButtons}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={async () => {
                try {
                  if (Platform.OS === 'android' && Platform.Version >= 31) {
                    const connectGranted = await PermissionsAndroid.request(
                      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    );
                    const scanGranted = await PermissionsAndroid.request(
                      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    );

                    if (
                      connectGranted !== PermissionsAndroid.RESULTS.GRANTED ||
                      scanGranted !== PermissionsAndroid.RESULTS.GRANTED
                    ) {
                      // eslint-disable-next-line no-console
                      console.warn('Izin Bluetooth (CONNECT/SCAN) ditolak');
                      return;
                    }
                  }

                  const list = await scanClassicPrinters();
                  setDevices(list);
                  setSelectedDeviceAddress(list[0]?.address ?? null);
                  // eslint-disable-next-line no-console
                  console.log('[ClassicPrinter] Devices:', list);
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.warn('[ClassicPrinter] Scan printer klasik gagal', err);
                }
              }}>
              <Text style={styles.outlineButtonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, { marginLeft: 8 }]}
              onPress={async () => {
                if (deviceType === 'bluetooth') {
                  if (isConnected && (printerName || selectedDeviceAddress)) {
                    // Disconnect flow
                    const current = getCurrentPrinterAddress();
                    if (!current) {
                      Alert.alert(
                        'Tidak terhubung',
                        'Tidak ada printer yang sedang terhubung.',
                      );
                      return;
                    }
                    try {
                      await disconnectClassicPrinter();
                      setPrinterName('');
                      setSelectedDeviceAddress(null);
                      setIsPrinterConfigured(false);
                      setIsConnected(false);
                      Alert.alert('Printer terputus', 'Koneksi ke printer telah diputus.');
                    } catch (e) {
                      // eslint-disable-next-line no-console
                      console.warn('[ClassicPrinter] Gagal disconnect printer klasik', e);
                    }
                  } else {
                    // Connect flow
                    if (devices.length === 0) {
                      Alert.alert(
                        'Belum ada printer',
                        'Silakan tekan Refresh lalu pilih printer terlebih dahulu.',
                      );
                      return;
                    }
                    try {
                      const target =
                        devices.find(d => d.address === selectedDeviceAddress) ??
                        devices[0];
                      await connectToClassicPrinter(target.address, target.name || target.address);
                      setPrinterName(target.name || target.address);
                      setIsConnected(true);
                      handleSave();
                      Alert.alert(
                        'Printer terhubung',
                        'Printer berhasil terhubung dan disimpan sebagai default.',
                        [
                          {
                            text: 'OK',
                            onPress: () => {
                              if (onDone) {
                                onDone();
                              }
                            },
                          },
                        ],
                        { cancelable: false },
                      );
                    } catch (e) {
                      // eslint-disable-next-line no-console
                      console.warn('[ClassicPrinter] Gagal connect ke printer klasik', e);
                    }
                  }
                } else {
                  // Non-bluetooth: hanya simpan pengaturan
                  handleSave();
                  Alert.alert(
                    'Pengaturan disimpan',
                    'Pengaturan printer berhasil disimpan.',
                    [
                      {
                        text: 'OK',
                        onPress: () => {
                          if (onDone) {
                            onDone();
                          }
                        },
                      },
                    ],
                    { cancelable: false },
                  );
                }
              }}>
              <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {deviceType === 'bluetooth' && isConnected && (printerName || selectedDeviceAddress) && (() => {
        const displayName =
          devices.find(d => d.address === selectedDeviceAddress)?.name ||
          printerName ||
          selectedDeviceAddress;
        return (
          <View style={styles.connectedCard}>
            <Text style={styles.connectedTitle}>Printer terhubung</Text>
            <Text style={styles.connectedName}>{displayName}</Text>
            {selectedDeviceAddress ? (
              <Text style={styles.connectedAddress}>{selectedDeviceAddress}</Text>
            ) : null}
          </View>
        );
      })()}

      {deviceType === 'bluetooth' && devices.length > 0 && (
        <View style={styles.devicesListCard}>
          <Text style={styles.devicesListTitle}>Pilih Printer Bluetooth</Text>
          <ScrollView style={styles.devicesList}>
            {devices.map(d => {
              const isSelected = d.address === selectedDeviceAddress;
              return (
                <TouchableOpacity
                  key={d.address}
                  style={[
                    styles.deviceItem,
                    isSelected && styles.deviceItemSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDeviceAddress(d.address)}>
                  <View>
                    <Text style={styles.deviceItemName}>{d.name || 'Unknown'}</Text>
                    <Text style={styles.deviceItemAddress}>{d.address}</Text>
                  </View>
                  {isSelected && <Text style={styles.deviceItemSelectedMark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Section: label previews (slider) */}
      <View style={styles.labelsSliderWrapper}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ width: slideWidth }}
          contentContainerStyle={{ alignItems: 'stretch' }}>
          <LabelPreview
            index={0}
            title="Print Test 1"
            slideWidth={slideWidth}
            onPress={async () => {
              await printSimpleTestLabel();
            }}
          />
          <LabelPreview
            index={1}
            title="Print Test 2"
            slideWidth={slideWidth}
            onPress={async () => {
              const label: DiscountLabelData = {
                productName: 'VARIAN LAIN DISKON',
                internalCode: 'B0021777010251',
                barcode: '1777010251',
                unitLabel: '1 PCS',
                normalPrice: 60000,
                discountPrice: 42000,
              };

              const settings: PrinterSettings = {
                ...defaultPrinterSettings,
                labelWidth: is88mm ? 576 : 384,
              };

              await printDiscountLabel(label, settings);
            }}
          />
          <LabelPreview
            index={2}
            title="Print Test 3"
            slideWidth={slideWidth}
            onPress={async () => {
              const label: DiscountLabelData = {
                productName: 'PRODUK UJI COBA 3',
                internalCode: 'C0021777010252',
                barcode: '1777010252',
                unitLabel: '1 PCS',
                normalPrice: 75000,
                discountPrice: 52500,
              };

              const settings: PrinterSettings = {
                ...defaultPrinterSettings,
                labelWidth: is88mm ? 576 : 384,
              };

              await printDiscountLabel(label, settings);
            }}
          />
        </ScrollView>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[
                styles.dot,
                activeSlide === i && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

interface CheckboxProps {
  checked: boolean;
  label: string;
  onToggle: () => void;
}

function Checkbox({ checked, label, onToggle }: CheckboxProps) {
  return (
    <TouchableOpacity style={styles.checkbox} activeOpacity={0.8} onPress={onToggle}>
      <Text style={styles.checkboxLabel}>{label}</Text>
      <View style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}>
        {checked && <Text style={styles.checkboxTick}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

interface LabelPreviewProps {
  index: number;
  title: string;
  slideWidth: number;
  onPress: () => void;
}

function LabelPreview({ title, slideWidth, onPress }: LabelPreviewProps) {
  const code = 'A0021777010250';
  const oldPrice = '50.000';
  const newPrice = '35.000';

  return (
    <View style={[styles.labelSlide, { width: slideWidth }] }>
      <View style={styles.labelCard}>
        <View style={styles.barcodeBox}>
          <Text style={styles.barcodePlaceholder}>[ CODE128 BARCODE ]</Text>
        </View>
        <Text style={styles.labelCode}>{code}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Harga:</Text>
          <Text style={styles.oldPrice}>Rp {oldPrice}</Text>
          <Text style={styles.newPrice}>Rp {newPrice}</Text>
        </View>
        <View style={styles.labelFooterRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onPress}>
            <Text style={styles.secondaryButtonText}>{title}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  checkboxRow: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxTick: {
    color: '#ffffff',
    fontSize: 14,
  },
  checkboxLabel: {
    fontSize: 13,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  deviceSelectColumn: {
    flex: 1,
    position: 'relative',
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 14,
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#6b7280',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemText: {
    fontSize: 14,
  },
  deviceButtons: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  outlineButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9ca3af',
    marginRight: 4,
  },
  outlineButtonText: {
    fontSize: 13,
    color: '#374151',
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  labelsSliderWrapper: {
    marginTop: 20,
    marginBottom: 24,
  },
  labelSlide: {
    width: '100%',
    alignItems: 'center',
  },
  labelCard: {
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: undefined as any,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  barcodeBox: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  barcodePlaceholder: {
    fontSize: 11,
    color: '#6b7280',
  },
  labelCode: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: '#374151',
    marginRight: 4,
  },
  labelFooterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  oldPrice: {
    fontSize: 13,
    color: '#6b7280',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  newPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  secondaryButton: {
    marginTop: 4,
    alignSelf: 'stretch',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  secondaryButtonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  connectedCard: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  connectedTitle: {
    fontSize: 12,
    color: '#0369a1',
    marginBottom: 2,
  },
  connectedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  connectedAddress: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  devicesListCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  devicesListTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  devicesList: {
    maxHeight: 160,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  deviceItemSelected: {
    backgroundColor: '#eff6ff',
  },
  deviceItemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  deviceItemAddress: {
    fontSize: 12,
    color: '#6b7280',
  },
  deviceItemSelectedMark: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '700',
    marginLeft: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: '#2563eb',
  },
});
