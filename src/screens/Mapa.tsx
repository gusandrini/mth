import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/Theme';
import AppLayout from '@/components/AppLayout';

import { Beacon, CreateLocalizacaoForm, Localizacao, Zone } from '@/models/mapa';
import { listLocalizacoes, createLocalizacao } from '@/api/mapa';
import { listBeacons } from '@/api/beacons';

import { getMapaStyles } from '@/styles/mapa';
import { useI18n } from '@/i18n/I18nProvider';

export default function Mapa() {
  const { colors } = useTheme();
  const s = useMemo(() => getMapaStyles(colors), [colors]);
  const { t } = useI18n();

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
      const msg = e?.message || t('mapa.loadError');
      Alert.alert(t('common.error'), msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /** ===== Deriva zonas ===== */
  const zones: Zone[] = useMemo(() => {
    const motoToPatio = new Map<number, number>();
    const patioNome = new Map<number, string>();
    for (const loc of localizacoes) {
      motoToPatio.set(loc.motoId, loc.patioId);
      if (loc.nomePatio) patioNome.set(loc.patioId, loc.nomePatio);
    }

    const patioToMotos = new Map<number, Set<number>>();
    for (const [, patioId] of motoToPatio.entries()) {
      if (!patioToMotos.has(patioId)) patioToMotos.set(patioId, new Set());
      patioToMotos.get(patioId)!.add(1 as any);
    }

    const patioToBeacons = new Map<number, number>();
    for (const b of beacons) {
      if (!b.motoId) continue;
      const pId = motoToPatio.get(b.motoId);
      if (!pId) continue;
      patioToBeacons.set(pId, (patioToBeacons.get(pId) ?? 0) + 1);
    }

    const patioIds = new Set<number>([
      ...Array.from(patioToMotos.keys()),
      ...Array.from(patioToBeacons.keys()),
    ]);

    const out: Zone[] = Array.from(patioIds).map((id) => ({
      id,
      // usa nome vindo da API OU fallback traduzido “Pátio/Patio {{id}}”
      label: patioNome.get(id) ?? t('home.yard', { id }),
      motos: patioToMotos.get(id)?.size ?? 0,
      beacons: patioToBeacons.get(id) ?? 0,
    }));

    out.sort((a, b) => a.id - b.id);
    return out;
  }, [localizacoes, beacons, t]);

  const totalMotos = zones.reduce((acc, z) => acc + z.motos, 0);
  const totalBeacons = zones.reduce((acc, z) => acc + z.beacons, 0);

  /** ===== Ações UI ===== */
  const onSelectZone = (z: Zone) => {
    setSelected(z);
    setForm({ posicaoX: '', posicaoY: '', motoId: '', patioId: z.id });
  };

  /** helpers */
  const toNumber = (v: string) => {
    if (!v || v.trim() === '') return undefined;
    const norm = v.replace(',', '.');
    const n = Number(norm);
    return Number.isNaN(n) ? undefined : n;
  };

  /** ===== Criar Localização ===== */
  const onCreateLocalizacao = async () => {
    const posX = toNumber(form.posicaoX);
    const posY = toNumber(form.posicaoY);
    const motoId = Number(form.motoId);
    const patioId = Number(form.patioId);

    if (!patioId || !motoId || posX == null || posY == null) {
      Alert.alert(t('common.error'), t('mapa.validation.fillFields'));
      return;
    }

    const motoTemBeacon = beacons.some(b => b.motoId === motoId);
    if (!motoTemBeacon) {
      Alert.alert(t('common.error'), t('mapa.validation.noBeacon'));
      return;
    }

    const payload = { posicaoX: posX, posicaoY: posY, motoId, patioId };

    try {
      setSaving(true);
      await createLocalizacao(payload);
      Alert.alert(t('common.success'), t('mapa.created'));
      setOpen(false);
      setForm({ posicaoX: '', posicaoY: '', motoId: '', patioId: 0 });
      await load();
    } catch (e: any) {
      console.error(e);
      const status = e?.status;
      const msg = e?.message || t('mapa.saveError');

      if (status === 409) Alert.alert(t('mapa.conflictTitle'), msg || t('mapa.conflictFallback'));
      else if (status === 400) Alert.alert(t('mapa.invalidTitle'), msg);
      else if (status === 404) Alert.alert(t('mapa.notFoundTitle'), msg);
      else Alert.alert(t('common.error'), msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <View style={s.container}>
        <View style={s.headerRow}>
          <Text style={s.title}>{t('mapa.title')}</Text>
          <TouchableOpacity style={s.refreshBtn} onPress={load} accessibilityLabel={t('mapa.refresh')}>
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
                      {t('mapa.zoneCounts', { motos: zone.motos, beacons: zone.beacons })}
                    </Text>
                  </View>

                  <View style={s.zoneIcons}>
                    <Ionicons name="person-outline" size={16} color={colors.text} />
                    <Ionicons name="bicycle-outline" size={16} color={colors.text} />
                  </View>
                </TouchableOpacity>
              ))}
              {zones.length === 0 && (
                <Text style={s.empty}>{t('mapa.empty')}</Text>
              )}
            </View>

            <View style={s.footer}>
              <Text style={s.footerText}>
                {t('mapa.footerCounts', { zones: zones.length, motos: totalMotos, beacons: totalBeacons })}
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
                    <Text style={s.detailLabel}> {t('mapa.motos')}</Text>
                  </View>
                  <View style={s.detailRow}>
                    <Ionicons name="bluetooth-outline" size={16} color={colors.muted} />
                    <Text style={s.detailValue}>{selected.beacons}</Text>
                    <Text style={s.detailLabel}> {t('mapa.beacons')}</Text>
                  </View>

                  <TouchableOpacity
                    style={s.primaryBtn}
                    onPress={() => { setForm(f => ({ ...f, patioId: selected.id })); setOpen(true); }}
                  >
                    <Text style={s.primaryBtnText}>{t('mapa.addLocation')}</Text>
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
            style={s.modalKav}
          >
            <View style={s.modalCard}>
              <ScrollView contentContainerStyle={s.modalScrollContent}>
                <Text style={s.modalTitle}>{t('mapa.newTitle')}</Text>

                <Text style={s.fieldLabel}>{t('mapa.patioId')}</Text>
                <View style={[s.inputBox, { opacity: 0.8 }]}>
                  <Text style={s.inputText}>{form.patioId || '—'}</Text>
                </View>

                <Text style={s.fieldLabel}>{t('mapa.motoIdReq')}</Text>
                <TextInput
                  style={s.input}
                  value={form.motoId}
                  onChangeText={(t2) => setForm({ ...form, motoId: t2.replace(/[^\d]/g, '') })}
                  keyboardType="number-pad"
                  placeholder={t('mapa.motoIdPh')}
                  placeholderTextColor={colors.muted}
                />

                <View style={s.row2}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.fieldLabel}>{t('mapa.posX')}</Text>
                    <TextInput
                      style={s.input}
                      value={form.posicaoX}
                      onChangeText={(t2) => setForm({ ...form, posicaoX: t2 })}
                      keyboardType="decimal-pad"
                      placeholder={t('mapa.posXPh')}
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.fieldLabel}>{t('mapa.posY')}</Text>
                    <TextInput
                      style={s.input}
                      value={form.posicaoY}
                      onChangeText={(t2) => setForm({ ...form, posicaoY: t2 })}
                      keyboardType="decimal-pad"
                      placeholder={t('mapa.posYPh')}
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                </View>

                <View style={s.actionsRow}>
                  <TouchableOpacity onPress={() => setOpen(false)} style={s.btnGhost}>
                    <Text style={s.btnGhostText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onCreateLocalizacao}
                    disabled={saving}
                    style={[s.btnPrimary, saving && { opacity: 0.6 }]}
                  >
                    {saving ? <ActivityIndicator color="#0b0b0b" /> : <Text style={s.btnPrimaryText}>{t('mapa.save')}</Text>}
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
