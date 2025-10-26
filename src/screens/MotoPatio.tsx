import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/Theme';
import AppLayout from '@/components/AppLayout';
import api from '@/api/apiClient';

type Moto = {
  id: number;
  placa: string;
  clienteId: number;
  modeloMotoId: number;
  nomeCliente?: string | null;
  modeloNome?: string | null;
  fabricante?: string | null;
};

type Beacon = {
  id: number;
  uuid: string;
  motoId?: number | null;
  modeloNome?: string | null;
};

export default function MotoPatio() {
  const { colors } = useTheme();
  const s = getStyles(colors);

  const [motos, setMotos] = useState<Moto[]>([]);
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  // Modal
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<Moto | null>(null);
  const [form, setForm] = useState({
    placa: '',
    clienteId: '',
    modeloMotoId: '',
  });

  const load = async () => {
    try {
      setLoading(true);
      const [motosRes, beaconsRes] = await Promise.all([
        api.get('/api/motos'),
        api.get('/api/beacons'),
      ]);
      setMotos(motosRes.data?.content ?? motosRes.data);
      setBeacons(beaconsRes.data?.content ?? beaconsRes.data);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toUpperCase();
    if (!s) return motos;
    return motos.filter(
      (m) =>
        m.placa.toUpperCase().includes(s) ||
        (m.modeloNome ?? '').toUpperCase().includes(s) ||
        (m.fabricante ?? '').toUpperCase().includes(s)
    );
  }, [motos, q]);

  const handleAdd = () => {
    setEdit(null);
    setForm({ placa: '', clienteId: '', modeloMotoId: '' });
    setOpen(true);
  };

  const handleEdit = (m: Moto) => {
    setEdit(m);
    setForm({
      placa: m.placa,
      clienteId: String(m.clienteId ?? ''),
      modeloMotoId: String(m.modeloMotoId ?? ''),
    });
    setOpen(true);
  };

  const handleDelete = (m: Moto) => {
    Alert.alert('Excluir', `Excluir moto ${m.placa}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/motos/${m.id}`);
            await load();
          } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Não foi possível excluir.');
          }
        },
      },
    ]);
  };

  const onSave = async () => {
    const placa = form.placa.toUpperCase().trim();
    const clienteId = Number(form.clienteId);
    const modeloMotoId = Number(form.modeloMotoId);

    if (!placa || !clienteId || !modeloMotoId) {
      Alert.alert('Validação', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const payload = { placa, clienteId, modeloMotoId };

    try {
      setSaving(true);
      if (edit) {
        await api.put(`/api/motos/${edit.id}`, payload);
        Alert.alert('Atualizado', 'Moto atualizada com sucesso.');
      } else {
        await api.post('/api/motos', payload);
        Alert.alert('Cadastrada', 'Moto cadastrada com sucesso.');
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      console.error(e?.response?.data || e);
      Alert.alert('Erro', e?.response?.data?.message || 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const getBeaconByMoto = (motoId: number) =>
    beacons.find((b) => b.motoId === motoId)?.uuid ?? null;

  const renderItem = ({ item }: { item: Moto }) => (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.model}>
          {item.modeloNome ?? 'Sem modelo'} • {item.fabricante ?? '—'}
        </Text>
        <Text style={s.meta}>
          Placa: <Text style={s.metaStrong}>{item.placa}</Text>
        </Text>
        <Text style={s.meta}>Cliente ID: {item.clienteId}</Text>
        {getBeaconByMoto(item.id) && (
          <View style={s.beaconLine}>
            <Ionicons name="bluetooth-outline" size={14} color={colors.muted} />
            <Text style={[s.meta, { marginLeft: 4 }]}>{getBeaconByMoto(item.id)}</Text>
          </View>
        )}
      </View>

      <View style={s.rightCol}>
        <View style={s.actions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={s.iconBtn}>
            <Ionicons name="pencil-outline" size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={s.iconBtn}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <AppLayout>
      <View style={s.container}>
        <Text style={s.title}>Motos no Pátio</Text>
        <Text style={s.subtitle}>{filtered.length} motos</Text>

        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Ionicons name="search-outline" size={16} color={colors.muted} style={{ marginRight: 8 }} />
            <TextInput
              style={s.input}
              placeholder="Buscar por placa, modelo, fabricante..."
              placeholderTextColor={colors.muted}
              value={q}
              onChangeText={setQ}
              autoCapitalize="characters"
            />
          </View>
          <TouchableOpacity style={s.filterBtn} onPress={load}>
            <Ionicons name="refresh-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(it) => String(it.id)}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={s.sep} />}
            contentContainerStyle={{ paddingBottom: 96 }}
          />
        )}

        <TouchableOpacity style={s.fab} onPress={handleAdd}>
          <Ionicons name="add" size={24} color="#0b0b0b" />
        </TouchableOpacity>

        {/* Modal de cadastro/edição */}
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <View style={s.modalBackdrop}>
            <KeyboardAvoidingView
              behavior={Platform.select({ ios: 'padding', android: undefined })}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <View style={s.modalCard}>
                <ScrollView contentContainerStyle={{ padding: 14 }}>
                  <Text style={s.modalTitle}>{edit ? 'Editar Moto' : 'Nova Moto'}</Text>

                  <Text style={s.fieldLabel}>Placa *</Text>
                  <TextInput
                    style={s.input}
                    value={form.placa}
                    onChangeText={(t) => setForm({ ...form, placa: t.replace(/[^A-Za-z0-9]/g, '').toUpperCase() })}
                    placeholder="ABC1234"
                    placeholderTextColor={colors.muted}
                  />

                  <Text style={s.fieldLabel}>Cliente ID *</Text>
                  <TextInput
                    style={s.input}
                    value={form.clienteId}
                    onChangeText={(t) => setForm({ ...form, clienteId: t.replace(/[^\d]/g, '') })}
                    keyboardType="number-pad"
                    placeholder="1"
                    placeholderTextColor={colors.muted}
                  />

                  <Text style={s.fieldLabel}>Modelo Moto ID *</Text>
                  <TextInput
                    style={s.input}
                    value={form.modeloMotoId}
                    onChangeText={(t) => setForm({ ...form, modeloMotoId: t.replace(/[^\d]/g, '') })}
                    keyboardType="number-pad"
                    placeholder="2"
                    placeholderTextColor={colors.muted}
                  />

                  <View style={s.actionsRow}>
                    <TouchableOpacity onPress={() => setOpen(false)} style={s.btnGhost}>
                      <Text style={s.btnGhostText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={onSave}
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
      </View>
    </AppLayout>
  );
}

/* ---------- estilos e helpers ---------- */
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
    fieldLabel: { color: colors.muted, fontSize: 12, marginBottom: 6, fontWeight: '700' },
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
