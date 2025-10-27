import { StyleSheet } from 'react-native';
import { alpha, shade } from '@/utils/colors';
import type { ThemeColors } from '@/theme/theme'; 

export const PILL_BASE = {
  minWidth: 22,
  height: 22,
  paddingHorizontal: 6,
  borderRadius: 11,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const R = 14;

export function getHomeStyles(colors: ThemeColors) {
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

    // utilitário visual
    iconCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: alpha(colors.text, 0.15),
    },
    rowCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });
}
