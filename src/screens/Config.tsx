import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/Theme';
import AppLayout from '@/components/AppLayout';
import { useSession } from '@/services/SessionProvider';

export default function Config() {
  const { colors, isDark, toggleTheme } = useTheme();
  const s = getStyles(colors);

  // -------- sessão opcional (fallback sem provider) --------
  let session: ReturnType<typeof useSession> | null = null;
  try {
    session = useSession();
  } catch {
    session = null; // sem provider -> modo visualização
  }
  const isAuthenticated = !!session?.isAuthenticated;
  const user = session?.user ?? { nome: 'Usuário de Demonstração', email: 'demo@mottu.com' };
  const logout = session?.logout ?? (async () => { /* noop no modo demo */ });

  return (
    <AppLayout>
      <View style={s.container}>
        <Text style={s.title}>Configurações</Text>

        {/* Preferências */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Preferências</Text>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <Ionicons name="moon-outline" size={18} color={colors.text} />
              <Text style={[s.label, { marginLeft: 8 }]}>Tema Escuro</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={'#fff'}
            />
          </View>
        </View>

        {/* Dados */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Dados</Text>

          <View style={s.rowBetween}>
            <Text style={s.smallLabel}>Nome</Text>
            <Text style={s.value}>{user.nome}</Text>
          </View>

          <View style={s.rowBetween}>
            <Text style={s.smallLabel}>E-mail</Text>
            <Text style={s.value}>{user.email}</Text>
          </View>

          <TouchableOpacity
            style={[s.btnDanger, !isAuthenticated && { opacity: 0.5 }]}
            onPress={logout}
            disabled={!isAuthenticated}
            accessibilityLabel="Sair"
          >
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={s.btnDangerText}>{isAuthenticated ? 'Sair' : 'Sair (indisponível no modo demo)'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppLayout>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16, gap: 12 },
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
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 2,
    },

    label: { color: colors.text, fontSize: 14, fontWeight: '600' },
    smallLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
    value: { color: colors.text, fontSize: 14, fontWeight: '700' },

    btnDanger: {
      marginTop: 6,
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EF4444',
      flexDirection: 'row',
      gap: 8,
    },
    btnDangerText: { color: '#fff', fontWeight: '800' },
  });
}
