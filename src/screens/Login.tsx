import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useTheme } from "@/context/Theme";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "@/api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const { colors } = useTheme();
  const s = getStyles(colors);
  const navigation = useNavigation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Campos obrigatórios", "Informe usuário e senha.");
      return;
    }

    try {
        setLoading(true);
        const response = await apiClient.post("/api/auth/login", {
            username,
            password,
        });

        const token = response.data?.token;

        if (token) {
            // 🔹 salva token e username
            await AsyncStorage.setItem("token", token);

            console.log("Token recebido:", token);
            Alert.alert("Login efetuado", "Bem-vindo!");
            
            // 🔹 atualiza Authorization header imediatamente
            apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

            // 🔹 navega para Home
            navigation.reset({
            index: 0,
            routes: [{ name: "Home" as never }],
            });
        } else {
            Alert.alert("Falha no login", "Credenciais inválidas.");
        }
        } catch (error: any) {
        console.error("Erro no login:", error.response?.data || error);
        Alert.alert("Erro", "Não foi possível conectar. Verifique o servidor.");
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

        <TouchableOpacity
          style={[s.btn, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Alert.alert("Cadastro", "Função de cadastro em desenvolvimento.")}>
          <Text style={s.registerLink}>Criar uma conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    card: {
      backgroundColor: colors.card,
      width: "100%",
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    title: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "800",
      textAlign: "center",
    },
    subtitle: {
      color: colors.muted,
      fontSize: 14,
      textAlign: "center",
      marginBottom: 16,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      marginBottom: 12,
      paddingHorizontal: 10,
    },
    icon: { marginRight: 6 },
    input: {
      flex: 1,
      color: colors.text,
      paddingVertical: 10,
      fontSize: 14,
    },
    btn: {
      backgroundColor: colors.primary,
      height: 46,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },
    btnText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 16,
    },
    registerLink: {
      color: colors.primary,
      textAlign: "center",
      marginTop: 14,
      fontWeight: "700",
    },
  });
}
