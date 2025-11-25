import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useDiscount } from '../hooks/useDiscount';

interface Props {
  onDone?: () => void;
}

export function DiscountConfigScreen({ onDone }: Props) {
  const { config, updateConfig, setIsDiscountConfigured } = useDiscount();
  const outlet = config?.outlet ?? '2009';
  const [discountPercent, setDiscountPercent] = useState(
    config?.discountPercent ?? '',
  );
  const [description, setDescription] = useState(config?.description ?? '');

  const handleSave = () => {
    if (!description.trim()) {
      Alert.alert('Keterangan wajib diisi', 'Silakan isi keterangan untuk setup discount.');
      return;
    }
    updateConfig({
      outlet,
      discountPercent,
      description,
    });
    setIsDiscountConfigured(true);
    Alert.alert('Berhasil disimpan', 'Konfigurasi discount sudah tersimpan.', [
      {
        text: 'OK',
        onPress: () => {
          if (onDone) {
            onDone();
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionCard}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Diskon / Harga Spesial (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: 10"
            keyboardType="numeric"
            value={discountPercent}
            onChangeText={setDiscountPercent}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Keterangan</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Catatan tambahan"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.outlineButton}
            activeOpacity={0.8}
            onPress={onDone}>
            <Text style={styles.outlineButtonText}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Simpan</Text>
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
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  outlineButton: {
    paddingHorizontal: 16,
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
});
