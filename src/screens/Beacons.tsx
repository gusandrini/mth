import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ListRenderItem,
  Modal, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '@/components/AppLayout';
import { useTheme } from '@/context/Theme';

import { Beacon, BeaconForm } from '@/models/beacons';
import { listBeacons, getBeacon, createBeacon, updateBeacon, deleteBeacon } from '@/api/beacons';

import { getBeaconsStyles } from '@/styles/beacons';
import { useI18n } from '@/i18n/I18nProvider'; // 👈 i18n

export default function Beacons() {
  const { colors } = useTheme();
  const s = useMemo(() => getBeaconsStyles(colors), [colors]);
  const { t } = useI18n();

  const [query, setQuery] = useState('');
  const [data, setData] = useState<Beacon[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<BeaconForm>({ uuid: '' });

  /** ===== Effects ===== */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const items = await listBeacons();
      setData(items);
    } catch (e) {
      console.error(e);
      Alert.alert(t('common.error'), t('beacons.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  /** ===== UI handlers ===== */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((b) => b.uuid?.toLowerCase().includes(q));
  }, [query, data]);

  const openNew = useCallback(() => {
    setEditingId(null);
    setForm({ uuid: '', bateria: '', motoId: '', modeloBeaconId: '' });
    setOpen(true);
  }, []);

  const openEdit = useCallback(async (b: Beacon) => {
    setEditingId(b.id);
    setOpen(true);
    try {
      const one = await getBeacon(b.id);
      setForm({
        uuid: one.uuid ?? '',
        bateria: one.bateria != null ? String(one.bateria) : '',
        motoId: one.motoId != null ? String(one.motoId) : '',
        modeloBeaconId: one.modeloBeaconId != null ? String(one.modeloBeaconId) : '',
      });
    } catch (e) {
      console.error(e);
      Alert.alert(t('common.error'), t('beacons.loadOneError'));
      setOpen(false);
    }
  }, [t]);

  const onSave = useCallback(async () => {
    if (!form.uuid.trim()) {
      Alert.alert(t('common.error'), t('beacons.validation.uuidReq'));
      return;
    }
    if (form.bateria) {
      const n = Number(form.bateria);
      if (Number.isNaN(n) || n < 0 || n > 100) {
        Alert.alert(t('common.error'), t('beacons.validation.batteryRange'));
        return;
      }
    }

    try {
      setSaving(true);
      if (editingId) {
        await updateBeacon(editingId, form);
        Alert.alert(t('common.success'), t('beacons.updated'));
      } else {
        await createBeacon(form);
        Alert.alert(t('common.success'), t('beacons.created'));
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      console.error(e?.response?.data || e);
      const msg = e?.response?.data?.message || t('beacons.saveError');
      Alert.alert(t('common.error'), msg);
    } finally {
      setSaving(false);
    }
  }, [editingId, form, load, t]);

  const onDelete = useCallback((b: Beacon) => {
    Alert.alert(
      t('beacons.deleteTitle'),
      t('beacons.deleteMsg', { uuid: b.uuid }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('beacons.deleteConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBeacon(b.id);
              await load();
            } catch (e) {
              console.error(e);
              Alert.alert(t('common.error'), t('beacons.deleteError'));
            }
          },
        },
      ],
    );
  }, [load, t]);

  /** ===== List item ===== */
  const renderItem: ListRenderItem<Beacon> = useCallback(({ item }) => (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.titleRow}>{item.uuid}</Text>

        <View style={s.metaLine}>
          <Ionicons name="battery-half-outline" size={14} color={colors.muted} />
          <Text style={s.meta}> {item.bateria ?? '-'}</Text>
        </View>

        {(item.placaMoto || item.modeloNome) && (
          <View style={[s.metaLine, { marginTop: 4 }]}>
            <Ionicons name="bicycle-outline" size={14} color={colors.muted} />
            <Text style={s.meta}>
              {' '}{item.placaMoto ?? '-'} {item.modeloNome ? `• ${item.modeloNome}` : ''}
            </Text>
          </View>
        )}
      </View>

      <View style={s.rightCol}>
        <View style={s.actions}>
          <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(item)} accessibilityLabel={t('beacons.edit')}>
            <Ionicons name="pencil-outline" size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={() => onDelete(item)} accessibilityLabel={t('beacons.delete')}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [colors.muted, onDelete, openEdit, s, t]);

  const total = filtered.length;

  return (
    <AppLayout>
      <View style={s.container}>
        <Text style={s.headerTitle}>Beacons</Text>
        <Text style={s.headerSub}>
          {total} {total === 1 ? 'beacon' : 'beacons'}
        </Text>

        {/* Busca (por UUID) */}
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Ionicons name="search-outline" size={16} color={colors.muted} style={s.searchIcon} />
            <TextInput
              style={s.input}
              placeholder={t('beacons.searchPlaceholder')}
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={s.filterBtn} onPress={load} accessibilityLabel={t('beacons.refresh')}>
            <Ionicons name="refresh-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Lista */}
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(it) => String(it.id)}
            renderItem={renderItem}
            contentContainerStyle={s.listContent}
            ItemSeparatorComponent={() => <View style={s.sep} />}
            ListEmptyComponent={<Text style={s.empty}>{t('beacons.empty')}</Text>}
          />
        )}

        {/* FAB (+) */}
        <TouchableOpacity style={s.fab} onPress={openNew} accessibilityLabel={t('beacons.new')}>
          <Ionicons name="add" size={24} color="#0b0b0b" />
        </TouchableOpacity>
      </View>

      {/* Modal de cadastro/edição */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={s.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={s.modalKav}
          >
            <View style={s.modalCard}>
              <ScrollView contentContainerStyle={s.modalScrollContent}>
                <Text style={s.modalTitle}>{editingId ? t('beacons.editTitle') : t('beacons.newTitle')}</Text>

                {/* UUID */}
                <Field label="UUID">
                  <TextInput
                    style={s.fieldInput}
                    value={form.uuid}
                    onChangeText={(t2) => setForm({ ...form, uuid: t2 })}
                    placeholder={t('beacons.uuidPlaceholder')}
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                  />
                </Field>

                {/* Bateria */}
                <Field label={t('beacons.battery')}>
                  <TextInput
                    style={s.fieldInput}
                    value={form.bateria ?? ''}
                    onChangeText={(t2) => setForm({ ...form, bateria: t2.replace(/[^\d]/g, '') })}
                    keyboardType="number-pad"
                    placeholder="0–100"
                    placeholderTextColor={colors.muted}
                  />
                </Field>

                {/* Moto ID */}
                <Field label={t('beacons.motoId')}>
                  <TextInput
                    style={s.fieldInput}
                    value={form.motoId ?? ''}
                    onChangeText={(t2) => setForm({ ...form, motoId: t2.replace(/[^\d]/g, '') })}
                    keyboardType="number-pad"
                    placeholder="ex.: 12"
                    placeholderTextColor={colors.muted}
                  />
                </Field>

                {/* Modelo Beacon ID */}
                <Field label={t('beacons.modelId')}>
                  <TextInput
                    style={s.fieldInput}
                    value={form.modeloBeaconId ?? ''}
                    onChangeText={(t2) => setForm({ ...form, modeloBeaconId: t2.replace(/[^\d]/g, '') })}
                    keyboardType="number-pad"
                    placeholder="ex.: 5"
                    placeholderTextColor={colors.muted}
                  />
                </Field>

                {/* Ações */}
                <View style={s.actionsRow}>
                  <TouchableOpacity onPress={() => setOpen(false)} style={s.btnGhost}>
                    <Text style={s.btnGhostText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onSave} disabled={saving} style={[s.btnPrimary, saving && { opacity: 0.6 }]}>
                    {saving ? <ActivityIndicator color="#0b0b0b" /> : <Text style={s.btnPrimaryText}>{t('beacons.save')}</Text>}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </AppLayout>
  );
}

/* ---------- componentes auxiliares ---------- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  const s = useMemo(() => getBeaconsStyles(colors), [colors]);
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}
