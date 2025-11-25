import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../ui/theme';
import { Icon } from '../ui/Icon';
import { getProductByInternal } from '../services/productService';

interface Props {
  onBack?: () => void;
}

export function ProductSearchScreen({ onBack }: Props) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);

  const outlet = (user as any)?.default_outlet || '2009';

  const handleSearch = async () => {
    if (!query.trim()) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await getProductByInternal(outlet, query.trim());
      setResults(data);
    } catch (e: any) {
      const backend = e?.response?.data;
      const msg = backend?.message || backend?.msg || e?.message || 'Gagal memuat data produk';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Cari Produk</Text>
      </View>
      <Text style={styles.subtitle}>
        Outlet aktif: {outlet}
      </Text>

      <View style={styles.searchRow}>
        <View style={styles.searchIconBox}>
          <Icon name="Scan" size={20} color="#2563eb" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Ketik Barcode/Internal/Nama"
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="Search" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading && <ActivityIndicator style={{ marginVertical: 8 }} />}

      {results ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Hasil</Text>
          <Text style={styles.resultText}>{JSON.stringify(results, null, 2)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    marginRight: 8,
  },
  searchButton: {
    width: 40,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
  },
  resultCard: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.textPrimary,
  },
  resultText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
