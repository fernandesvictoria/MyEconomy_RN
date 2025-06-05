import React, { useState } from "react";
import { StyleSheet, Text, View, Alert, TouchableOpacity } from "react-native";
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
      navigation.navigate("Profile");
    } catch (error) {
      Alert.alert("Erro", "E-mail ou senha inválidos");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ENTRAR</Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
        
        <Button title="Entrar" onPress={handleSignIn} disabled={!isValidForm} />

        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.registerLink}>Não possui conta? Crie aqui</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 40,
    letterSpacing: 2,
  },
  formContainer: {
    width: "100%",
    maxWidth: 300,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  registerLink: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});