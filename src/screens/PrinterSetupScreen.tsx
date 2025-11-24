import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';

interface Props {
  onDone?: () => void;
}

export function PrinterSetupScreen({ onDone }: Props) {
  const [printerName, setPrinterName] = useState('');

  const handleSave = () => {
    // Untuk sekarang hanya simpan di state lokal / nanti bisa ke storage
    // dan integrasi dengan library printer beneran.
    // eslint-disable-next-line no-console
    console.log('Selected printer (dummy):', printerName);
    if (onDone) {
      onDone();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setup Printer</Text>
      <Text style={styles.text}>
        Untuk sementara, masukkan nama printer sebagai placeholder. Nanti bisa
        diganti dengan pemilihan printer Bluetooth/USB yang sesungguhnya.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nama printer"
        value={printerName}
        onChangeText={setPrinterName}
      />
      <Button title="Simpan" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
});
