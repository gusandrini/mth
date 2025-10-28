import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/Theme';
import AppLayout from '@/components/AppLayout';

import { getMotoPatioStyles } from '@/styles/motoPatio';

import type { Moto, MotoForm } from '@/models/moto';
import { listMotos, createMoto, updateMoto, deleteMoto } from '@/api/moto';

import type { Beacon } from '@/models/beacons';
import { listBeacons } from '@/api/beacons';

import { useI18n } from '@/i18n/I18nProvider';

export default function MotoPatio() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const s = useMemo(() => getMotoPatioStyles(colors), [colors]);

  const [motos, setMotos] = useState<Moto[]>([]);
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  // Modal
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<Moto | null>(null);
  const [form, setForm] = useState<MotoForm>({ placa: '', clienteId: '', modeloMotoId: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [motosRes, beaconsRes] = await Promise.all([listMotos(), listBeacons()]);
      setMotos(motosRes);
      setBeacons(beaconsRes);
    } catch (e) {
      console.error(e);
      Alert.alert(t('common.error'), t('motos.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const sTerm = q.trim().toUpperCase();
    if (!sTerm) return motos;
    return motos.filter(
      (m) =>
        m.placa.toUpperCase().includes(sTerm) ||
        (m.modeloNome ?? '').toUpperCase().includes(sTerm) ||
        (m.fabricante ?? '').toUpperCase().includes(sTerm)
    );
  }, [motos, q]);

  const handleAdd = useCallback(() => {
    setEdit(null);
    setForm({ placa: '', clienteId: '', modeloMotoId: '' });
    setOpen(true);
  }, []);

  const handleEdit = useCallback((m: Moto) => {
    setEdit(m);
    setForm({
      placa: m.placa,
      clienteId: String(m.clienteId ?? ''),
      modeloMotoId: String(m.modeloMotoId ?? ''),
    });
    setOpen(true);
  }, []);

  const handleDelete = useCallback((m: Moto) => {
    Alert.alert(
      t('motos.deleteTitle'),
      t('motos.deleteMsg', { plate: m.placa }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('motos.deleteConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMoto(m.id);
              await load();
            } catch (e) {
              console.error(e);
              Alert.alert(t('common.error'), t('motos.deleteError'));
            }
          },
        },
      ]
    );
  }, [load, t]);

  const onSave = useCallback(async () => {
    const placa = form.placa?.trim().toUpperCase();
    const clienteId = Number(form.clienteId);
    const modeloMotoId = Number(form.modeloMotoId);

    if (!placa || !clienteId || !modeloMotoId) {
      Alert.alert(t('common.error'), t('motos.validation.fillRequired'));
      return;
    }

    try {
      setSaving(true);
      if (edit) {
        await updateMoto(edit.id, form);
        Alert.alert(t('common.success'), t('motos.updated'));
      } else {
        await createMoto(form);
        Alert.alert(t('common.success'), t('motos.created'));
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      console.error(e?.response?.data || e);
      Alert.alert(t('common.error'), e?.response?.data?.message || t('motos.saveError'));
    } finally {
      setSaving(false);
    }
  }, [edit, form, load, t]);

  const getBeaconByMoto = useCallback(
    (motoId: number) => beacons.find((b) => b.motoId === motoId)?.uuid ?? null,
    [beacons]
  );

  const renderItem = useCallback(({ item }: { item: Moto }) => (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.model}>
          {(item.modeloNome ?? t('motos.noModel'))} • {item.fabricante ?? '—'}
        </Text>
        <Text style={s.meta}>
          {t('motos.plate')}: <Text style={s.metaStrong}>{item.placa}</Text>
        </Text>
        <Text style={s.meta}>{t('motos.clientId')}: {item.clienteId}</Text>

        {getBeaconByMoto(item.id) && (
          <View style={s.beaconLine}>
            <Ionicons name="bluetooth-outline" size={14} color={colors.muted} />
            <Text style={[s.meta, { marginLeft: 4 }]}>{getBeaconByMoto(item.id)}</Text>
          </View>
        )}
      </View>

      <View style={s.rightCol}>
        <View style={s.actions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={s.iconBtn} accessibilityLabel={t('motos.edit')}>
            <Ionicons name="pencil-outline" size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={s.iconBtn} accessibilityLabel={t('motos.delete')}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [colors.muted, getBeaconByMoto, handleDelete, handleEdit, s, t]);

  const total = filtered.length;

  return (
    <AppLayout>
      <View style={s.container}>
        <Text style={s.title}>{t('motos.title')}</Text>
        <Text style={s.subtitle}>{t('motos.count', { count: total })}</Text>

        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Ionicons name="search-outline" size={16} color={colors.muted} style={s.searchIcon} />
            <TextInput
              style={s.input}
              placeholder={t('motos.searchPlaceholder')}
              placeholderTextColor={colors.muted}
              value={q}
              onChangeText={setQ}
              autoCapitalize="characters"
            />
          </View>
          <TouchableOpacity style={s.filterBtn} onPress={load} accessibilityLabel={t('motos.refresh')}>
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
            contentContainerStyle={s.listContent}
            ListEmptyComponent={<Text style={s.empty}>{t('motos.empty')}</Text>}
          />
        )}

        <TouchableOpacity style={s.fab} onPress={handleAdd} accessibilityLabel={t('motos.new')}>
          <Ionicons name="add" size={24} color="#0b0b0b" />
        </TouchableOpacity>

        {/* Modal de cadastro/edição */}
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <View style={s.modalBackdrop}>
            <KeyboardAvoidingView
              behavior={Platform.select({ ios: 'padding', android: undefined })}
              style={s.modalKav}
            >
              <View style={s.modalCard}>
                <ScrollView contentContainerStyle={s.modalScrollContent}>
                  <Text style={s.modalTitle}>{edit ? t('motos.editTitle') : t('motos.newTitle')}</Text>

                  <Text style={s.fieldLabel}>{t('motos.plateReq')}</Text>
                  <TextInput
                    style={s.input}
                    value={form.placa}
                    onChangeText={(tVal) => setForm({ ...form, placa: tVal.replace(/[^A-Za-z0-9]/g, '').toUpperCase() })}
                    placeholder={t('motos.platePh')}
                    placeholderTextColor={colors.muted}
                  />

                  <Text style={s.fieldLabel}>{t('motos.clientIdReq')}</Text>
                  <TextInput
                    style={s.input}
                    value={form.clienteId}
                    onChangeText={(tVal) => setForm({ ...form, clienteId: tVal.replace(/[^\d]/g, '') })}
                    keyboardType="number-pad"
                    placeholder={t('motos.clientIdPh')}
                    placeholderTextColor={colors.muted}
                  />

                  <Text style={s.fieldLabel}>{t('motos.modelIdReq')}</Text>
                  <TextInput
                    style={s.input}
                    value={form.modeloMotoId}
                    onChangeText={(tVal) => setForm({ ...form, modeloMotoId: tVal.replace(/[^\d]/g, '') })}
                    keyboardType="number-pad"
                    placeholder={t('motos.modelIdPh')}
                    placeholderTextColor={colors.muted}
                  />

                  <View style={s.actionsRow}>
                    <TouchableOpacity onPress={() => setOpen(false)} style={s.btnGhost}>
                      <Text style={s.btnGhostText}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={onSave}
                      disabled={saving}
                      style={[s.btnPrimary, saving && { opacity: 0.6 }]}
                    >
                      {saving ? <ActivityIndicator color="#0b0b0b" /> : <Text style={s.btnPrimaryText}>{t('motos.save')}</Text>}
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
