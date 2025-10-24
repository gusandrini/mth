import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/Theme';
import AppLayout from '@/components/AppLayout';
import { useSession } from '@/services/SessionProvider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/api/apiClient';

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

export default function Config() {
  const { colors, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const s = getStyles(colors);

  // tenta usar o SessionProvider, se não houver, roda no modo standalone
  let session: ReturnType<typeof useSession> | null = null;
  try {
    session = useSession();
  } catch {
    session = null;
  }

  const isAuthenticated = !!session?.isAuthenticated;

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja encerrar sua sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              if (session?.logout) {
                await session.logout();
              } else {
                await AsyncStorage.multiRemove([TOKEN_KEY, USERNAME_KEY]);
                delete (apiClient.defaults.headers.common as any).Authorization;
              }
              Alert.alert('Sessão encerrada', 'Você foi desconectado.');
              navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
            } catch (e) {
              console.error(e);
              Alert.alert('Erro', 'Não foi possível sair da conta.');
            }
          },
        },
      ]
    );
  };

  return (
    <AppLayout>
      <View style={s.container}>
        <Text style={s.title}>Configurações</Text>

        {/* Bloco de tema */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Tema</Text>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <Ionicons name="moon-outline" size={18} color={colors.text} />
              <Text style={[s.label, { marginLeft: 8 }]}>Modo Escuro</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={'#fff'}
            />
          </View>
        </View>

        {/* Botão de logout */}
        <TouchableOpacity
          style={[s.btnDanger, !isAuthenticated && { opacity: 0.6 }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={s.btnDangerText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </AppLayout>
  );
}

function getStyles(colors: any) {
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
