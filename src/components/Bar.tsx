import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/Theme';

type RouteKey = 'Home' | 'MotoPatio' | 'Beacons' | 'Mapa' | 'Config';

type Item = {
  key: RouteKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  routeName: RouteKey;
};

const ITEMS: Item[] = [
  { key: 'Home',      label: 'Início',  icon: 'home-outline',     routeName: 'Home' },
  { key: 'MotoPatio', label: 'Motos',   icon: 'bicycle-outline',  routeName: 'MotoPatio' },
  { key: 'Beacons',   label: 'Beacons', icon: 'wifi-outline',     routeName: 'Beacons' },
  { key: 'Mapa',      label: 'Mapa',    icon: 'map-outline',      routeName: 'Mapa' },
  { key: 'Config',    label: 'Config',  icon: 'settings-outline', routeName: 'Config' },
];

export default function Bar() {
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors, insets.bottom);

  const activeKey = useMemo<RouteKey | null>(() => {
    const current = ITEMS.find(i => i.routeName === route.name);
    return current?.key ?? null;
  }, [route.name]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {ITEMS.map(item => {
          const isActive = item.key === activeKey;
          const color = isActive ? colors.primary : colors.muted;

          return (
            <TouchableOpacity
              key={item.key}
              style={styles.item}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(item.routeName as never)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={item.label}
            >
              <Ionicons name={item.icon} size={22} color={color} />
              <Text style={[styles.label, { color }]}>{item.label}</Text>
              {isActive && <View style={[styles.dot, { backgroundColor:colors.primary }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function getStyles(
  colors: { card: string; border: string; primary: string; muted: string },
  bottomInset: number
) {
  return StyleSheet.create({
    wrapper: { backgroundColor: 'transparent', paddingBottom: Math.max(bottomInset, 10) },
    container: {
      marginHorizontal: 10,
      backgroundColor: colors.card,
      borderRadius: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 6,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    item: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
    label: { fontSize: 11, fontWeight: '600' },
    dot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  });
}
