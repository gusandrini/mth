import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Bar from '@/components/Bar';
import { useTheme } from '@/context/Theme';

type RootStack = Record<string, object | undefined>;

export default function Home() {
  const navigation = useNavigation<NavigationProp<RootStack>>();
  const { colors } = useTheme();
    const s = getStyles(colors);


  // 5 faixas usando apenas variações da primary
  const zonePalette = [
    colors.primary,
    shade(colors.primary, -0.1),
    shade(colors.primary, -0.2),
    shade(colors.primary, -0.3),
    shade(colors.primary, -0.4),
  ];

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.content}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>Mottooth</Text>
            <Text style={s.subtitle}>Gestão de Pátio</Text>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={s.kpiRow}>
          <KpiCard title="Motos no" highlight="Pátio" icon="bicycle-outline" colors={colors} />
          <KpiCard title="Beacons" highlight="Ativos" icon="wifi-outline" align="right" colors={colors} />
        </View>

        {/* Resumo do Mapa */}
        <SectionHeader
          title="Resumo do Mapa"
          rightAction="Ver Mapa >"
          onPressRight={() => navigation.navigate('Mapa' as never)}
          leftIcons={[{ name: 'grid-outline' as const }, { name: 'construct-outline' as const }, { name: 'bicycle-outline' as const }]}
          colors={colors}
        />

        <View style={s.mapResumeContainer}>
          {/* Colunas*/}
          <View style={s.col}>
            <ZoneBar color={zonePalette[0]} label="Entrada (A)" colors={colors} />
            <ZoneBar color={zonePalette[2]} label="Manutenção (B)" colors={colors} />
            <ZoneBar color={zonePalette[1]} label="Armazenamento (C)" colors={colors} />
            <ZoneBar color={zonePalette[3]} label="Estacionamento (D)" colors={colors} />
            <ZoneBar color={zonePalette[4]} label="Loja (E)" colors={colors} />
          </View>
        </View>

        {/* Últimas motos */}
        <SectionHeader
          title="Últimas Motos Cadastradas"
          rightAction="Ver Todas >"
          onPressRight={() => navigation.navigate('MotoPatio' as never)}
          colors={colors}
        />
        <EmptyState text="Nenhuma moto cadastrada ainda" colors={colors} />

        {/* Últimos Beacons */}
        <SectionHeader
          title="Últimos Beacons"
          rightAction="Ver Todos >"
          onPressRight={() => navigation.navigate('Beacons' as never)}
          colors={colors}
        />
        <EmptyState text="Nenhum beacon cadastrado ainda" colors={colors} />

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Bottom bar fixa */}
      <Bar />
    </View>
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
  const { r, g, b } = hexToRgb(hex);
  const m = amount;
  const rr = clamp(m >= 0 ? r + (255 - r) * m : r * (1 + m));
  const gg = clamp(m >= 0 ? g + (255 - g) * m : g * (1 + m));
  const bb = clamp(m >= 0 ? b + (255 - b) * m : b * (1 + m));
  return `rgb(${Math.round(rr)}, ${Math.round(gg)}, ${Math.round(bb)})`;
}

// alpha: aplica transparência a uma cor base (hex)
function alpha(hex: string, a = 0.15) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
