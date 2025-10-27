import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/Theme';
import AppLayout from '@/components/AppLayout';

import { Beacon, CreateLocalizacaoForm, Localizacao, Zone } from '@/models/mapa';
import { listLocalizacoes, createLocalizacao } from '@/api/mapa';
import { listBeacons } from '@/api/beacons';

export default function Mapa() {
  const { colors } = useTheme();
  const s = getStyles(colors);

  const [loading, setLoading] = useState(false);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [selected, setSelected] = useState<Zone | null>(null);

  // Modal criar Localizacao
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateLocalizacaoForm>({
    posicaoX: '',
    posicaoY: '',
    motoId: '',
    patioId: 0,
  });

  /** ===== Carrega tudo da API ===== */
  const load = async () => {
    try {
      setLoading(true);
      const [locs, bcs] = await Promise.all([listLocalizacoes(), listBeacons()]);
      setLocalizacoes(locs);
      setBeacons(bcs);
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || 'Não foi possível carregar dados do pátio.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /** ===== Deriva zonas a partir das localizações e beacons ===== */
  const zones: Zone[] = useMemo(() => {
    // motoId -> patioId (usa a última ocorrência na lista)
    const motoToPatio = new Map<number, number>();
    const patioNome = new Map<number, string>();
    for (const loc of localizacoes) {
      motoToPatio.set(loc.motoId, loc.patioId);
      if (loc.nomePatio) patioNome.set(loc.patioId, loc.nomePatio);
    }

    // motos por pátio (distintas)
    const patioToMotos = new Map<number, Set<number>>();
    for (const [motoId, patioId] of motoToPatio.entries()) {
      if (!patioToMotos.has(patioId)) patioToMotos.set(patioId, new Set());
      patioToMotos.get(patioId)!.add(motoId);
    }

    // beacons por pátio (via motoId -> patioId)
    const patioToBeacons = new Map<number, number>();
    for (const b of beacons) {
      if (!b.motoId) continue;
      const pId = motoToPatio.get(b.motoId);
      if (!pId) continue;
      patioToBeacons.set(pId, (patioToBeacons.get(pId) ?? 0) + 1);
    }

    // patioIds presentes
    const patioIds = new Set<number>([
      ...Array.from(patioToMotos.keys()),
      ...Array.from(patioToBeacons.keys()),
    ]);

    const out: Zone[] = Array.from(patioIds).map((id) => ({
      id,
      label: patioNome.get(id) ?? `Pátio ${id}`,
      motos: patioToMotos.get(id)?.size ?? 0,
      beacons: patioToBeacons.get(id) ?? 0,
    }));

    out.sort((a, b) => a.id - b.id);
    return out;
  }, [localizacoes, beacons]);

  const totalMotos = zones.reduce((acc, z) => acc + z.motos, 0);
  const totalBeacons = zones.reduce((acc, z) => acc + z.beacons, 0);

  /** ===== Ações UI ===== */
  const onSelectZone = (z: Zone) => {
    setSelected(z);
    // sempre reseta o form com o patioId da zona selecionada
    setForm({ posicaoX: '', posicaoY: '', motoId: '', patioId: z.id });
  };

  /** helpers */
  const toNumber = (v: string) => {
    if (!v || v.trim() === '') return undefined;
    const norm = v.replace(',', '.');
    const n = Number(norm);
    return Number.isNaN(n) ? undefined : n;
  };

  /** ===== Criar Localização (com validações + tratamento de erros) ===== */
  const onCreateLocalizacao = async () => {
    const posX = toNumber(form.posicaoX);
    const posY = toNumber(form.posicaoY);
    const motoId = Number(form.motoId);
    const patioId = Number(form.patioId);

    if (!patioId || !motoId || posX == null || posY == null) {
      Alert.alert('Validação', 'Preencha Moto ID, Posição X e Posição Y corretamente.');
      return;
    }

    // (opcional) verificação rápida: a moto tem beacon vinculado?
    const motoTemBeacon = beacons.some(b => b.motoId === motoId);
    if (!motoTemBeacon) {
      Alert.alert('Validação', 'Esta moto não possui beacon vinculado.');
      // remova este bloco se a regra permitir criar sem beacon
      return;
    }

    const payload = { posicaoX: posX, posicaoY: posY, motoId, patioId };

    try {
      setSaving(true);
      await createLocalizacao(payload);
      Alert.alert('Sucesso', 'Localização criada.');
      setOpen(false);
      setForm({ posicaoX: '', posicaoY: '', motoId: '', patioId: 0 });
      await load();
    } catch (e: any) {
      console.error(e);
      const status = e?.status;
      const msg = e?.message || 'Não foi possível salvar.';

      if (status === 409) {
        Alert.alert('Conflito', msg || 'Conflito de dados.');
      } else if (status === 400) {
        Alert.alert('Dados inválidos', msg);
      } else if (status === 404) {
        Alert.alert('Não encontrado', msg);
      } else {
        Alert.alert('Erro', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <View style={s.container}>
        <View style={s.headerRow}>
          <Text style={s.title}>Mapeamento do Pátio</Text>
          <TouchableOpacity style={s.refreshBtn} onPress={load} accessibilityLabel="Atualizar">
            <Ionicons name="refresh-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <View style={s.zonesContainer}>
              {zones.map((zone) => (
                <TouchableOpacity
                  key={zone.id}
                  style={[s.zone, { borderColor: colors.primary }]}
                  activeOpacity={0.8}
                  onPress={() => onSelectZone(zone)}
                  onLongPress={() => { onSelectZone(zone); setOpen(true); }}
                >
                  <View style={s.zoneIcons}>
                    <Ionicons name="key-outline" size={16} color={colors.text} />
                    <Ionicons name="bookmark-outline" size={16} color={colors.text} />
                  </View>

                  <View style={{ alignItems: 'center' }}>
                    <Text style={s.zoneLabel}>{zone.label}</Text>
                    <Text style={s.zoneSub}>
                      {zone.motos} motos • {zone.beacons} beacons
                    </Text>
                  </View>

                  <View style={s.zoneIcons}>
                    <Ionicons name="person-outline" size={16} color={colors.text} />
                    <Ionicons name="bicycle-outline" size={16} color={colors.text} />
                  </View>
                </TouchableOpacity>
              ))}
              {zones.length === 0 && (
                <Text style={s.empty}>Nenhum dado encontrado. Cadastre uma localização para começar.</Text>
              )}
            </View>

            <View style={s.footer}>
              <Text style={s.footerText}>
                {zones.length} zonas • {totalMotos} motos • {totalBeacons} beacons
              </Text>

              {selected && (
                <View style={[s.detailCard, { borderColor: colors.border }]}>
                  <View style={s.detailHeader}>
                    <Text style={s.detailTitle}>{selected.label}</Text>
                    <TouchableOpacity onPress={() => setSelected(null)}>
                      <Ionicons name="close-outline" size={18} color={colors.muted} />
                    </TouchableOpacity>
                  </View>

                  <View style={s.detailRow}>
                    <Ionicons name="bicycle-outline" size={16} color={colors.muted} />
                    <Text style={s.detailValue}>{selected.motos}</Text>
                    <Text style={s.detailLabel}> Motos</Text>
                  </View>
                  <View style={s.detailRow}>
                    <Ionicons name="bluetooth-outline" size={16} color={colors.muted} />
                    <Text style={s.detailValue}>{selected.beacons}</Text>
                    <Text style={s.detailLabel}> Beacons</Text>
                  </View>

                  <TouchableOpacity
                    style={s.primaryBtn}
                    onPress={() => { setForm(f => ({ ...f, patioId: selected.id })); setOpen(true); }}
                  >
                    <Text style={s.primaryBtnText}>Adicionar Localização</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}
      </View>

      {/* Modal: Criar Localização */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={s.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <View style={s.modalCard}>
              <ScrollView contentContainerStyle={{ padding: 14 }}>
                <Text style={s.modalTitle}>Nova Localização</Text>

                <Text style={s.fieldLabel}>Pátio ID</Text>
                <View style={[s.inputBox, { opacity: 0.8 }]}>
                  <Text style={s.inputText}>{form.patioId || '—'}</Text>
                </View>

                <Text style={s.fieldLabel}>Moto ID *</Text>
                <TextInput
                  style={s.input}
                  value={form.motoId}
                  onChangeText={(t) => setForm({ ...form, motoId: t.replace(/[^\d]/g, '') })}
                  keyboardType="number-pad"
                  placeholder="ex.: 12"
                  placeholderTextColor={colors.muted}
                />

                <View style={s.row2}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.fieldLabel}>Posição X *</Text>
                    <TextInput
                      style={s.input}
                      value={form.posicaoX}
                      onChangeText={(t) => setForm({ ...form, posicaoX: t })}
                      keyboardType="decimal-pad"
                      placeholder="ex.: 12.34"
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.fieldLabel}>Posição Y *</Text>
                    <TextInput
                      style={s.input}
                      value={form.posicaoY}
                      onChangeText={(t) => setForm({ ...form, posicaoY: t })}
                      keyboardType="decimal-pad"
                      placeholder="ex.: 56.78"
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                </View>

                <View style={s.actionsRow}>
                  <TouchableOpacity onPress={() => setOpen(false)} style={s.btnGhost}>
                    <Text style={s.btnGhostText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onCreateLocalizacao}
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

/* ---------- estilos ---------- */

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
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    title: { color: colors.text, fontSize: 18, fontWeight: '800' },

    refreshBtn: {
      width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },

    zonesContainer: { flex: 1, gap: 10 },
    zone: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 14, height: 70, borderRadius: 12, borderWidth: 2, backgroundColor: colors.card,
      shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4,
    },
    zoneLabel: { color: colors.text, fontWeight: '800', fontSize: 14 },
    zoneSub: { color: colors.muted, fontSize: 12, fontWeight: '700' },
    zoneIcons: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    footer: {
      borderTopWidth: 1, borderColor: colors.border, paddingTop: 10,
      alignItems: 'center', justifyContent: 'center',
    },
    footerText: { color: colors.muted, fontSize: 12, marginBottom: 8 },

    detailCard: {
      position: 'absolute', right: 10, bottom: 10, backgroundColor: colors.card,
      borderWidth: 1, borderRadius: 10, padding: 12, minWidth: 180,
      shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6, gap: 6,
    },
    detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
    detailTitle: { color: colors.text, fontWeight: '800', fontSize: 13 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailLabel: { color: colors.muted, fontSize: 12 },
    detailValue: { color: colors.text, fontWeight: '700', fontSize: 13 },

    primaryBtn: {
      marginTop: 6, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary,
    },
    primaryBtnText: { color: '#0b0b0b', fontWeight: '800' },

    // modal
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    modalCard: {
      marginHorizontal: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, maxHeight: '85%', overflow: 'hidden',
    },
    modalTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 10 },

    fieldLabel: { color: colors.muted, fontSize: 12, marginBottom: 6, fontWeight: '700' },
    input: {
      height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.background, color: colors.text, paddingHorizontal: 10, marginBottom: 10,
    },
    inputBox: {
      height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.background, paddingHorizontal: 10, marginBottom: 10,
      alignItems: 'flex-start', justifyContent: 'center',
    },
    inputText: { color: colors.text },

    row2: { flexDirection: 'row', gap: 10 },

    actionsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
    btnGhost: {
      flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border,
    },
    btnGhostText: { color: colors.text, fontWeight: '700' },
    btnPrimary: {
      flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary,
    },
    btnPrimaryText: { color: '#0b0b0b', fontWeight: '800' },
  });
}
