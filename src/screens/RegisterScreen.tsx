import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import type { RegisterPayload } from '../services/authService';

interface Props {
  onRegisterSuccess?: () => void;
  onNavigateLogin?: () => void;
}

export function RegisterScreen({ onRegisterSuccess, onNavigateLogin }: Props) {
  const { register, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [jabatan, setJabatan] = useState('Staff');
  const [divisi, setDivisi] = useState('');

  const handleRegister = async () => {
    const payload: RegisterPayload = {
      username,
      password,
      password_confirmation: passwordConfirmation,
      jabatan,
      divisi,
      brands: [],
      outlet_choice: [],
    };

    try {
      await register(payload);
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch {
      // error sudah di-handle di hook
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Konfirmasi Password"
        secureTextEntry
        value={passwordConfirmation}
        onChangeText={setPasswordConfirmation}
      />
      <TextInput
        style={styles.input}
        placeholder="Jabatan"
        value={jabatan}
        onChangeText={setJabatan}
      />
      <TextInput
        style={styles.input}
        placeholder="Divisi"
        value={divisi}
        onChangeText={setDivisi}
      />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}
      <View style={styles.registerRow}>
        <Text>Sudah punya akun?</Text>
        <Text style={styles.registerLink} onPress={onNavigateLogin}>
          {' '}Login
        </Text>
      </View>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  registerRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerLink: {
    color: 'blue',
  },
});
