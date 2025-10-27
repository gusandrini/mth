import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/theme/theme'; // ajuste o caminho se o tipo estiver em outro lugar

export function getConfigStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
      gap: 16,
    },
    title: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 4 },

    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
      gap: 12,
    },
    cardTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },

    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    rowLeft: { flexDirection: 'row', alignItems: 'center' },

    label: { color: colors.text, fontSize: 14, fontWeight: '600' },

    btnDanger: {
      marginTop: 12,
      height: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EF4444',
      flexDirection: 'row',
      gap: 8,
    },
    btnDangerText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  });
}
