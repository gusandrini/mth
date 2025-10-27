import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/theme/theme'; // ajuste o path se necessário

export function getLoginStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: colors.card,
      width: '100%',
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    title: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '800',
      textAlign: 'center',
    },
    subtitle: {
      color: colors.muted,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      marginBottom: 12,
      paddingHorizontal: 10,
    },
    icon: { marginRight: 6 },
    input: {
      flex: 1,
      color: colors.text,
      paddingVertical: 10,
      fontSize: 14,
    },
    btn: {
      backgroundColor: colors.primary,
      height: 46,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    btnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    registerLink: {
      color: colors.primary,
      textAlign: 'center',
      marginTop: 14,
      fontWeight: '700',
    },
  });
}
