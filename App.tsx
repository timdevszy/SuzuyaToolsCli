/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { AuthProvider, useAuth } from './src/hooks/useAuth';

function AppContent() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (user) {
    return (
      <View style={styles.container}>
        <HomeScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mode === 'login' ? (
        <LoginScreen onNavigateRegister={() => setMode('register')} />
      ) : (
        <RegisterScreen
          onRegisterSuccess={() => setMode('login')}
          onNavigateLogin={() => setMode('login')}
        />
      )}
    </View>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#2196f3" />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
