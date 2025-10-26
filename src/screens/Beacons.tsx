import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ListRenderItem,
  Modal, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '@/components/AppLayout';
import { useTheme } from '@/context/Theme';

import { Beacon, BeaconForm } from '@/models/beacons';
import {
  listBeacons, getBeacon, createBeacon, updateBeacon, deleteBeacon,
} from '@/api/beacons';

export default function Beacons() {
  const { colors } = useTheme();
  const s = getStyles(colors);

  const [query, setQuery] = useState('');
  const [data, setData] = useState<Beacon[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<BeaconForm>({ uuid: '' });

  /** ===== Effects ===== */
  const load = async () => {
    try {
      setLoading(true);
      const items = await listBeacons();
      setData(items);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível carregar os beacons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /** ===== UI handlers ===== */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((b) => b.uuid?.toLowerCase().includes(q));
  }, [query, data]);

  const openNew = () => {
    setEditingId(null);
    setForm({ uuid: '', bateria: '', motoId: '', modeloBeaconId: '' });
    setOpen(true);
  };

  const openEdit = async (b: Beacon) => {
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
      Alert.alert('Erro', 'Não foi possível carregar o beacon.');
      setOpen(false);
    }
  };

  const onSave = async () => {
    if (!form.uuid.trim()) {
      Alert.alert('Validação', 'UUID é obrigatório.');
      return;
    }
    if (form.bateria) {
      const n = Number(form.bateria);
      if (Number.isNaN(n) || n < 0 || n > 100) {
        Alert.alert('Validação', 'Bateria deve ser um número entre 0 e 100.');
        return;
      }
    }

    try {
      setSaving(true);
      if (editingId) {
        await updateBeacon(editingId, form);
        Alert.alert('Sucesso', 'Beacon atualizado.');
      } else {
        await createBeacon(form);
        Alert.alert('Sucesso', 'Beacon criado.');
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      console.error(e?.response?.data || e);
      const msg = e?.response?.data?.message || 'Não foi possível salvar.';
      Alert.alert('Erro', msg);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (b: Beacon) => {
    Alert.alert('Excluir', `Deseja excluir o beacon ${b.uuid}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBeacon(b.id);
            await load();
          } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Não foi possível excluir.');
          }
        },
      },
    ]);
  };

  /** ===== List item ===== */
  const renderItem: ListRenderItem<Beacon> = ({ item }) => (
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
              {' '}
              {item.placaMoto ?? '-'} {item.modeloNome ? `• ${item.modeloNome}` : ''}
            </Text>
          </View>
        )}
      </View>

      <View style={s.rightCol}>
        <View style={s.actions}>
          <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(item)} accessibilityLabel="Editar">
            <Ionicons name="pencil-outline" size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={() => onDelete(item)} accessibilityLabel="Excluir">
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
            <Ionicons name="search-outline" size={16} color={colors.muted} style={{ marginRight: 8 }} />
            <TextInput
              style={s.input}
              placeholder="Buscar por UUID..."
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={s.filterBtn} onPress={load} accessibilityLabel="Atualizar lista">
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
            contentContainerStyle={{ paddingBottom: 96 }}
            ItemSeparatorComponent={() => <View style={s.sep} />}
            ListEmptyComponent={<Text style={s.empty}>Nenhum beacon cadastrado</Text>}
          />
        )}

        {/* FAB (+) */}
        <TouchableOpacity style={s.fab} onPress={openNew} accessibilityLabel="Novo beacon">
          <Ionicons name="add" size={24} color="#0b0b0b" />
        </TouchableOpacity>
      </View>

      {/* Modal de cadastro/edição */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={s.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <View style={s.modalCard}>
              <ScrollView contentContainerStyle={{ padding: 14 }}>
                <Text style={s.modalTitle}>{editingId ? 'Editar Beacon' : 'Novo Beacon'}</Text>

                {/* UUID */}
                <Field label="UUID">
                  <TextInput
                    style={s.fieldInput}
                    value={form.uuid}
                    onChangeText={(t) => setForm({ ...form, uuid: t })}
                    placeholder="ex.: B-000123-XYZ"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                  />
                </Field>

                {/* Bateria */}
                <Field label="Bateria (0–100)">
                  <TextInput
                    style={s.fieldInput}
                    value={form.bateria ?? ''}
                    onChangeText={(t) => setForm({ ...form, bateria: t.replace(/[^\d]/g, '') })}
                    keyboardType="number-pad"
                    placeholder="ex.: 75"
                    placeholderTextColor={colors.muted}
                  />
                </Field>

                {/* Moto ID */}
                <Field label="Moto ID">
                  <TextInput
                    style={s.fieldInput}
                    value={form.motoId ?? ''}
                    onChangeText={(t) => setForm({ ...form, motoId: t.replace(/[^\d]/g, '') })}
                    keyboardType="number-pad"
                    placeholder="ex.: 12"
                    placeholderTextColor={colors.muted}
                  />
                </Field>

                {/* Modelo Beacon ID */}
                <Field label="Modelo Beacon ID">
                  <TextInput
                    style={s.fieldInput}
                    value={form.modeloBeaconId ?? ''}
                    onChangeText={(t) => setForm({ ...form, modeloBeaconId: t.replace(/[^\d]/g, '') })}
                    keyboardType="number-pad"
                    placeholder="ex.: 5"
                    placeholderTextColor={colors.muted}
                  />
                </Field>

                {/* Ações */}
                <View style={s.actionsRow}>
                  <TouchableOpacity onPress={() => setOpen(false)} style={s.btnGhost}>
                    <Text style={s.btnGhostText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onSave} disabled={saving} style={[s.btnPrimary, saving && { opacity: 0.6 }]}>
                    {saving ? <ActivityIndicator color="#0b0b0b" /> : <Text style={s.btnPrimaryText}>Salvar</Text>}
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
  const s = getStyles(colors);
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

/* ---------- estilos baseados no tema ---------- */
type ThemeColors = {
  background: string; card: string; text: string; muted: string; border: string; primary: string; accent: string;
};

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    headerTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
    headerSub: { color: colors.muted, marginBottom: 10 },

    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    searchBox: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12,
      paddingHorizontal: 10, height: 40,
    },
    input: { flex: 1, color: colors.text, fontSize: 14 },
    filterBtn: {
      width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },

    row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, paddingRight: 4 },
    titleRow: { color: colors.text, fontWeight: '800', fontSize: 15, marginBottom: 6 },
    metaLine: { flexDirection: 'row', alignItems: 'center' },
    meta: { color: colors.muted, fontSize: 12 },

    rightCol: { alignItems: 'flex-end', gap: 10, marginLeft: 12 },
    actions: { flexDirection: 'row', gap: 6 },
    iconBtn: {
      width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },

    sep: { height: 1, backgroundColor: colors.border, opacity: 0.6 },

    fab: {
      position: 'absolute', right: 16, bottom: 24, width: 48, height: 48, borderRadius: 24,
      alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary,
      shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },

    // modal
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    modalCard: {
      marginHorizontal: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, maxHeight: '85%', overflow: 'hidden',
    },
    modalTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 10 },

    field: { marginBottom: 12 },
    fieldLabel: { color: colors.muted, fontSize: 12, marginBottom: 6, fontWeight: '700' },
    fieldInput: {
      height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.background, color: colors.text, paddingHorizontal: 10,
    },

    actionsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
    btnGhost: {
      flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border,
    },
    btnGhostText: { color: colors.text, fontWeight: '700' },

    btnPrimary: {
      flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    btnPrimaryText: { color: '#0b0b0b', fontWeight: '800' },
  });
}
