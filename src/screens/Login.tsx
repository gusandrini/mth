import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@/context/Theme';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getLoginStyles } from '@/styles/login';

export default function LoginScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => getLoginStyles(colors), [colors]);
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Campos obrigatórios', 'Informe usuário e senha.');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/api/auth/login', { username, password });
      const token = response.data?.token;

      if (token) {
        await AsyncStorage.setItem('token', token);
        // (opcional) salvar username se você usar em outro lugar:
        // await AsyncStorage.setItem('username', username);

        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

        Alert.alert('Login efetuado', 'Bem-vindo!');
        navigation.reset({ index: 0, routes: [{ name: 'Home' as never }] });
      } else {
        Alert.alert('Falha no login', 'Credenciais inválidas.');
      }
    } catch (error: any) {
      console.error('Erro no login:', error.response?.data || error);
      Alert.alert('Erro', 'Não foi possível conectar. Verifique o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.title}>Entrar</Text>
        <Text style={s.subtitle}>Acesse sua conta Mottu</Text>

        <View style={s.inputContainer}>
          <Ionicons name="person-outline" size={18} color={colors.muted} style={s.icon} />
          <TextInput
            style={s.input}
            placeholder="Usuário"
            placeholderTextColor={colors.muted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={s.inputContainer}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.muted} style={s.icon} />
          <TextInput
            style={s.input}
            placeholder="Senha"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Alert.alert('Cadastro', 'Função de cadastro em desenvolvimento.')}>
          <Text style={s.registerLink}>Criar uma conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
