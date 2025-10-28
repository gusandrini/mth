import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AppLayout from '@/components/AppLayout';
import { useTheme } from '@/context/Theme';
import { useI18n } from '@/i18n/I18nProvider';

// API
import { Beacon, Localizacao, Zone } from '@/models/mapa';
import { listLocalizacoes } from '@/api/mapa';
import { listBeacons } from '@/api/beacons';

// estilos e helpers
import { getHomeStyles, PILL_BASE } from '@/styles/home';
import { alpha, shade } from '@/utils/colors';
import type { ThemeColors } from '@/theme/theme';

type RootStack = Record<string, object | undefined>;

export default function Home() {
  const navigation = useNavigation<NavigationProp<RootStack>>();
  const { colors } = useTheme();
  const { t } = useI18n(); // usar t() para tudo
  const s = useMemo(() => getHomeStyles(colors), [colors]);

  // estado
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const [locs, bcs] = await Promise.all([listLocalizacoes(), listBeacons()]);
      setLocalizacoes(locs);
      setBeacons(bcs);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ===== Derivações =====
  const zones: Zone[] = useMemo(() => {
    const motoToPatio = new Map<number, number>();
    const patioNome = new Map<number, string>();
    for (const loc of localizacoes) {
      motoToPatio.set(loc.motoId, loc.patioId);
      if (loc.nomePatio) patioNome.set(loc.patioId, loc.nomePatio);
    }

    const patioToMotos = new Map<number, Set<number>>();
    for (const [motoId, patioId] of motoToPatio.entries()) {
      if (!patioToMotos.has(patioId)) patioToMotos.set(patioId, new Set());
      patioToMotos.get(patioId)!.add(motoId);
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
      label: patioNome.get(id) ?? t('home.yard', { id }), // “Pátio 1” / “Patio 1”
      motos: patioToMotos.get(id)?.size ?? 0,
      beacons: patioToBeacons.get(id) ?? 0,
    }));

    out.sort((a, b) => a.id - b.id);
    return out;
  }, [localizacoes, beacons, t]);

  const motosNoPatio = useMemo(
    () => new Set(localizacoes.map((l) => l.motoId)).size,
    [localizacoes]
  );
  const beaconsAtivos = beacons.length;

  const zonePalette = useMemo(
    () => [
      colors.primary,
      shade(colors.primary, -0.1),
      shade(colors.primary, -0.2),
      shade(colors.primary, -0.3),
      shade(colors.primary, -0.4),
    ],
    [colors.primary]
  );

  // labels localizadas
  const kpiMotosHighlight = `${motosNoPatio} ${t('home.kpiMotosSuffix')}`;      // “no Pátio” / “en el Patio”
  const kpiBeaconsHighlight = `${beaconsAtivos} ${t('home.kpiBeaconsSuffix')}`; // “Ativos” / “Activos”

  const zoneCountsLabel = (z: Zone) =>
    t('home.zoneCounts', { label: z.label, motos: z.motos, beacons: z.beacons });

  return (
    <AppLayout>
      <View style={s.screen}>
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.brand}>{t('home.brand')}</Text>
              <Text style={s.subtitle}>{t('home.subtitle')}</Text>
            </View>
          </View>

          {/* KPI Cards */}
          <View style={s.kpiRow}>
            <KpiCard
              title={t('home.kpiMotosTitle')}
              highlight={kpiMotosHighlight}
              icon="bicycle-outline"
              colors={colors}
            />
            <KpiCard
              title={t('home.kpiBeaconsTitle')}
              highlight={kpiBeaconsHighlight}
              icon="wifi-outline"
              align="right"
              colors={colors}
            />
          </View>

          {/* Erro */}
          {error && (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
              <Text style={{ color: '#ff6b6b', fontWeight: '700' }}>{error}</Text>
              <TouchableOpacity
                onPress={load}
                style={{
                  marginTop: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="refresh-outline" size={14} color={colors.text} />
                <Text style={{ color: colors.text, fontWeight: '700' }}>
                  {t('common.tryAgain')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Resumo do Mapa */}
          <SectionHeader
            title={t('home.mapSummary')}
            rightAction={t('home.seeMap')}
            onPressRight={() => navigation.navigate('Mapa' as never)}
            colors={colors}
          />

          <View style={s.mapResumeContainer}>
            <View style={s.col}>
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : zones.length ? (
                zones.slice(0, 5).map((z, idx) => (
                  <ZoneBar
                    key={z.id}
                    color={zonePalette[idx % zonePalette.length]}
                    label={zoneCountsLabel(z)}
                    colors={colors}
                  />
                ))
              ) : (
                <EmptyState text={t('common.empty')} colors={colors} />
              )}
            </View>
          </View>

          {/* Últimas Motos */}
          <SectionHeader
            title={t('home.lastMotos')}
            rightAction={t('home.seeAll')}
            onPressRight={() => navigation.navigate('MotoPatio' as never)}
            colors={colors}
          />
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : localizacoes.length ? (
            <View style={{ gap: 8, marginBottom: 8 }}>
              {getUltimasMotos(localizacoes).map((m) => (
                <ListRow
                  key={m.motoId}
                  leftIcon="bicycle-outline"
                  title={m.placa || t('home.bikeNumber', { id: m.motoId })}
                  subtitle={
                    m.patio ? t('home.yardLabel', { name: m.patio }) : undefined
                  }
                  colors={colors}
                />
              ))}
            </View>
          ) : (
            <EmptyState text={t('home.noBikes')} colors={colors} />
          )}

          {/* Últimos Beacons */}
          <SectionHeader
            title={t('home.lastBeacons')}
            rightAction={t('home.seeAll')}
            onPressRight={() => navigation.navigate('Beacons' as never)}
            colors={colors}
          />
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : beacons.length ? (
            <View style={{ gap: 8 }}>
              {getUltimosBeacons(beacons).map((b) => (
                <ListRow
                  key={b.id}
                  leftIcon="bluetooth-outline"
                  title={b.uuid}
                  subtitle={
                    b.placaMoto
                      ? t('home.bikeLabel', { plate: b.placaMoto })
                      : b.motoId
                      ? t('home.bikeNumber', { id: b.motoId })
                      : undefined
                  }
                  colors={colors}
                />
              ))}
            </View>
          ) : (
            <EmptyState text={t('home.noBeacons')} colors={colors} />
          )}

          <View style={{ height: 16 }} />
        </ScrollView>
      </View>
    </AppLayout>
  );
}

