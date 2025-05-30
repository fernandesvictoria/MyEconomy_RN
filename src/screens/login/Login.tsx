import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from "react-native";
import Button from "../../components/Button";
import { TextInput } from "react-native-gesture-handler";
import { useAuth } from "../../hooks/useAuth";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { onLogin } = useAuth();

  const isValidForm = email.trim() !== "" && senha.trim() !== "";
  const handleSignIn = async () => {
    try {
      await onLogin(email, senha);
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Erro", "E-mail ou senha inválidos");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      <Button title="Login" onPress={handleSignIn} disabled={!isValidForm} />

      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.registerLink}>Não tem uma conta? Registre-se!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    color: "#333",
  },
  registerLink: {
    fontSize: 16,
    color: "#6227a3", // Cor azul similar aos links
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#6227a3",
    backgroundColor: "#eee3fa",
    padding: 15,
    borderRadius: 8,
    width: "80%",
    textAlign: "center",
  },
  buttonsColumn: {
    width: "80%",
  },
});