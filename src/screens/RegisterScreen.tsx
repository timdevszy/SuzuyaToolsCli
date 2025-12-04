import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import type { RegisterPayload } from '../services/authService';
import { Screen } from '../ui/Screen';
import { Card } from '../ui/Card';
import { colors } from '../ui/theme';
import { getBrands, getJabatan, getOutlets } from '../services/discountService';

interface Props {
  onRegisterSuccess?: () => void;
  onNavigateLogin?: () => void;
}

export function RegisterScreen({ onRegisterSuccess, onNavigateLogin }: Props) {
  const { register, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [jabatan, setJabatan] = useState('Staff');
  const [divisi, setDivisi] = useState('');
  const [selectedOutlets, setSelectedOutlets] = useState<
    { value: string; name: string }[]
  >([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const [pickerType, setPickerType] = useState<
    'jabatan' | 'outlet' | 'brand' | null
  >(null);
  const [jabatanOptions, setJabatanOptions] = useState<string[]>([]);
  const [outletOptions, setOutletOptions] = useState<
    { value: string; name: string }[]
  >([]);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isUsernameTakenError =
    typeof error === 'string' && error.toLowerCase().includes('username');
  const friendlyError = error;

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRegister = async () => {
    // Validasi sederhana di sisi frontend sebelum kirim ke backend.
    if (!name.trim()) {
      Alert.alert('Validasi', 'Nama lengkap wajib diisi.');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Validasi', 'Username wajib diisi.');
      return;
    }

    if (!password) {
      Alert.alert('Validasi', 'Password wajib diisi.');
      return;
    }

    if (!divisi.trim()) {
      Alert.alert('Validasi', 'Divisi wajib diisi.');
      return;
    }

    if (selectedOutlets.length === 0) {
      Alert.alert('Validasi', 'Minimal pilih satu outlet.');
      return;
    }

    const payload: RegisterPayload = {
      name,
      username,
      password,
      password_confirmation: passwordConfirmation,
      jabatan,
      divisi,
      brands: selectedBrands,
      outlet_choice: selectedOutlets,
    };

    // eslint-disable-next-line no-console
    console.log('RegisterScreen.handleRegister payload', payload);

    try {
      await register(payload);
      Alert.alert(
        'Registrasi Berhasil',
        'Akun Anda berhasil didaftarkan.',
      );
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch {
      // error sudah di-handle di hook
    }
  };

  const openPicker = (type: 'jabatan' | 'outlet' | 'brand') => {
    Keyboard.dismiss();
    setSearchQuery('');
    setPickerType(type);
  };

  const closePicker = () => {
    setPickerType(null);
  };

  useEffect(() => {
    const loadMeta = async () => {
      setMetaLoading(true);
      setMetaError(null);
      try {
        const [jabatanRes, outletRes, brandsRes] = await Promise.all([
          getJabatan(),
          getOutlets(),
          getBrands(),
        ]);

        const jabatanList: string[] = Array.isArray(jabatanRes)
          ? jabatanRes
              .map((item: any) =>
                String(
                  item?.nama_jabatan ??
                    item?.jabatan ??
                    item?.name ??
                    item ?? '',
                ),
              )
              .filter(Boolean)
          : [];

        const outletList: { value: string; name: string }[] = Array.isArray(
          outletRes,
        )
          ? outletRes.map((item: any) => ({
              value: String(
                item?.value ??
                  item?.id ??
                  item?.kode_outlet ??
                  item?.kode ??
                  item?.code ?? '',
              ),
              name: String(
                item?.nama_outlet ??
                  item?.name ??
                  item?.nama ??
                  item?.outlet ??
                  item?.label ?? '',
              ),
            }))
          : [];

        setJabatanOptions(jabatanList);
        setOutletOptions(outletList);
        const brandList: string[] = Array.isArray(brandsRes)
          ? brandsRes
              .map((item: any) =>
                String(item?.name ?? item?.nama ?? item?.brand ?? item ?? ''),
              )
              .filter(Boolean)
          : [];
        setBrandOptions(brandList);
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.log('Failed to load jabatan/outlet', e?.response?.data || e);
        const backendMsg =
          e?.response?.data?.message ||
          e?.response?.data?.msg ||
          e?.message ||
          '';
        setMetaError(
          backendMsg
            ? `Gagal memuat data jabatan/outlet: ${backendMsg}`
            : 'Gagal memuat data jabatan/outlet',
        );
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasPickerSelection =
    pickerType === 'jabatan'
      ? !!jabatan
      : pickerType === 'outlet'
      ? selectedOutlets.length > 0
      : selectedBrands.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <Screen>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formContent}>
            <Card>
              <Text style={styles.title}>Register</Text>
              {friendlyError ? <Text style={styles.error}>{friendlyError}</Text> : null}
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Nama lengkap"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[
                  styles.input,
                  isUsernameTakenError && styles.inputError,
                ]}
                placeholder="Username"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <Text style={styles.label}>Konfirmasi Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Konfirmasi Password"
                secureTextEntry
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
              />

              <Text style={styles.label}>Jabatan</Text>
              <TouchableOpacity
                style={styles.selectField}
                activeOpacity={0.8}
                onPress={() => openPicker('jabatan')}>
                <Text style={jabatan ? styles.selectValue : styles.selectPlaceholder}>
                  {jabatan || 'Pilih jabatan'}
                </Text>
                <Text style={styles.selectChevron}>{metaLoading ? '…' : '⌵'}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Divisi</Text>
              <TextInput
                style={styles.input}
                placeholder="Divisi"
                value={divisi}
                onChangeText={setDivisi}
              />

              <Text style={styles.label}>Outlet</Text>
              <TouchableOpacity
                style={styles.selectField}
                activeOpacity={0.8}
                onPress={() => openPicker('outlet')}>
                <Text
                  style={
                    selectedOutlets.length > 0
                      ? styles.selectValue
                      : styles.selectPlaceholder
                  }>
                  {selectedOutlets.length === 0
                    ? 'Pilih outlet'
                    : selectedOutlets.length === 1
                    ? selectedOutlets[0].name
                    : `${selectedOutlets.length} outlet dipilih`}
                </Text>
                <Text style={styles.selectChevron}>{metaLoading ? '…' : '⌵'}</Text>
              </TouchableOpacity>

              {jabatan.toLowerCase() === 'suplier'.toLowerCase() ? (
                <>
                  <Text style={styles.label}>Brand</Text>
                  <TouchableOpacity
                    style={styles.selectField}
                    activeOpacity={0.8}
                    onPress={() => openPicker('brand')}>
                    <Text
                      style={
                        selectedBrands.length
                          ? styles.selectValue
                          : styles.selectPlaceholder
                      }>
                      {selectedBrands.length
                        ? selectedBrands.join(', ')
                        : 'Pilih brand'}
                    </Text>
                    <Text style={styles.selectChevron}>{metaLoading ? '…' : '⌵'}</Text>
                  </TouchableOpacity>
                </>
              ) : null}

              {metaError ? (
                <Text style={styles.metaError}>{metaError}</Text>
              ) : null}

              {isLoading ? (
                <ActivityIndicator style={styles.loading} />
              ) : (
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.8}
                  onPress={handleRegister}>
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
              )}

              <View style={styles.registerRow}>
                <Text style={styles.registerText}>Sudah punya akun?</Text>
                <Text style={styles.registerLink} onPress={onNavigateLogin}>
                  {' '}Login
                </Text>
              </View>
            </Card>
          </ScrollView>

          <Modal
            visible={pickerType !== null}
            transparent
            animationType="fade"
            onRequestClose={closePicker}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <TouchableWithoutFeedback onPress={closePicker}>
                <View style={styles.modalBackdrop}>
                  <TouchableWithoutFeedback>
                    <View style={styles.modalContainer}>
                      <View style={styles.modalHeaderRow}>
                        <Text style={styles.modalTitle}>
                          {pickerType === 'jabatan'
                            ? 'Pilih Jabatan'
                            : pickerType === 'outlet'
                            ? 'Pilih Outlet'
                            : 'Pilih Brand'}
                        </Text>
                        {hasPickerSelection && (
                          <TouchableOpacity
                            style={styles.modalPrimaryButtonSmall}
                            activeOpacity={0.8}
                            onPress={closePicker}>
                            <Text style={styles.modalPrimaryButtonText}>Simpan</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Cari..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                      />
                      <ScrollView keyboardShouldPersistTaps="handled">
                        {pickerType === 'jabatan' && (
                          <View style={styles.chipContainer}>
                            {jabatanOptions
                              .filter(option =>
                                option
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()),
                              )
                              .slice(0, 80)
                              .map(option => {
                                const active = jabatan === option;
                                return (
                                  <TouchableOpacity
                                    key={option}
                                    style={[
                                      styles.chip,
                                      active && styles.chipActive,
                                    ]}
                                    onPress={() => {
                                      setJabatan(option);
                                    }}>
                                    <Text
                                      style={
                                        active
                                          ? styles.chipTextActive
                                          : styles.chipText
                                      }>
                                      {option}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                          </View>
                        )}

                        {pickerType === 'outlet' && (
                          <View>
                            {outletOptions
                              .filter(option => {
                                const term = searchQuery.toLowerCase();
                                return (
                                  option.name.toLowerCase().includes(term) ||
                                  option.value.toLowerCase().includes(term)
                                );
                              })
                              .slice(0, 80)
                              .map(option => {
                                const active = selectedOutlets.some(
                                  o => o.value === option.value,
                                );
                                return (
                                  <TouchableOpacity
                                    key={option.value}
                                    style={[
                                      styles.modalItemCard,
                                      active && styles.modalItemCardActive,
                                    ]}
                                    onPress={() => {
                                      setSelectedOutlets(prev =>
                                        prev.some(o => o.value === option.value)
                                          ? prev.filter(o => o.value !== option.value)
                                          : [...prev, option],
                                      );
                                    }}>
                                    <Text
                                      style={
                                        active
                                          ? styles.modalItemTextActive
                                          : styles.modalItemText
                                      }>
                                      {option.name}
                                    </Text>
                                    <Text style={styles.modalItemSub}>{option.value}</Text>
                                  </TouchableOpacity>
                                );
                              })}
                          </View>
                        )}

                        {pickerType === 'brand' && (
                          <View style={styles.chipContainer}>
                            {brandOptions
                              .filter(option =>
                                option
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()),
                              )
                              .slice(0, 80)
                              .map(option => {
                                const active = selectedBrands.includes(option);
                                return (
                                  <TouchableOpacity
                                    key={option}
                                    style={[
                                      styles.chip,
                                      active && styles.chipActive,
                                    ]}
                                    onPress={() => {
                                      setSelectedBrands(prev =>
                                        prev.includes(option)
                                          ? prev.filter(b => b !== option)
                                          : [...prev, option],
                                      );
                                    }}>
                                    <Text
                                      style={
                                        active
                                          ? styles.chipTextActive
                                          : styles.chipText
                                      }>
                                      {option}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </Modal>
        </Screen>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  formContent: {
    paddingBottom: 160,
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
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    textAlign: 'center',
  },
  metaError: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
  },
  registerRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  registerLink: {
    color: '#2196f3',
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  selectField: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectPlaceholder: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  selectChevron: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  button: {
    marginTop: 8,
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
  loading: {
    marginVertical: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemCard: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  modalItemCardActive: {
    borderColor: '#2196f3',
    backgroundColor: 'rgba(33, 150, 243, 0.06)',
  },
  modalItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  modalItemTextActive: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '600',
  },
  modalItemSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: '#2196f3',
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
  },
  chipText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  chipTextActive: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 8,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  modalCloseText: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '600',
  },
  modalSaveText: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '600',
  },
  modalPrimaryButton: {
    marginTop: 12,
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalPrimaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalPrimaryButtonSmall: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
});
