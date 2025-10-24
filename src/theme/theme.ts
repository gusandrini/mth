// tokens do tema (adicione mais tokens se precisar)
export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string; // verde Mottu
  accent: string;  // superfícies levemente destacadas
};

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  card: '#F5F7F9',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  primary: '#00C04B', // Mottu green
  accent: '#F0FFF7',
};

export const darkColors: ThemeColors = {
  background: '#0B0B0B',
  card: '#111827',
  text: '#F3F4F6',
  muted: '#9CA3AF',
  border: '#1F2937',
  primary: '#00C04B',
  accent: '#0E1712',
};
