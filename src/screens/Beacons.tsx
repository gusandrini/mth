import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  Modal,
  Switch,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AppLayout from '@/components/AppLayout';
import { useTheme } from '@/context/Theme';

type Beacon = {
  id: string;
  active: boolean;
  battery: number;     // 0..100
  rssi: number;        // 0..100 (força sinal)
  motoId?: string;     // id da moto vinculada
};

type Moto = { id: string; label: string };

// MOCKS – troque pela sua API
const MOTO_MOCK: Moto[] = [
  { id: 'none', label: 'Nenhuma' },
  { id: 'm1', label: 'Honda CG 160 (ABC1234)' },
  { id: 'm2', label: 'Yamaha Factor 150 (DEF5678)' },
];

const MOCK: Beacon[] = [
  { id: 'beacon-001', active: true, battery: 100, rssi: 100, motoId: 'm1' },
  { id: 'beacon-002', active: true, battery: 90, rssi: 88, motoId: 'm2' },
];

export default function Beacons() {
  const { colors } = useTheme();
  const s = getStyles(colors);

  const [query, setQuery] = useState('');
  const [data, setData] = useState<Beacon[]>(MOCK);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // form state
  const [form, setForm] = useState<Beacon>({
    id: `beacon-${Math.floor(Math.random() * 1000)}`,
    active: true,
    battery: 100,
    rssi: 100,
    motoId: 'none',
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(b => b.id.toLowerCase().includes(q));
  }, [query, data]);

  const total = filtered.length;

  const openNew = () => {
    setForm({
      id: `beacon-${Math.floor(Math.random() * 1000)}`,
      active: true,
      battery: 100,
      rssi: 100,
      motoId: 'none',
    });
    setOpen(true);
  };

  const handleSave = async () => {
    // validações simples
    if (!form.id.trim()) return;

    setSaving(true);
    try {
      // TODO: enviar para sua API
      await new Promise(res => setTimeout(res, 700));
      setData(prev => {
        const exists = prev.some(b => b.id === form.id);
        return exists ? prev.map(b => (b.id === form.id ? form : b)) : [form, ...prev];
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (b: Beacon) => {
    setData(prev => prev.filter(x => x.id !== b.id));
  };

  const renderItem: ListRenderItem<Beacon> = ({ item }) => (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.titleRow}>{item.id}</Text>
        <View style={s.metaLine}>
          <Ionicons name="battery-half-outline" size={14} color={colors.muted} />
          <Text style={s.meta}> {item.battery}%</Text>
          <Ionicons name="cellular-outline" size={14} color={colors.muted} style={{ marginLeft: 10 }} />
          <Text style={s.meta}> {item.rssi}%</Text>
        </View>
        {!!item.motoId && item.motoId !== 'none' && (
          <View style={[s.metaLine, { marginTop: 4 }]}>
            <Ionicons name="bicycle-outline" size={14} color={colors.muted} />
            <Text style={s.meta}>
              {' '}
              {MOTO_MOCK.find(m => m.id === item.motoId)?.label ?? item.motoId}
            </Text>
          </View>
        )}
      </View>

      <View style={s.rightCol}>
        <StatusChip active={item.active} colors={colors} />
        <View style={s.actions}>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => {
              setForm(item);
              setOpen(true);
            }}
            accessibilityLabel="Editar"
          >
            <Ionicons name="pencil-outline" size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => handleDelete(item)}
            accessibilityLabel="Excluir"
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <AppLayout>
      <View style={s.container}>
        {/* Header */}
        <Text style={s.headerTitle}>Beacons</Text>
        <Text style={s.headerSub}>{total} {total === 1 ? 'beacon' : 'beacons'}</Text>

        {/* Busca + filtro */}
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Ionicons name="search-outline" size={16} color={colors.muted} style={{ marginRight: 8 }} />
            <TextInput
              style={s.input}
              placeholder="Buscar por ID do beacon..."
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={s.filterBtn} onPress={() => {}} accessibilityLabel="Filtrar">
            <Ionicons name="filter-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Lista */}
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 96 }}
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />

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
                <Text style={s.modalTitle}>{form?.id ? 'Editar Beacon' : 'Novo Beacon'}</Text>

                <Field label="ID">
                  <TextInput
                    style={s.fieldInput}
                    value={form.id}
                    onChangeText={(t) => setForm({ ...form, id: t })}
                    placeholder="beacon-xxx"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                  />
                </Field>

                <Field label="Status">
                  <View style={s.switchRow}>
                    <Text style={s.switchLabel}>{form.active ? 'Ativo' : 'Inativo'}</Text>
                    <Switch
                      value={form.active}
                      onValueChange={(v) => setForm({ ...form, active: v })}
                      trackColor={{ false: '#A3A3A3', true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                </Field>

                <View style={s.row2}>
                  <Field label="Nível da Bateria" flex>
                    <TextInput
                      style={s.fieldInput}
                      value={String(form.battery)}
                      onChangeText={(t) => setForm({ ...form, battery: Number(t.replace(/\D/g, '')) || 0 })}
                      keyboardType="number-pad"
                      placeholder="0-100"
                      placeholderTextColor={colors.muted}
                    />
                  </Field>

                  <Field label="Força do Sinal" flex>
                    <TextInput
                      style={s.fieldInput}
                      value={String(form.rssi)}
                      onChangeText={(t) => setForm({ ...form, rssi: Number(t.replace(/\D/g, '')) || 0 })}
                      keyboardType="number-pad"
                      placeholder="0-100"
                      placeholderTextColor={colors.muted}
                    />
                  </Field>
                </View>

                <Field label="Vincular à Moto">
                  <View style={s.pickerBox}>
                    <Picker
                      selectedValue={form.motoId}
                      onValueChange={(v) => setForm({ ...form, motoId: v })}
                      dropdownIconColor={colors.text}
                      style={{ color: colors.text }}
                    >
                      {MOTO_MOCK.map(m => (
                        <Picker.Item key={m.id} label={m.label} value={m.id} />
                      ))}
                    </Picker>
                  </View>
                </Field>

                {/* Ações */}
                <View style={s.actionsRow}>
                  <TouchableOpacity onPress={() => setOpen(false)} style={s.btnGhost}>
                    <Text style={s.btnGhostText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    style={[s.btnPrimary, saving && { opacity: 0.6 }]}
                  >
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

function Field({ label, children, flex }: { label: string; children: React.ReactNode; flex?: boolean }) {
  const { colors } = useTheme();
  const s = getStyles(colors);
  return (
    <View style={[s.field, flex && { flex: 1 }]}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function StatusChip({ active, colors }: { active: boolean; colors: ThemeColors }) {
  const bg = active ? colors.primary : tint(colors.border, 0.5);
  const fg = active ? '#0b0b0b' : colors.text;
  const label = active ? 'Ativo' : 'Inativo';
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
      <Text style={{ color: fg, fontWeight: '700', fontSize: 11 }}>{label}</Text>
    </View>
  );
}

/* ---------- estilos baseados no tema ---------- */

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  accent: string;
};

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    headerTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
    headerSub: { color: colors.muted, marginBottom: 10 },

    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 10,
      height: 40,
    },
    input: { flex: 1, color: colors.text, fontSize: 14 },
    filterBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },

    row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, paddingRight: 4 },
    titleRow: { color: colors.text, fontWeight: '800', fontSize: 15, marginBottom: 6 },
    metaLine: { flexDirection: 'row', alignItems: 'center' },
    meta: { color: colors.muted, fontSize: 12 },

    rightCol: { alignItems: 'flex-end', gap: 10, marginLeft: 12 },
    actions: { flexDirection: 'row', gap: 6 },
    iconBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },

    sep: { height: 1, backgroundColor: colors.border, opacity: 0.6 },

    fab: {
      position: 'absolute',
      right: 16,
      bottom: 24,
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },

    // modal
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    modalCard: {
      marginHorizontal: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      maxHeight: '85%',
      overflow: 'hidden',
    },
    modalTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 10 },

    field: { marginBottom: 12 },
    fieldLabel: { color: colors.muted, fontSize: 12, marginBottom: 6, fontWeight: '700' },
    fieldInput: {
      height: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      color: colors.text,
      paddingHorizontal: 10,
    },
    row2: { flexDirection: 'row', gap: 10 },

    pickerBox: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: colors.background,
    },

    actionsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
    btnGhost: {
      flex: 1,
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    btnGhostText: { color: colors.text, fontWeight: '700' },

    btnPrimary: {
      flex: 1,
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    btnPrimaryText: { color: '#0b0b0b', fontWeight: '800' },
  });
}

/* ---------- helpers ---------- */
function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function clamp(n: number, min = 0, max = 255) {
  return Math.max(min, Math.min(max, n));
}
function tint(hex: string, amount = 0.3) {
  const { r, g, b } = hexToRgb(hex);
  const rr = clamp(r + (255 - r) * amount);
  const gg = clamp(g + (255 - g) * amount);
  const bb = clamp(b + (255 - b) * amount);
  return `rgb(${Math.round(rr)}, ${Math.round(gg)}, ${Math.round(bb)})`;
}
