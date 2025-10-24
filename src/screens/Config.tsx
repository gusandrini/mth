import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/Theme';
import Bar from '@/components/Bar';

export default function Config() {
  const { colors, isDark, toggleTheme } = useTheme();
  const s = getStyles(colors);

  return (
    <View style={s.container}>
      <Text style={s.title}>Configurações</Text>

      {/* Bloco: Tema */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Tema</Text>

        {/* Alternar Dark/Light rápido */}
        <View style={s.row}>
          <Text style={s.label}>Modo escuro</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#ccc', true: colors.primary }}
            thumbColor={isDark ? '#fff' : '#fff'}
          />
        </View>

       
      </View>
      <Bar />
    </View>
  );
}

function SegmentItem({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? colors.primary : 'transparent',
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
      }}
    >
      <Text style={{ color: active ? '#0b0b0b' : colors.text, fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>
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
    label: { color: colors.text, fontSize: 14 },
    segment: { flexDirection: 'row', gap: 8 },
  });
}
