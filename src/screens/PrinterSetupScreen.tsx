import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { useDiscount } from '../hooks/useDiscount';

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
  const { setIsPrinterConfigured } = useDiscount();
  const [activeSlide, setActiveSlide] = useState(0);
  const { width } = useWindowDimensions();
  const slideWidth = width - 32; // container padding horizontal 16 + 16

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const index = Math.round(contentOffset.x / layoutMeasurement.width);
    setActiveSlide(index);
  };

  const handleSave = () => {
    // Untuk sekarang hanya simpan di state lokal / nanti bisa ke storage
    // dan integrasi dengan library printer beneran.
    // eslint-disable-next-line no-console
    console.log('Printer setup (dummy):', {
      autoCut,
      showDate,
      is88mm,
      deviceType,
      printerName,
    });
    setIsPrinterConfigured(true);
    if (onDone) {
      onDone();
    }
  };

  return (
    <View style={styles.container}>
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
            <TouchableOpacity style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
          <LabelPreview index={0} title="Print Test 1" slideWidth={slideWidth} />
          <LabelPreview index={1} title="Print Test 2" slideWidth={slideWidth} />
          <LabelPreview index={2} title="Print Test 3" slideWidth={slideWidth} />
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
}

function LabelPreview({ title, slideWidth }: LabelPreviewProps) {
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
          <TouchableOpacity style={styles.secondaryButton}>
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
    marginRight: 8,
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
    alignItems: 'stretch',
  },
  labelCard: {
    alignSelf: 'flex-start',
    width: '90%',
    maxWidth: 360,
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
