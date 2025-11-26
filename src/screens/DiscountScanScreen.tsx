import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useDiscount } from '../hooks/useDiscount';
import { Icon } from '../ui/Icon';

interface Props {
  onBack?: () => void;
}

export function DiscountScanScreen({ onBack }: Props) {
  const {
    config,
    items,
    isLoading,
    error,
    scanAndAdd,
    removeItem,
    clearItems,
  } = useDiscount();
  const [code, setCode] = useState('');
  const [cameraVisible, setCameraVisible] = useState(false);

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
            onPress: () => {
              if (onBack) {
                onBack();
              }
            },
          },
        ],
        { cancelable: false },
      );
    } catch (e) {
      console.log('[Discount] Scan product failed (manual input)', {
        code,
        error: e,
      });
      // error sudah di-set di hook
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.centerBlock}>
        {config ? (
          <Text style={styles.subtitle}>
            Outlet {config.outlet} · Diskon {config.discountPercent}%
          </Text>
        ) : (
          <Text style={styles.subtitle}>Config discount belum di-set</Text>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.iconButton}
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

      {items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.code}</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('[Discount] Remove scanned item', {
                    id: item.id,
                    code: item.code,
                    data: item.data,
                  });
                  removeItem(item.id);
                }}
                style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => {
          console.log('[Discount] Close camera modal (back press)');
          setCameraVisible(false);
        }}>
        <View style={styles.cameraModalRoot}>
          <View style={styles.cameraPreview}>
            <Text style={styles.cameraText}>[ Area Kamera untuk Scan Barcode ]</Text>
          </View>
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
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    color: '#6b7280',
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
  cameraPreview: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraText: {
    color: '#e5e7eb',
    fontSize: 16,
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
  list: {
    paddingVertical: 8,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#0b1120',
    borderWidth: 1,
    borderColor: '#1f2933',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#f9fafb',
  },
  cardText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  removeButton: {
    alignSelf: 'flex-end',
  },
  removeButtonText: {
    color: 'red',
  },
});
