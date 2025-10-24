import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/Theme';
import AppLayout from '@/components/AppLayout';

type Zone = {
  id: string;
  label: string;
  motos: number;
  beacons: number;
};

const ZONES: Zone[] = [
  { id: 'A', label: 'Entrada', motos: 1, beacons: 1 },
  { id: 'B', label: 'Manutenção', motos: 0, beacons: 0 },
  { id: 'C', label: 'Armazenamento', motos: 0, beacons: 0 },
  { id: 'D', label: 'Estacionamento', motos: 0, beacons: 0 },
  { id: 'E', label: 'Loja', motos: 0, beacons: 0 },
];

export default function Mapa() {
  const { colors } = useTheme();
  const s = getStyles(colors);
  const [selected, setSelected] = useState<Zone | null>(null);

  const totalMotos = ZONES.reduce((acc, z) => acc + z.motos, 0);
  const totalBeacons = ZONES.reduce((acc, z) => acc + z.beacons, 0);

  return (
    <AppLayout>
      <View style={s.container}>
        <Text style={s.title}>Mapeamento do Pátio</Text>

        <View style={s.zonesContainer}>
          {ZONES.map(zone => (
            <TouchableOpacity
              key={zone.id}
              style={[s.zone, { borderColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={() => setSelected(zone)}
            >
              <View style={s.zoneIcons}>
                <Ionicons name="key-outline" size={16} color={colors.text} />
                <Ionicons name="bookmark-outline" size={16} color={colors.text} />
              </View>

              <Text style={s.zoneLabel}>{zone.label}</Text>

              <View style={s.zoneIcons}>
                <Ionicons name="person-outline" size={16} color={colors.text} />
                <Ionicons name="bicycle-outline" size={16} color={colors.text} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>
            {ZONES.length} zonas • {totalMotos} motos • {totalBeacons} beacons
          </Text>

          {selected && (
            <View style={[s.detailCard, { borderColor: colors.border }]}>
              <View style={s.detailHeader}>
                <Text style={s.detailTitle}>{selected.label}</Text>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Ionicons name="close-outline" size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>

              <View style={s.detailRow}>
                <Ionicons name="bicycle-outline" size={16} color={colors.muted} />
                <Text style={s.detailValue}>{selected.motos}</Text>
                <Text style={s.detailLabel}> Motos</Text>
              </View>
              <View style={s.detailRow}>
                <Ionicons name="bluetooth-outline" size={16} color={colors.muted} />
                <Text style={s.detailValue}>{selected.beacons}</Text>
                <Text style={s.detailLabel}> Beacons</Text>
              </View>
              <View style={s.detailRow}>
                <Ionicons name="analytics-outline" size={16} color={colors.muted} />
                <Text style={s.detailValue}>
                  {Math.round((selected.motos / 10) * 100) || 0}%
                </Text>
                <Text style={s.detailLabel}> Ocupação</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </AppLayout>
  );
}

/* ---------- estilos ---------- */

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  accent: string;
};

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    title: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },

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
    zoneIcons: { flexDirection: 'row', alignItems: 'center', gap: 8 },

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
      minWidth: 160,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 6,
    },
    detailHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    detailTitle: { color: colors.text, fontWeight: '800', fontSize: 13 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailLabel: { color: colors.muted, fontSize: 12 },
    detailValue: { color: colors.text, fontWeight: '700', fontSize: 13 },
  });
}
