import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/theme/theme'; // ajuste se seu tipo estiver em outro lugar

export function getMotoPatioStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },

    title: { color: colors.text, fontSize: 18, fontWeight: '800' },
    subtitle: { color: colors.muted, marginBottom: 10 },

    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    searchBox: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12,
      paddingHorizontal: 10, height: 40,
    },
    input: { flex: 1, color: colors.text, fontSize: 14 },
    filterBtn: {
      width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },
    searchIcon: { marginRight: 8 },

    row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, paddingRight: 4 },
    model: { color: colors.text, fontWeight: '800', fontSize: 15, marginBottom: 4 },
    meta: { color: colors.muted, fontSize: 12 },
    metaStrong: { color: colors.text, fontWeight: '700' },
    beaconLine: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },

    rightCol: { alignItems: 'flex-end', gap: 10, marginLeft: 12 },
    actions: { flexDirection: 'row', gap: 6 },
    iconBtn: {
      width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },

    sep: { height: 1, backgroundColor: colors.border, opacity: 0.6 },
    listContent: { paddingBottom: 96 },

    fab: {
      position: 'absolute', right: 16, bottom: 24, width: 48, height: 48, borderRadius: 24,
      alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary,
      shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },

    // modal
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    modalCard: {
      marginHorizontal: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, maxHeight: '85%', overflow: 'hidden',
    },
    modalTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 10 },
    modalKav: { flex: 1, justifyContent: 'center' },
    modalScrollContent: { padding: 14 },

    fieldLabel: { color: colors.muted, fontSize: 12, marginBottom: 6, fontWeight: '700' },
    actionsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },

    btnGhost: {
      flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border,
    },
    btnGhostText: { color: colors.text, fontWeight: '700' },

    btnPrimary: {
      flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    btnPrimaryText: { color: '#0b0b0b', fontWeight: '800' },
  });
}
