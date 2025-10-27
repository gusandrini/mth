import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AppLayout from '@/components/AppLayout';
import { useTheme } from '@/context/Theme';

// >>> imports da API
import { Beacon, Localizacao, Zone } from '@/models/mapa';
import { listLocalizacoes } from '@/api/mapa';
import { listBeacons } from '@/api/beacons';

type RootStack = Record<string, object | undefined>;

export default function Home() {
  const navigation = useNavigation<NavigationProp<RootStack>>();
  const { colors } = useTheme();
  const s = getStyles(colors);

  // estado de dados + ui
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // carregar dados
  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const [locs, bcs] = await Promise.all([listLocalizacoes(), listBeacons()]);
      setLocalizacoes(locs);
      setBeacons(bcs);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Falha ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ===== Derivações =====

  // Zonas (pátios) dinâmicas
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
      label: patioNome.get(id) ?? `Pátio ${id}`,
      motos: patioToMotos.get(id)?.size ?? 0,
      beacons: patioToBeacons.get(id) ?? 0,
    }));

    out.sort((a, b) => a.id - b.id);
    return out;
  }, [localizacoes, beacons]);

  // KPIs
  const motosNoPatio = useMemo(() => {
    const set = new Set(localizacoes.map(l => l.motoId));
    return set.size;
  }, [localizacoes]);

  const beaconsAtivos = beacons.length;

  // paleta de cores para as barras de zona
  const zonePalette = useMemo(() => ([
    colors.primary,
    shade(colors.primary, -0.1),
    shade(colors.primary, -0.2),
    shade(colors.primary, -0.3),
    shade(colors.primary, -0.4),
  ]), [colors.primary]);

  return (
    <AppLayout>
      <View style={s.screen}>
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.brand}>Mottooth</Text>
              <Text style={s.subtitle}>Gestão de Pátio</Text>
            </View>
          </View>

          {/* KPI Cards (dinâmicos) */}
          <View style={s.kpiRow}>
            <KpiCard title="Motos no" highlight={`${motosNoPatio} no Pátio`} icon="bicycle-outline" colors={colors} />
            <KpiCard title="Beacons" highlight={`${beaconsAtivos} Ativos`} icon="wifi-outline" align="right" colors={colors} />
          </View>

          {/* Erro */}
          {error && (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
              <Text style={{ color: '#ff6b6b', fontWeight: '700' }}>{error}</Text>
              <TouchableOpacity onPress={load} style={{ marginTop: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="refresh-outline" size={14} color={colors.text} />
                <Text style={{ color: colors.text, fontWeight: '700' }}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Resumo do Mapa */}
          <SectionHeader
            title="Resumo do Mapa"
            rightAction="Ver Mapa >"
            onPressRight={() => navigation.navigate('Mapa' as never)}
            leftIcons={[{ name: 'grid-outline' as const }, { name: 'construct-outline' as const }, { name: 'bicycle-outline' as const }]}
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
                    label={`${z.label} — ${z.motos} motos • ${z.beacons} beacons`}
                    colors={colors}
                  />
                ))
              ) : (
                <EmptyState text="Nenhum dado encontrado. Cadastre localizações." colors={colors} />
              )}
            </View>
          </View>

          {/* Últimas motos (derivadas das localizações) */}
          <SectionHeader
            title="Últimas Motos Cadastradas"
            rightAction="Ver Todas >"
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
                  title={m.placa || `Moto #${m.motoId}`}
                  subtitle={m.patio ? `Pátio: ${m.patio}` : undefined}
                  colors={colors}
                />
              ))}
            </View>
          ) : (
            <EmptyState text="Nenhuma moto cadastrada ainda" colors={colors} />
          )}

          {/* Últimos beacons */}
          <SectionHeader
            title="Últimos Beacons"
            rightAction="Ver Todos >"
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
                  subtitle={b.placaMoto ? `Moto: ${b.placaMoto}` : b.motoId ? `Moto #${b.motoId}` : undefined}
                  colors={colors}
                />
              ))}
            </View>
          ) : (
            <EmptyState text="Nenhum beacon cadastrado ainda" colors={colors} />
          )}

          <View style={{ height: 16 }} />
        </ScrollView>
      </View>
    </AppLayout>
  );
}

/* ---------- Componentes ---------- */

