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

export default function MotoPatio() {
  const { colors } = useTheme();
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
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
    Alert.alert('Excluir', `Excluir moto ${m.placa}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMoto(m.id);
            await load();
          } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Não foi possível excluir.');
          }
        },
      },
    ]);
  }, [load]);

  const onSave = useCallback(async () => {
    const placa = form.placa?.trim().toUpperCase();
    const clienteId = Number(form.clienteId);
    const modeloMotoId = Number(form.modeloMotoId);

    if (!placa || !clienteId || !modeloMotoId) {
      Alert.alert('Validação', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setSaving(true);
      if (edit) {
        await updateMoto(edit.id, form);
        Alert.alert('Atualizado', 'Moto atualizada com sucesso.');
      } else {
        await createMoto(form);
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
  }, [edit, form, load]);

  const getBeaconByMoto = useCallback(
    (motoId: number) => beacons.find((b) => b.motoId === motoId)?.uuid ?? null,
    [beacons]
  );

  const renderItem = useCallback(({ item }: { item: Moto }) => (
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
  ), [colors.muted, getBeaconByMoto, handleDelete, handleEdit, s]);

  return (
    <AppLayout>
      <View style={s.container}>
        <Text style={s.title}>Motos no Pátio</Text>
        <Text style={s.subtitle}>{filtered.length} motos</Text>

        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Ionicons name="search-outline" size={16} color={colors.muted} style={s.searchIcon} />
            <TextInput
              style={s.input}
              placeholder="Buscar por placa, modelo, fabricante..."
              placeholderTextColor={colors.muted}
              value={q}
              onChangeText={setQ}
              autoCapitalize="characters"
            />
          </View>
          <TouchableOpacity style={s.filterBtn} onPress={load} accessibilityLabel="Atualizar lista">
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
          />
        )}

        <TouchableOpacity style={s.fab} onPress={handleAdd} accessibilityLabel="Nova moto">
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
