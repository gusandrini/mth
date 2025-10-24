import React, { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import Bar from '@/components/Bar';
import { useTheme } from '@/context/Theme';

export default function AppLayout({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>{children}</View>
      <Bar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
