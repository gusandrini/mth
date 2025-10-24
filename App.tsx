import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from '@/context/Theme';

// telas
// import Login from '@/screens/Login';
import Home from '@/screens/Home';
// import MotoPatio from '@/screens/MotoPatio';
// import Beacons from '@/screens/Beacons';
// import Mapa from '@/screens/Mapa';
import Config from '@/screens/Config';

const Stack = createNativeStackNavigator();

function Routes() {
  const { isDark } = useTheme();
  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen name="Login" component={Login} /> */}
        <Stack.Screen name="Home" component={Home} />
        {/* <Stack.Screen name="MotoPatio" component={MotoPatio} />
        <Stack.Screen name="Beacons" component={Beacons} />
        <Stack.Screen name="Mapa" component={Mapa} /> */}
        <Stack.Screen name="Config" component={Config} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Routes />
    </ThemeProvider>
  );
}
