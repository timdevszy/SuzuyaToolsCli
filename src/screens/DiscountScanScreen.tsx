import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDiscount } from '../hooks/useDiscount';

interface Props {
  onBack?: () => void;
}

export function DiscountScanScreen({ onBack }: Props) {
  const { config, items, isLoading, error, scanAndAdd, removeItem, clearItems } =
    useDiscount();
  const [code, setCode] = useState('');

  const handleScan = async () => {
    if (!code) {
      return;
    }
    try {
      await scanAndAdd(code);
      setCode('');
    } catch {
      // error sudah di-set di hook
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Scan Product Discount</Text>
      {config ? (
        <Text style={styles.subtitle}>
          Outlet {config.outlet} · Diskon {config.discountPercent}%
        </Text>
      ) : (
        <Text style={styles.subtitle}>Config discount belum di-set</Text>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Kode / barcode"
          value={code}
          onChangeText={setCode}
        />
        <Button title="Scan" onPress={handleScan} />
      </View>
      {isLoading && <ActivityIndicator style={{ marginVertical: 8 }} />}
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.code}</Text>
            <Text style={styles.cardText}>
              {JSON.stringify(item.data)}
            </Text>
            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              style={styles.removeButton}>
              <Text style={styles.removeButtonText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.footerRow}>
        <Button title="Clear" onPress={clearItems} />
        {onBack && <Button title="Kembali" onPress={onBack} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    backgroundColor: '#020617',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#e5e7eb',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    color: '#9ca3af',
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