/* ---------- Componentes locais ---------- */

function KpiCard({
  title, highlight, icon, align = 'left', colors,
}: {
  title: string;
  highlight: string;
  icon: keyof typeof Ionicons.glyphMap;
  align?: 'left' | 'right';
  colors: ThemeColors;
}) {
  const s = useMemo(() => getHomeStyles(colors), [colors]);
  return (
    <View style={[s.kpiCard, align === 'right' && { alignItems: 'flex-end' }]}>
      <View style={s.kpiDots}>
        <View style={s.dotSmall} />
        <View style={s.dotSmall} />
        <View style={s.dotSmall} />
      </View>
      <View style={s.kpiRowTop}>
        <Text style={s.kpiTitle}>{title}</Text>
        <Ionicons name={icon} size={16} color={colors.muted} />
      </View>
      <Text style={s.kpiHighlight}>{highlight}</Text>
      <View style={[s.kpiStatusDot, { backgroundColor: colors.primary }]} />
    </View>
  );
}

function SectionHeader({
  title, rightAction, onPressRight, leftIcons, colors,
}: {
  title: string;
  rightAction?: string;
  onPressRight?: () => void;
  leftIcons?: { name: keyof typeof Ionicons.glyphMap }[];
  colors: ThemeColors;
}) {
  const s = useMemo(() => getHomeStyles(colors), [colors]);
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionLeft}>
        <Text style={s.sectionTitle}>{title}</Text>
        {!!leftIcons?.length && (
          <View style={s.inlineIcons}>
            {leftIcons.map((it, idx) => (
              <Ionicons
                key={idx}
                name={it.name}
                size={16}
                color={colors.muted}
                style={{ marginLeft: 8 }}
              />
            ))}
          </View>
        )}
      </View>
      {!!rightAction && (
        <TouchableOpacity onPress={onPressRight} activeOpacity={0.8}>
          <Text style={s.link}>{rightAction}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ZoneBar({ color, label, colors }: { color: string; label: string; colors: ThemeColors }) {
  const s = useMemo(() => getHomeStyles(colors), [colors]);
  return (
    <View style={[s.zoneBarWrap, { borderColor: shade(color, -0.25) }]}>
      <View style={[s.zoneBar, { backgroundColor: color, justifyContent: 'center' }]}>
        <Text style={s.zoneLabel}>{label}</Text>
      </View>
    </View>
  );
}


function IconPill({ icon, colors }: { icon: keyof typeof Ionicons.glyphMap; colors: ThemeColors }) {
  return (
    <View style={[PILL_BASE, { backgroundColor: alpha(colors.text, 0.15) }]}>
      <Ionicons name={icon} size={12} color={colors.text} />
    </View>
  );
}

function ListRow({
  leftIcon, title, subtitle, colors,
}: {
  leftIcon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  colors: ThemeColors;
}) {
  const s = useMemo(() => getHomeStyles(colors), [colors]);
  return (
    <View style={s.rowCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={s.iconCircle}>
          <Ionicons name={leftIcon} size={14} color={colors.text} />
        </View>
        <View>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 13 }}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={{ color: colors.muted, fontSize: 11 }}>{subtitle}</Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward-outline" size={16} color={colors.muted} />
    </View>
  );
}

function EmptyState({ text, colors }: { text: string; colors: ThemeColors }) {
  const s = useMemo(() => getHomeStyles(colors), [colors]);
  return (
    <View style={s.emptyBox}>
      <Text style={s.emptyText}>{text}</Text>
    </View>
  );
}

/* ---------- lista "ultimos" ---------- */
function getUltimasMotos(localizacoes: Localizacao[], limit: number = 2) {
  type LastMoto = { motoId: number; placa?: string | null; patio?: string | null; data?: string | null };
  const byMoto = new Map<number, Localizacao>();

  for (const loc of localizacoes) {
    const prev = byMoto.get(loc.motoId);
    if (!prev) { byMoto.set(loc.motoId, loc); continue; }
    if (loc.dataHora && prev.dataHora) {
      if (new Date(loc.dataHora).getTime() > new Date(prev.dataHora).getTime()) byMoto.set(loc.motoId, loc);
    } else {
      byMoto.set(loc.motoId, loc);
    }
  }

  const arr: LastMoto[] = Array.from(byMoto.values()).map((l) => ({
    motoId: l.motoId,
    placa: l.placaMoto ?? undefined,
    patio: l.nomePatio ?? undefined,
    data: l.dataHora ?? null,
  }));

  arr.sort((a, b) => new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime());
  return arr.slice(0, limit);
}

function getUltimosBeacons(beacons: Beacon[], limit: number = 2) {
  const sorted = [...beacons].sort((a, b) => b.id - a.id);
  return sorted.slice(0, limit);
}
