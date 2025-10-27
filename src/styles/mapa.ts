import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/theme/theme'; // ajuste se seu tipo estiver em outro lugar

export function getMapaStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    title: { color: colors.text, fontSize: 18, fontWeight: '800' },

    refreshBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },

    zonesContainer: { flex: 1, gap: 10 },
    zone: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      height: 70,
      borderRadius: 12,
      borderWidth: 2,
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    zoneLabel: { color: colors.text, fontWeight: '800', fontSize: 14 },
    zoneSub: { color: colors.muted, fontSize: 12, fontWeight: '700' },
    zoneIcons: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    empty: { color: colors.muted, fontSize: 12, fontStyle: 'italic', textAlign: 'center' },

    footer: {
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingTop: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerText: { color: colors.muted, fontSize: 12, marginBottom: 8 },

    detailCard: {
      position: 'absolute',
      right: 10,
      bottom: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      minWidth: 180,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 6,
      gap: 6,
    },
    detailHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    detailTitle: { color: colors.text, fontWeight: '800', fontSize: 13 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailLabel: { color: colors.muted, fontSize: 12 },
    detailValue: { color: colors.text, fontWeight: '700', fontSize: 13 },

    primaryBtn: {
      marginTop: 6,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    primaryBtnText: { color: '#0b0b0b', fontWeight: '800' },

    // modal
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
    modalKav: { flex: 1, justifyContent: 'center' },
    modalScrollContent: { padding: 14 },

    fieldLabel: { color: colors.muted, fontSize: 12, marginBottom: 6, fontWeight: '700' },
    input: {
      height: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      color: colors.text,
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    inputBox: {
      height: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      paddingHorizontal: 10,
      marginBottom: 10,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    inputText: { color: colors.text },

    row2: { flexDirection: 'row', gap: 10 },

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
