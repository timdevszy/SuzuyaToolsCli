import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { useDiscount } from '../hooks/useDiscount';
import { Icon } from '../ui/Icon';

interface Props {
  onBack?: () => void;
}

export function DiscountScanScreen({ onBack }: Props) {
  const {
    config,
    isLoading,
    error,
    scanAndAdd,
  } = useDiscount();
  const [code, setCode] = useState('');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  const handleScan = async () => {
    if (!code) {
      return;
    }
    console.log('[Discount] Scan product requested (manual input)', { code });
    try {
      await scanAndAdd(code);
      console.log('[Discount] Scan product success (manual input)', { code });
      setCode('');

      Alert.alert(
        'Berhasil',
        'Produk berhasil ditambahkan ke daftar discount.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ],
        { cancelable: false },
      );
    } catch (e) {
      console.log('[Discount] Scan product failed (manual input)', {
        code,
        error: e,
      });

      const message = error || 'Produk tidak ditemukan atau terjadi kesalahan saat scan.';
      Alert.alert('Gagal', message);
    }
  };

  const handleBarcodeRead = async (event: any) => {
    if (isScanning) {
      return;
    }
    const payload = event?.nativeEvent || event || {};
    console.log('[Discount] Camera raw event', payload);
    const format = String((payload as any).codeFormat || '').toLowerCase();
    if (format === 'qr') {
      // Ignore QR codes; backend expects linear barcodes (e.g. EAN-13/Code128)
      return;
    }
    const scannedRaw =
      (payload as any).codeStringValue ?? event?.codeStringValue ?? event?.data ?? '';
    const scanned = String(scannedRaw).trim();
    if (!scanned) {
      return;
    }

    console.log('[Discount] Barcode detected from camera', { code: scanned });
    setIsScanning(true);

    try {
      await scanAndAdd(scanned);
      console.log('[Discount] Scan product success (camera)', { code: scanned });
      setCameraVisible(false);
      setCode('');
      Alert.alert(
        'Berhasil',
        'Produk berhasil ditambahkan ke daftar discount.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ],
        { cancelable: false },
      );
    } catch (e) {
      console.log('[Discount] Scan product failed (camera)', { code: scanned, error: e });
      const message = error || 'Produk tidak ditemukan atau terjadi kesalahan saat scan.';
      Alert.alert('Gagal', message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan produk discount</Text>
        {config ? (
          <View style={styles.badgeRow}>
            <Text style={styles.badgeLabel}>Outlet:</Text>
            <View style={styles.badgePill}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>{config.outlet}</Text>
            </View>
            <Text style={[styles.badgeLabel, { marginLeft: 8 }]}>Diskon:</Text>
            <View style={styles.badgePill}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>{config.discountPercent}%</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.subtitle}>Config discount belum di-set</Text>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.centerBlock}>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.iconButton, styles.cameraButton]}
            activeOpacity={0.8}
            onPress={() => {
              console.log('[Discount] Open camera modal for scan');
              setCameraVisible(true);
            }}>
            <Icon name="qr" size={22} color="#2563eb" />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="Kode barcode / kode internal"
            value={code}
            onChangeText={setCode}
          />
          <TouchableOpacity
            style={[styles.iconButton, styles.searchButton]}
            activeOpacity={0.8}
            onPress={handleScan}>
            <Icon name="search" size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>
        {isLoading && <ActivityIndicator style={{ marginVertical: 8 }} />}
      </View>

      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => {
          console.log('[Discount] Close camera modal (back press)');
          setCameraVisible(false);
        }}>
        <View style={styles.cameraModalRoot}>
          <View style={styles.cameraPreviewWrapper}>
            <Camera
              style={styles.cameraPreview}
              cameraType={CameraType.Back}
              scanBarcode
              onReadCode={handleBarcodeRead}
              showFrame
              frameColor="#22c55e"
              laserColor="#22c55e"
              flashMode={flashOn ? ('torch' as any) : ('off' as any)}
              onError={event => {
                console.log('[Discount] Camera error', event?.nativeEvent || event);
              }}
            />

            {/* Masker: hanya area tengah (jendela) yang terang, luar gelap lembut */}
            <View pointerEvents="none" style={styles.cameraMask}>
              <View style={styles.maskTop} />
              <View style={styles.maskCenterRow}>
                <View style={styles.maskSide} />
                <View style={styles.maskHole} />
                <View style={styles.maskSide} />
              </View>
              <View style={styles.maskBottom} />
            </View>
          </View>

          <View style={styles.cameraControlsRow}>
            <TouchableOpacity
              style={styles.flashButton}
              activeOpacity={0.8}
              onPress={() => {
                const next = !flashOn;
                console.log('[Discount] Toggle flash', { next });
                setFlashOn(next);
              }}>
              <Icon name="flash" size={18} color="#fbbf24" />
              <Text style={styles.flashButtonText}>{flashOn ? 'Flash ON' : 'Flash OFF'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraCloseButton}
              activeOpacity={0.8}
              onPress={() => {
                console.log('[Discount] Close camera modal (button)');
                setCameraVisible(false);
              }}>
              <Text style={styles.cameraCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    color: '#111827',
  },
  centerBlock: {
    paddingVertical: 4,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    color: '#6b7280',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#ecfdf3',
    marginHorizontal: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#111827',
  },
  badgeLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginRight: 4,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  codeInput: {
    flex: 1,
    marginRight: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#ffffff',
  },
  cameraButton: {
    borderColor: '#2563eb',
  },
  searchButton: {
    backgroundColor: '#ffffff',
    borderColor: '#2563eb',
  },
  cameraModalRoot: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
    justifyContent: 'center',
  },
  cameraPreviewWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cameraPreview: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cameraMask: {
    ...StyleSheet.absoluteFillObject,
  },
  maskTop: {
    flex: 1.1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  maskCenterRow: {
    flexDirection: 'row',
    height: '21%',
  },
  maskSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  maskHole: {
    width: '80%',
    height: '100%',
  },
  maskBottom: {
    flex: 1.1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cameraControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  flashButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#fbbf24',
    flexDirection: 'row',
    alignItems: 'center',
  },
  flashButtonText: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  cameraCloseButton: {
    marginTop: 16,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#2563eb',
  },
  cameraCloseText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
