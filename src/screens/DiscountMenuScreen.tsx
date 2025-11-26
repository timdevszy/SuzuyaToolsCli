import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../ui/theme';
import { Icon } from '../ui/Icon';
import { useDiscount } from '../hooks/useDiscount';

interface DiscountMenuScreenProps {
  onOpenPrinter: () => void;
  onOpenConfig: () => void;
  onOpenScan: () => void;
}

function formatCurrency(value: number | string | undefined) {
  if (value === undefined || value === null) return '-';
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export function DiscountMenuScreen({ onOpenPrinter, onOpenConfig, onOpenScan }: DiscountMenuScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { items, removeItem } = useDiscount();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.body}>
        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.title}>Discount</Text>
            <Text style={styles.subtitle}>
              Pilih menu untuk mengelola promo dan scanning produk.
            </Text>
          </View>
        )}

        {items.length > 0 && (
          <View style={styles.listSection}>
            <FlatList
              data={items}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              scrollEnabled={items.length > 3}
              bounces={false}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const raw: any = item.data || {};
                // Hasil /scanproduct: { status, error, message, results: [ { ...detail } ] }
                const data = Array.isArray(raw.results) && raw.results.length > 0
                  ? raw.results[0]
                  : raw;

                const internal = data.internal || item.code;
                const name = data.descript || '-';
                // rrtlprc biasanya string angka; harga_diskon number
                const retailPrice = data.rrtlprc ?? data.harga ?? data.retail_price;
                const discountPrice = data.harga_diskon ?? data.harga_promo;
                const barcodeBaru = data.barcode || data.code_barcode_baru || item.code;
                const qty = 1; // tampilkan 1 PCS seperti permintaan
                const uomsales = data.uomsales || 'PCS';

                return (
                  <View style={styles.itemCard}>
                    <View style={styles.itemRow}>
                      {/* KIRI: INFO PRODUK */}
                      <View style={styles.itemLeft}>
                        <Text style={styles.itemCode}>Internal: {internal}</Text>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {name}
                        </Text>
                        <View style={{ marginTop: 4 }}>
                          <Text style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Harga: </Text>
                            <Text style={styles.priceOld}>{formatCurrency(retailPrice)}</Text>
                          </Text>
                          <Text style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Diskon: </Text>
                            <Text style={styles.priceNew}>{formatCurrency(discountPrice)}</Text>
                          </Text>
                        </View>
                        <Text style={styles.itemMeta}>Barcode: {barcodeBaru}</Text>
                        <Text style={styles.itemMeta}>
                          Qty: {qty} {uomsales}
                        </Text>
                      </View>

                      {/* KANAN: BARCODE + AKSI (masih dalam satu card utama) */}
                      <View style={styles.itemRight}>
                        <View style={styles.barcodeBox}>
                          <Text style={styles.barcodeTitle}>BARCODE</Text>
                          {/* Representasi sederhana Code128 */}
                          <View style={styles.barcodeLines}>
                            <View style={styles.barLine} />
                            <View style={styles.barLineThin} />
                            <View style={styles.barLine} />
                            <View style={styles.barLineThin} />
                            <View style={styles.barLine} />
                            <View style={styles.barLineThin} />
                            <View style={styles.barLine} />
                            <View style={styles.barLineThin} />
                            <View style={styles.barLine} />
                            <View style={styles.barLineThin} />
                            <View style={styles.barLine} />
                            <View style={styles.barLineThin} />
                          </View>
                        </View>
                        <Text style={styles.barcodeText} numberOfLines={1}>
                          {barcodeBaru}
                        </Text>
                        <View style={styles.barcodePriceRow}>
                          <Text style={styles.priceOldSmall}>{formatCurrency(retailPrice)}</Text>
                          <Text style={styles.priceNewSmall}>{formatCurrency(discountPrice)}</Text>
                        </View>

                        <View style={styles.itemActionsRow}>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonDanger]}
                            activeOpacity={0.8}
                            onPress={() => {
                              console.log('[Discount] Remove item from Discount menu', {
                                id: item.id,
                                code: item.code,
                              });
                              removeItem(item.id);
                            }}>
                            <Text style={styles.actionButtonTextDanger}>Hapus</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonPrimary]}
                            activeOpacity={0.8}
                            onPress={() => {
                              console.log('[Discount] Print barcode for item', {
                                id: item.id,
                                code: item.code,
                              });
                              Alert.alert('Print', 'Fitur print belum diimplementasikan.');
                            }}>
                            <Text style={styles.actionButtonTextPrimary}>Print</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        )}

      </View>

      {items.length > 1 && (
        <View style={styles.printAllBiteWrapper}>
          {/* Pill biru penuh */}
          <TouchableOpacity
            style={styles.printAllButton}
            activeOpacity={0.9}
            onPress={() => {
              console.log('[Discount] Print all items');
              Alert.alert('Print All', 'Fitur print semua item belum diimplementasikan.');
            }}>
            <Text style={styles.printAllText}>Print All</Text>
          </TouchableOpacity>

          {/* Lingkaran warna background yang menggigit sisi kanan pill dengan FAB di dalamnya */}
          <View style={styles.printAllBiteCircle}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.fabButton}
              onPress={() => setMenuOpen(prev => !prev)}>
              <Text style={styles.fabLabel}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {menuOpen && (
        <View style={styles.dialOverlay}>
          {/* Tap di area kosong akan menutup menu */}
          <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <View style={styles.dialContainer}>
            <TouchableOpacity
              style={styles.dialItemRow}
              activeOpacity={0.85}
              onPress={() => {
                console.log('[Discount] Open printer setup from speed-dial');
                onOpenPrinter();
              }}>
            <View style={styles.dialLabelChip}>
              <Text style={styles.dialLabelText}>Setup printer</Text>
            </View>
            <View style={styles.dialIconCircle}>
              <Icon name="printer" size={20} color="#2563eb" />
            </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dialItemRow}
              activeOpacity={0.85}
              onPress={() => {
                console.log('[Discount] Open discount setup from speed-dial');
                onOpenConfig();
              }}>
            <View style={styles.dialLabelChip}>
              <Text style={styles.dialLabelText}>Setup discount</Text>
            </View>
            <View style={styles.dialIconCircle}>
              <Icon name="discount" size={20} color="#2563eb" />
            </View>
          </TouchableOpacity>

            <TouchableOpacity
              style={styles.dialItemRow}
              activeOpacity={0.85}
              onPress={() => {
                console.log('[Discount] Open scan product from speed-dial');
                onOpenScan();
              }}>
            <View style={styles.dialLabelChip}>
              <Text style={styles.dialLabelText}>Scan product</Text>
            </View>
            <View style={styles.dialIconCircle}>
              <Icon name="scan" size={20} color="#2563eb" />
            </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.fabContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.fabButton}
          onPress={() => setMenuOpen(prev => !prev)}>
          <Text style={styles.fabLabel}>{menuOpen ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={onPress}>
      <Icon name={icon} size={28} color="#2563eb" />
      <Text style={styles.menuItemLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
    justifyContent: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 0,
    paddingHorizontal: 16,
  },
  listSection: {
    marginTop: -22,
    flex: 1,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  itemCard: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  itemCode: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  itemData: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  itemLeft: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'space-between',
  },
  itemRight: {
    width: 150,
    alignItems: 'center',
  },
  itemName: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 4,
  },
  itemMeta: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceOld: {
    fontSize: 11,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  priceNew: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '600',
  },
  priceRow: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  priceLabel: {
    color: colors.textSecondary,
  },
  barcodeTitle: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  barcodeBox: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 4,
    width: '100%',
    backgroundColor: '#f9fafb',
  },
  barcodeLines: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 2,
  },
  barLine: {
    width: 5,
    height: 26,
    backgroundColor: '#111827',
    marginHorizontal: 1,
  },
  barLineThin: {
    width: 2,
    height: 22,
    backgroundColor: '#4b5563',
    marginHorizontal: 1,
  },
  barcodeText: {
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  barcodePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceOldSmall: {
    fontSize: 10,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  priceNewSmall: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '700',
  },
  itemActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDanger: {
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#9ca3af',
    backgroundColor: '#ffffff',
  },
  actionButtonPrimary: {
    marginLeft: 0,
    backgroundColor: '#2563eb',
  },
  actionButtonTextDanger: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  actionButtonTextPrimary: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  dialOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  dialContainer: {
    position: 'absolute',
    right: 5,
    bottom: 80,
    alignItems: 'flex-end',
  },
  dialItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  dialLabelChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dialLabelText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  dialIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialIconText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Style cadangan untuk MenuItem grid (saat ini tidak digunakan di speed-dial,
  // tapi tetap disediakan karena komponen MenuItem mereferensikan style ini).
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  printAllBiteWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    height: 56,
    justifyContent: 'center',
  },
  printAllButton: {
    height: 44,
    borderRadius: 999,
    backgroundColor: '#2563eb',
    paddingLeft: 24,
    paddingRight: 64, // ruang di sisi kanan untuk lingkaran +
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  printAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  printAllBiteCircle: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    width: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
    backgroundColor: colors.surface,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabLabel: {
    fontSize: 28,
    color: '#ffffff',
    marginTop: -2,
  },
});
