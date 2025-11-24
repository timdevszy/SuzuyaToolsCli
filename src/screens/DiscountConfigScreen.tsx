import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { useDiscount } from '../hooks/useDiscount';

interface Props {
  onDone?: () => void;
}

export function DiscountConfigScreen({ onDone }: Props) {
  const { config, updateConfig } = useDiscount();
  const [outlet, setOutlet] = useState(config?.outlet ?? '2009');
  const [discountPercent, setDiscountPercent] = useState(
    config?.discountPercent ?? '50',
  );

  const handleSave = () => {
    updateConfig({ outlet, discountPercent });
    if (onDone) {
      onDone();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setup Discount</Text>
      <TextInput
        style={styles.input}
        placeholder="Outlet code"
        value={outlet}
        onChangeText={setOutlet}
      />
      <TextInput
        style={styles.input}
        placeholder="Discount %"
        keyboardType="numeric"
        value={discountPercent}
        onChangeText={setDiscountPercent}
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
});
