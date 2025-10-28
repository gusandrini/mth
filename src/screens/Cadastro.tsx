import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/Theme';
import { getLoginStyles } from '@/styles/login';
import apiClient from '@/api/apiClient';
import { useNavigation } from '@react-navigation/native';

type NewUserPayload = {
  nome?: string;        // caso seu model use "nome" / "nomeCompleto"
  nomeCompleto?: string;
  email: string;
  username?: string;    // útil se seu login usa username
  senha: string;        // comum em projetos PT-BR
  password?: string;    // fallback se seu backend mapear como "password"
};

export default function RegisterScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => getLoginStyles(colors), [colors]);
  const navigation = useNavigation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    if (!fullName || !email || !username || !password || !confirm) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
      return false;
    }
    // validação simples de e-mail
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('E-mail inválido', 'Informe um e-mail válido.');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (password !== confirm) {
      Alert.alert('Senhas diferentes', 'Confirmação não confere com a senha.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // Como não temos certeza do nome exato dos campos no seu model,
      // enviamos as variantes mais comuns. O Spring ignorará campos extras.
      const payload: NewUserPayload = {
        nome: fullName,
        nomeCompleto: fullName,
        email,
        username,
        senha: password,
        password, // fallback
      };

      const res = await apiClient.post('/api/usuarios', payload);

      if (res.status >= 200 && res.status < 300) {
        Alert.alert('Sucesso', 'Cadastro realizado! Faça login para continuar.', [
          { text: 'Ir para Login', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] }) },
        ]);
      } else {
        Alert.alert('Erro', 'Não foi possível concluir o cadastro.');
      }
    } catch (err: any) {
      // Seu controller retorna 400 quando e-mail já existe
      const status = err?.response?.status;
      if (status === 400) {
        Alert.alert('E-mail em uso', 'Já existe um usuário com este e-mail.');
      } else {
        console.error('Erro no cadastro:', err?.response?.data || err);
        Alert.alert('Erro', 'Falha ao conectar ao servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.title}>Criar conta</Text>
        <Text style={s.subtitle}>Cadastre-se para acessar o Mottu</Text>

        {/* Nome completo */}
        <View style={s.inputContainer}>
          <Ionicons name="person-outline" size={18} color={colors.muted} style={s.icon} />
          <TextInput
            style={s.input}
            placeholder="Nome completo"
            placeholderTextColor={colors.muted}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* E-mail */}
        <View style={s.inputContainer}>
          <Ionicons name="mail-outline" size={18} color={colors.muted} style={s.icon} />
          <TextInput
            style={s.input}
            placeholder="E-mail"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Username (para login) */}
        <View style={s.inputContainer}>
          <Ionicons name="at-outline" size={18} color={colors.muted} style={s.icon} />
          <TextInput
            style={s.input}
            placeholder="Usuário"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        {/* Senha */}
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

        {/* Confirmar senha */}
        <View style={s.inputContainer}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.muted} style={s.icon} />
          <TextInput
            style={s.input}
            placeholder="Confirmar senha"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Cadastrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <Text style={s.registerLink}>Já tem conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