function KpiCard({
  title,
  highlight,
  icon,
  align = 'left',
  colors,
}: {
  title: string;
  highlight: string;
  icon: keyof typeof Ionicons.glyphMap;
  align?: 'left' | 'right';
  colors: ThemeColors;
}) {
  const s = getStyles(colors);
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
  title,
  rightAction,
  onPressRight,
  leftIcons,
  colors,
}: {
  title: string;
  rightAction?: string;
  onPressRight?: () => void;
  leftIcons?: { name: keyof typeof Ionicons.glyphMap }[];
  colors: ThemeColors;
}) {
  const s = getStyles(colors);
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionLeft}>
        <Text style={s.sectionTitle}>{title}</Text>
        {!!leftIcons?.length && (
          <View style={s.inlineIcons}>
            {leftIcons.map((it, idx) => (
              <Ionicons key={idx} name={it.name} size={16} color={colors.muted} style={{ marginLeft: 8 }} />
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
  const s = getStyles(colors);
  return (
    <View style={[s.zoneBarWrap, { borderColor: shade(color, -0.25) }]}>
      <View style={[s.zoneBar, { backgroundColor: color }]}>
        <View style={s.zoneIconsLeft}>
          <IconPill icon="key-outline" colors={colors} />
          <IconPill icon="bookmark-outline" colors={colors} />
        </View>

        <Text style={s.zoneLabel}>{label}</Text>

        <View style={s.zoneIconsRight}>
          <IconPill icon="person-outline" colors={colors} />
          <IconPill icon="bicycle-outline" colors={colors} />
        </View>
      </View>
    </View>
  );
}

function IconPill({ icon, colors }: { icon: keyof typeof Ionicons.glyphMap; colors: ThemeColors }) {
  return (
    <View style={[pillBase, { backgroundColor: alpha(colors.text, 0.15) }]}>
      <Ionicons name={icon} size={12} color={colors.text} />
    </View>
  );
}

function ListRow({
  leftIcon, title, subtitle, colors,
}: { leftIcon: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string; colors: ThemeColors }) {
  return (
    <View style={{
      backgroundColor: colors.card, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
      borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(colors.text, 0.15) }}>
          <Ionicons name={leftIcon} size={14} color={colors.text} />
        </View>
        <View>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 13 }}>{title}</Text>
          {!!subtitle && <Text style={{ color: colors.muted, fontSize: 11 }}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward-outline" size={16} color={colors.muted} />
    </View>
  );
}

function EmptyState({ text, colors }: { text: string; colors: ThemeColors }) {
  const s = getStyles(colors);
  return (
    <View style={s.emptyBox}>
      <Text style={s.emptyText}>{text}</Text>
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

const R = 14;
const pillBase = {
  minWidth: 22,
  height: 22,
  paddingHorizontal: 6,
  borderRadius: 11,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 14, paddingTop: 14 },

    header: { marginBottom: 12 },
    brand: { color: colors.text, fontSize: 22, fontWeight: '800' },
    subtitle: { color: colors.muted, fontSize: 12, fontWeight: '600' },

    kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
    kpiCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
    },
    kpiDots: { flexDirection: 'row', gap: 4, marginBottom: 10 },
    dotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: shade(colors.card, -0.25) },
    kpiRowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    kpiTitle: { color: colors.muted, fontSize: 12, fontWeight: '700' },
    kpiHighlight: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 2 },
    kpiStatusDot: { width: 6, height: 6, borderRadius: 3, position: 'absolute', right: 10, bottom: 10 },

    sectionHeader: {
      marginTop: 12,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionLeft: { flexDirection: 'row', alignItems: 'center' },
    sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
    inlineIcons: { flexDirection: 'row', marginLeft: 8 },
    link: { color: colors.muted, fontSize: 12, fontWeight: '700' },

    mapResumeContainer: {
      backgroundColor: colors.accent,
      borderRadius: R,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      paddingBottom: 14,
      marginBottom: 16,
      flexDirection: 'row',
      gap: 10,
    },
    col: { flex: 1, gap: 10 },

    zoneBarWrap: { borderWidth: 2, borderRadius: 12, padding: 2, backgroundColor: alpha(colors.text, 0.06) },
    zoneBar: {
      height: 56,
      borderRadius: 10,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    zoneIconsLeft: { flexDirection: 'row', gap: 6 },
    zoneLabel: { color: colors.text, fontWeight: '800', fontSize: 13 },
    zoneIconsRight: { flexDirection: 'row', gap: 6 },

    emptyBox: { paddingVertical: 30, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: colors.muted, fontSize: 12, fontStyle: 'italic' },
  });
}

/* ---------- helpers (sem libs externas) ---------- */
function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function clamp(n: number, min = 0, max = 255) {
  return Math.max(min, Math.min(max, n));
}
// shade: negativo = escurecer, positivo = clarear (0..1)
function shade(hex: string, amount = -0.1) {
  // aceita tanto hex quanto rgb(); aqui só lidamos com hex (#RRGGBB)
  if (hex.startsWith('rgb')) return hex; // fallback simples para evitar quebrar cores já em rgb
  const { r, g, b } = hexToRgb(hex);
  const m = amount;
  const rr = clamp(m >= 0 ? r + (255 - r) * m : r * (1 + m));
  const gg = clamp(m >= 0 ? g + (255 - g) * m : g * (1 + m));
  const bb = clamp(m >= 0 ? b + (255 - b) * m : b * (1 + m));
  return `rgb(${Math.round(rr)}, ${Math.round(gg)}, ${Math.round(bb)})`;
}
// alpha: aplica transparência a uma cor base (hex)
function alpha(hex: string, a = 0.15) {
  if (hex.startsWith('rgb')) {
    // rgb(r,g,b) -> rgba(r,g,b,a)
    const content = hex.replace(/[^\d,]/g, '');
    const [r, g, b] = content.split(',').map((v) => Number(v.trim()));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/* ---------- helpers de listas ---------- */
function getUltimasMotos(localizacoes: Localizacao[]) {
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
  arr.sort((a, b) => (new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime()));
  return arr.slice(0, 5);
}

function getUltimosBeacons(beacons: Beacon[]) {
  const sorted = [...beacons].sort((a, b) => b.id - a.id);
  return sorted.slice(0, 5);
}
