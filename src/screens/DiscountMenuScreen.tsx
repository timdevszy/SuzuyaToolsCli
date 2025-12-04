import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../ui/theme';
import { Icon } from '../ui/Icon';
import { useDiscount } from '../hooks/useDiscount';
import { defaultPrinterSettings, printDiscountLabel } from '../services/printerService';
import { encodeCode128BToModules } from '../services/code128Service';
import * as discountService from '../services/discountService';

interface DiscountMenuScreenProps {
  onOpenConfig: () => void;
  onOpenScan: () => void;
}

function formatCurrency(value: number | string | undefined) {
  if (value === undefined || value === null) return '-';
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export function DiscountMenuScreen({ onOpenConfig, onOpenScan }: DiscountMenuScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { items, removeItem, config } = useDiscount();

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
                const qty = 1; // tampilkan 1 PCS seperti permintaan untuk non-timbangan
                const uomsales = data.uomsales || 'PCS';

                const isWeighable =
                  typeof uomsales === 'string' &&
                  uomsales.toUpperCase().includes('KG') &&
                  data.ukuran !== undefined &&
                  data.ukuran !== null;

                const qtyWeigh = isWeighable ? Number(data.ukuran) : null;
                const pricePerUnit = Number(retailPrice) || 0;
                const totalBefore = isWeighable
                  ? Number(data.harga) || (qtyWeigh !== null ? pricePerUnit * qtyWeigh : pricePerUnit)
                  : pricePerUnit;
                const totalAfter = Number(discountPrice) || totalBefore;

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
                          {isWeighable ? (
                            <>
                              <Text style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Harga/kg: </Text>
                                <Text style={styles.pricePlain}>{formatCurrency(pricePerUnit)}</Text>
                              </Text>
                              <Text style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Qty: </Text>
                                <Text style={styles.priceRow}>
                                  {qtyWeigh !== null
                                    ? `${qtyWeigh.toLocaleString('id-ID')} KG`
                                    : `- ${uomsales}`}
                                </Text>
                              </Text>
                              <Text style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Total: </Text>
                                <Text style={styles.priceOld}>{formatCurrency(totalBefore)}</Text>
                              </Text>
                              <Text style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Diskon: </Text>
                                <Text style={styles.priceNew}>{formatCurrency(totalAfter)}</Text>
                              </Text>
                            </>
                          ) : (
                            <>
                              <Text style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Harga: </Text>
                                <Text style={styles.priceOld}>{formatCurrency(retailPrice)}</Text>
                              </Text>
                              <Text style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Diskon: </Text>
                                <Text style={styles.priceNew}>{formatCurrency(discountPrice)}</Text>
                              </Text>
                            </>
                          )}
                        </View>
                        <Text style={styles.itemMeta}>Barcode: {barcodeBaru}</Text>
                        {!isWeighable && (
                          <Text style={styles.itemMeta}>
                            Qty: {qty} {uomsales}
                          </Text>
                        )}
                      </View>

                      {/* KANAN: BARCODE + AKSI (masih dalam satu card utama) */}
                      <View style={styles.itemRight}>
                        <View style={styles.barcodeBox}>
                          <Text style={styles.barcodeTitle}>BARCODE</Text>
                          <Code128Preview value={barcodeBaru} />
                        </View>
                        <Text style={styles.barcodeText} numberOfLines={1}>
                          {barcodeBaru}
                        </Text>
                        <View style={styles.barcodePriceRow}>
                          <Text style={styles.priceOldSmall}>
                            {formatCurrency(isWeighable ? totalBefore : retailPrice)}
                          </Text>
                          <Text style={styles.priceNewSmall}>
                            {formatCurrency(isWeighable ? totalAfter : discountPrice)}
                          </Text>
                        </View>

                        <View style={styles.itemActionsRow}>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonDanger]}
                            activeOpacity={0.8}
                            onPress={() => {
                              const payload = { id: item.id, code: item.code };

                              console.log(
                                '[Discount] Request remove item from Discount menu',
                                payload,
                              );

                              Alert.alert(
                                'Hapus item',
                                `Yakin ingin menghapus produk dengan kode ${item.code}?`,
                                [
                                  {
                                    text: 'Batal',
                                    style: 'cancel',
                                    onPress: () => {
                                      console.log(
                                        '[Discount] Cancel remove item from Discount menu',
                                        payload,
                                      );
                                    },
                                  },
                                  {
                                    text: 'Hapus',
                                    style: 'destructive',
                                    onPress: () => {
                                      console.log(
                                        '[Discount] Confirm remove item from Discount menu',
                                        payload,
                                      );
                                      removeItem(item.id);
                                    },
                                  },
                                ],
                                { cancelable: true },
                              );
                            }}>
                            <Text style={styles.actionButtonTextDanger}>Hapus</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonPrimary]}
                            activeOpacity={0.8}
                            onPress={() => {
                              if (!config) {
                                Alert.alert(
                                  'Config belum di-set',
                                  'Silakan setup discount terlebih dahulu sebelum print.',
                                );
                                return;
                              }

                              const raw: any = item.data || {};
                              const data =
                                Array.isArray(raw.results) && raw.results.length > 0
                                  ? raw.results[0]
                                  : raw;

                              const internal = data.internal || item.code;
                              const name = data.descript || '-';
                              const retailPrice =
                                data.rrtlprc ?? data.harga ?? data.retail_price ?? 0;
                              const discountPrice =
                                data.harga_diskon ?? data.harga_promo ?? retailPrice;
                              const barcodeBaru =
                                data.barcode || data.code_barcode_baru || item.code;
                              const qty = 1;
                              const uomsales = data.uomsales || 'PCS';

                              const isWeighable =
                                typeof uomsales === 'string' &&
                                uomsales.toUpperCase().includes('KG') &&
                                data.ukuran !== undefined &&
                                data.ukuran !== null;

                              const qtyWeigh = isWeighable ? Number(data.ukuran) : null;
                              const pricePerUnit = Number(retailPrice) || 0;
                              const totalBefore = isWeighable
                                ? Number(data.harga) ||
                                  (qtyWeigh !== null ? pricePerUnit * qtyWeigh : pricePerUnit)
                                : pricePerUnit;
                              const totalAfter = Number(discountPrice) || totalBefore;

                              const discountPercent = Number(config.discountPercent || '0');
                              const description = config.description || '';
                              const outletNumber = Number(config.outlet || '0');

                              const discountPayload: discountService.CreateDiscountPayload = {
                                internal: String(internal),
                                name_product: String(name),
                                code_barcode_lama: String(item.code),
                                code_barcode_baru: String(barcodeBaru),
                                retail_price: pricePerUnit,
                                harga_awal: isWeighable ? totalBefore : pricePerUnit,
                                discount: discountPercent,
                                qty: isWeighable && qtyWeigh !== null ? qtyWeigh : qty,
                                uomsales: isWeighable ? 'KG' : String(uomsales || 'PCS'),
                                harga_discount: isWeighable
                                  ? totalAfter
                                  : Number(discountPrice) || 0,
                                description,
                                outlet: outletNumber,
                              };

                              const unitLabel = isWeighable
                                ? `${(qtyWeigh ?? 0).toLocaleString('id-ID')} KG`
                                : `${qty} ${uomsales}`;

                              const label = {
                                productName: name,
                                internalCode: internal,
                                barcode: barcodeBaru,
                                unitLabel,
                                normalPrice: isWeighable ? totalBefore : Number(retailPrice) || 0,
                                discountPrice: isWeighable
                                  ? totalAfter
                                  : Number(discountPrice) || 0,
                              };

                              console.log('[Discount] Request print label for item', {
                                id: item.id,
                                code: item.code,
                                label,
                              });

                              Alert.alert(
                                'Print label',
                                `Yakin ingin mencetak label untuk kode ${item.code}?`,
                                [
                                  {
                                    text: 'Batal',
                                    style: 'cancel',
                                    onPress: () => {
                                      console.log(
                                        '[Discount] Cancel print label for item',
                                        {
                                          id: item.id,
                                          code: item.code,
                                        },
                                      );
                                    },
                                  },
                                  {
                                    text: 'Print',
                                    style: 'default',
                                    onPress: () => {
                                      console.log('[Discount] Confirm print label for item', {
                                        id: item.id,
                                        code: item.code,
                                      });

                                      (async () => {
                                        try {
                                          console.log(
                                            '[Discount] Sending createDiscount payload',
                                            discountPayload,
                                          );
                                          await discountService.createDiscount(discountPayload);
                                        } catch (e: any) {
                                          const responseData = e?.response?.data;
                                          console.log(
                                            '[Discount] Failed to create discount before print',
                                            {
                                              error: String(e?.message || e),
                                              status: e?.response?.status,
                                              data: responseData,
                                            },
                                          );

                                          const backendMessage =
                                            responseData?.message ||
                                            responseData?.error ||
                                            responseData?.detail;

                                          Alert.alert(
                                            'Gagal simpan',
                                            backendMessage ||
                                              'Terjadi kesalahan saat menyimpan data discount ke server.',
                                          );
                                          return;
                                        }

                                        printDiscountLabel(
                                          label,
                                          defaultPrinterSettings,
                                        ).catch(e => {
                                          console.log(
                                            '[Printer] Gagal menyiapkan label diskon',
                                            e,
                                          );
                                          Alert.alert(
                                            'Gagal print',
                                            'Terjadi kesalahan saat menyiapkan label untuk printer.',
                                          );
                                        });
                                      })();
                                    },
                                  },
                                ],
                                { cancelable: true },
                              );
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

      <View style={styles.bottomActionsRow}>
        {items.length > 1 && (
          <TouchableOpacity
            style={styles.printAllButton}
            activeOpacity={0.9}
            onPress={() => {
              console.log('[Discount] Print all items');
              Alert.alert('Print All', 'Fitur print semua item belum diimplementasikan.');
            }}>
            <Text style={styles.printAllText}>Print All</Text>
          </TouchableOpacity>
        )}

        <View style={styles.fabContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.fabButton}
            onPress={() => setMenuOpen(prev => !prev)}>
            <Text style={styles.fabLabel}>{menuOpen ? '×' : '+'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {menuOpen && (
        <View style={styles.dialOverlay}>
          <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <View style={styles.dialContainer}>
            <TouchableOpacity
              style={styles.dialItemRow}
              activeOpacity={0.9}
              onPress={() => {
                console.log('[Discount] Open discount setup from speed-dial');
                setMenuOpen(false);
                onOpenConfig();
              }}>
              <View style={styles.dialPill}>
                <Icon name="discount" size={18} color="#ffffff" />
                <Text style={styles.dialLabel}>Setup discount</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dialItemRow}
              activeOpacity={0.9}
              onPress={() => {
                console.log('[Discount] Open scan product from speed-dial');
                setMenuOpen(false);
                onOpenScan();
              }}>
              <View style={styles.dialPill}>
                <Icon name="scan" size={18} color="#ffffff" />
                <Text style={styles.dialLabel}>Scan product</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

interface Code128PreviewProps {
  value: string;
}

function Code128Preview({ value }: Code128PreviewProps) {
  const safe = (value || '').trim();
  if (!safe) {
    return <View style={styles.barcodeLines} />;
  }
  const modules = encodeCode128BToModules(safe);
  if (!modules.length) {
    return <View style={styles.barcodeLines} />;
  }

  const moduleUnit = 1.0;
  const barViews: React.ReactElement[] = [];
  let elemKey = 0;

  let isBar = true;
  modules.forEach(m => {
    const width = m * moduleUnit;
    if (isBar) {
      barViews.push(
        <View key={elemKey} style={[styles.barLine, { width }]} />,
      );
    } else {
      barViews.push(<View key={elemKey} style={{ width }} />);
    }
    elemKey += 1;
    isBar = !isBar;
  });

  return <View style={styles.barcodeLines}>{barViews}</View>;
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
    // small bottom padding so last card is visually close to Print All / FAB
    paddingBottom: 32,
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
    alignItems: 'flex-start',
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
    flex: 1,
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
  pricePlain: {
    fontSize: 11,
    color: colors.textPrimary,
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
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    overflow: 'hidden',
    marginBottom: 2,
  },
  barLine: {
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
  bottomActionsRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  printAllButton: {
    flex: 1,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  printAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  dialOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  dialContainer: {
    position: 'absolute',
    right: 16,
    bottom: 96,
    alignItems: 'flex-end',
  },
  dialItemRow: {
    marginBottom: 10,
  },
  dialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#2563eb',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  dialLabel: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  fabContainer: {
    // sits on the right of bottomActionsRow
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabLabel: {
    fontSize: 28,
    color: '#ffffff',
    marginTop: -2,
  },
});
