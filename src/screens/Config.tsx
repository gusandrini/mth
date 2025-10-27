import React, { useMemo } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/Theme';
import AppLayout from '@/components/AppLayout';
import { useSession } from '@/services/SessionProvider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/api/apiClient';
import { getConfigStyles } from '@/styles/config';
import { useI18n } from '@/i18n/I18nProvider';

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

export default function Config() {
  const { colors, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const { t, locale, setLocale } = useI18n();
  const s = useMemo(() => getConfigStyles(colors), [colors]);

  // tenta usar o SessionProvider; se não houver, segue sem ele
  let session: ReturnType<typeof useSession> | null = null;
  try {
    session = useSession();
  } catch {
    session = null;
  }

  const isAuthenticated = !!session?.isAuthenticated;

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.confirmLogout'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (session?.logout) {
                await session.logout();
              } else {
                await AsyncStorage.multiRemove([TOKEN_KEY, USERNAME_KEY]);
                delete (apiClient.defaults.headers.common as any).Authorization;
              }
              Alert.alert(t('common.success'), t('common.loggedOut'));
              navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
            } catch (e) {
              console.error(e);
              Alert.alert(t('common.error'), t('common.logoutFailed'));
            }
          },
        },
      ]
    );
  };

  // 🔁 Alterna pt-BR <-> es-ES e persiste
  const handleLanguageToggle = async () => {
    const newLocale = locale.startsWith('pt') ? 'es-ES' : 'pt-BR';
    await setLocale(newLocale);

    Alert.alert(
      newLocale === 'pt-BR' ? 'Idioma alterado 🇧🇷' : 'Idioma cambiado 🇪🇸',
      newLocale === 'pt-BR'
        ? 'O idioma agora está em Português.'
        : 'El idioma ahora está en Español.'
    );
  };

  return (
    <AppLayout>
      <View style={s.container}>
        <Text style={s.title}>{t('settings.title')}</Text>

        {/* Tema */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.theme')}</Text>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <Ionicons name="moon-outline" size={18} color={colors.text} />
              <Text style={[s.label, { marginLeft: 8 }]}>
                {t('settings.darkMode')}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Idioma */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.language')}</Text>
          <TouchableOpacity style={s.row} onPress={handleLanguageToggle}>
            <View style={s.rowLeft}>
              <Ionicons name="language-outline" size={18} color={colors.text} />
              <Text style={[s.label, { marginLeft: 8 }]}>
                {locale.startsWith('pt') ? 'Português (Brasil)' : 'Español (España)'}
              </Text>
            </View>
            <Ionicons name="swap-horizontal-outline" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[s.btnDanger, !isAuthenticated && { opacity: 0.6 }]}
          onPress={handleLogout}
          disabled={!isAuthenticated}
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={s.btnDangerText}>{t('settings.logout')}</Text>
        </TouchableOpacity>
      </View>
    </AppLayout>
  );
}
