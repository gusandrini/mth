import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/Theme';
import AppLayout from '@/components/AppLayout';

type Bike = {
  id: string;
  model: string;
  plate: string;
  beacon?: string;
  status: 'ativa' | 'inativa' | 'manutencao';
};

// MOCK – troque por sua chamada à API
const MOCK: Bike[] = [
  { id: '1', model: 'Honda CG 160', plate: 'ABC1234', beacon: 'beacon-001', status: 'ativa' },
  { id: '2', model: 'Yamaha Factor 150', plate: 'DEF5678', beacon: 'beacon-002', status: 'ativa' },
];

export default function MotoPatio() {
  const { colors } = useTheme();
  const s = getStyles(colors);

  const [query, setQuery] = useState('');
  const [data, setData] = useState<Bike[]>(MOCK);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      b => b.model.toLowerCase().includes(q) || b.plate.toLowerCase().includes(q)
    );
  }, [data, query]);

  const total = filtered.length;

  const handleAdd = () => {
    // TODO: abrir tela/modal de cadastro
  };
  const handleFilter = () => {
    // TODO: filtros avançados
  };
  const handleEdit = (item: Bike) => {
    // TODO: editar item
  };
  const handleDelete = (item: Bike) => {
    // TODO: deletar item
    setData(x => x.filter(b => b.id !== item.id));
  };

  const renderItem: ListRenderItem<Bike> = ({ item }) => (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.model}>{item.model}</Text>
        <Text style={s.meta}>
          Placa: <Text style={s.metaStrong}>{item.plate}</Text>
        </Text>
        {!!item.beacon && (
          <View style={s.beaconLine}>
            <Ionicons name="bluetooth-outline" size={14} color={colors.muted} />
            <Text style={[s.meta, { marginLeft: 4 }]}>{item.beacon}</Text>
          </View>
        )}
      </View>

      <View style={s.rightCol}>
        <StatusChip status={item.status} colors={colors} />
        <View style={s.actions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={s.iconBtn} accessibilityLabel="Editar">
            <Ionicons name="pencil-outline" size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={s.iconBtn} accessibilityLabel="Excluir">
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
        <Text style={s.title}>Motos no Pátio</Text>
        <Text style={s.subtitle}>
          {total} {total === 1 ? 'moto' : 'motos'}
        </Text>

        {/* Busca + filtro */}
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Ionicons name="search-outline" size={16} color={colors.muted} style={{ marginRight: 8 }} />
            <TextInput
              style={s.input}
              placeholder="Buscar por placa ou modelo..."
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity style={s.filterBtn} onPress={handleFilter} accessibilityLabel="Filtrar">
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

        {/* FAB */}
        <TouchableOpacity style={s.fab} onPress={handleAdd} accessibilityLabel="Adicionar moto">
          <Ionicons name="add" size={24} color="#0b0b0b" />
        </TouchableOpacity>
      </View>
    </AppLayout>
  );
}

/* ---------- componentes auxiliares ---------- */

function StatusChip({
  status,
  colors,
}: {
  status: 'ativa' | 'inativa' | 'manutencao';
  colors: ThemeColors;
}) {
  const map = {
    ativa: { bg: colors.primary, fg: '#0b0b0b', label: 'Ativa' },
    inativa: { bg: tint(colors.border, 0.5), fg: colors.text, label: 'Inativa' },
    manutencao: { bg: tint(colors.text, 0.2), fg: '#0b0b0b', label: 'Manutenção' },
  } as const;
  const p = map[status];

  return (
    <View style={{ backgroundColor: p.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
      <Text style={{ color: p.fg, fontWeight: '700', fontSize: 11 }}>{p.label}</Text>
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
    title: { color: colors.text, fontSize: 18, fontWeight: '800' },
    subtitle: { color: colors.muted, marginBottom: 10 },

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

    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      paddingRight: 4,
    },
    model: { color: colors.text, fontWeight: '800', fontSize: 15, marginBottom: 4 },
    meta: { color: colors.muted, fontSize: 12 },
    metaStrong: { color: colors.text, fontWeight: '700' },
    beaconLine: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },

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
// clarear uma cor (0..1)
function tint(hex: string, amount = 0.3) {
  const { r, g, b } = hexToRgb(hex);
  const rr = clamp(r + (255 - r) * amount);
  const gg = clamp(g + (255 - g) * amount);
  const bb = clamp(b + (255 - b) * amount);
  return `rgb(${Math.round(rr)}, ${Math.round(gg)}, ${Math.round(bb)})`;
}
