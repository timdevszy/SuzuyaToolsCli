import React, { useState } from 'react';
import {
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Screen } from '../ui/Screen';
import { Card } from '../ui/Card';
import { colors } from '../ui/theme';

interface Props {
  onLoginSuccess?: () => void;
}

export function LoginScreen({ onLoginSuccess }: Props) {
  const { login, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(username, password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch {
      // error sudah di-handle di hook
    }
  };

  return (
    <Screen>
      <Card>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Suzuya Tools</Text>
        <Text style={styles.title}>Masuk</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.registerInfo}>
          Pembuatan akun baru sementara melalui admin / tim IT.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  appName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 13,
  },
  loading: {
    marginVertical: 8,
  },
  button: {
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  registerRow: {
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
