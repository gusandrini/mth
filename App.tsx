// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from '@/context/Theme';
import { I18nProvider } from "@/i18n/I18nProvider";

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// telas
import Login from '@/screens/Login';
import Home from '@/screens/Home';
import MotoPatio from '@/screens/MotoPatio';
import Beacons from '@/screens/Beacons';
import Mapa from '@/screens/Mapa';
import Config from '@/screens/Config';
import RegisterScreen from '@/screens/Cadastro';

// Mostra alerta em foreground (iOS/Android)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    // campos exigidos pelo seu NotificationBehavior:
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


const Stack = createNativeStackNavigator();

function Routes() {
  const { isDark } = useTheme();

  // (Android) criar canal de notificação "default"
  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Padrão',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }, []);

  return (
    <I18nProvider>
      <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="MotoPatio" component={MotoPatio} />
          <Stack.Screen name="Beacons" component={Beacons} />
          <Stack.Screen name="Mapa" component={Mapa} />
          <Stack.Screen name="Ajustes" component={Config} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </I18nProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Routes />
    </ThemeProvider>
  );
}
