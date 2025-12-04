import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../ui/theme';
import { Icon } from '../ui/Icon';

interface SettingsScreenProps {
  onNavigateToPrinter: () => void;
}

export function SettingsScreen({ onNavigateToPrinter }: SettingsScreenProps) {
  const { logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.searchWrapper}>
        <View style={styles.searchField}>
          <Icon name="search" size={16} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Find information about..."
            placeholderTextColor="#9ca3af"
            editable={false}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Printer</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={onNavigateToPrinter}>
            <View style={styles.leadingIcon}>
              <Icon name="printer" size={18} color="#2563eb" />
            </View>
            <Text style={styles.rowText}>Setup Printer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Session</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={logout}>
            <View style={[styles.leadingIcon, styles.logoutIconBg]}>
              <Icon name="logout" size={18} color="#b91c1c" />
            </View>
            <Text style={[styles.rowText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 32,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  section: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  leadingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0edff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutIconBg: {
    backgroundColor: '#fee2e2',
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  logoutText: {
    color: '#b91c1c',
  },
});
