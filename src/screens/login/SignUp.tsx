import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, Alert, TouchableOpacity } from "react-native";
import Button from "../../components/Button";
import { TextInput } from "react-native-gesture-handler";
import { useAuth } from "../../hooks/useAuth";

export default function NewUser({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const { onRegister } = useAuth();

  const isValidForm = useMemo(() => {
    return (
      senha === confirmarSenha &&
      !!nome &&
      !!email &&
      !!dataNascimento &&
      !!senha &&
      !!confirmarSenha
    );
  }, [nome, email, dataNascimento, senha, confirmarSenha]);

  const handleDataNascimentoChange = (text) => {
    let value = text.replace(/\D/g, "");

    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    if (value.length <= 2) {
      value = value.replace(/(\d{2})/, "$1");
    } else if (value.length <= 4) {
      value = value.replace(/(\d{2})(\d{2})/, "$1/$2");
    } else {
      value = value.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
    }

    setDataNascimento(value); 
  };

  const isValidDataNascimento = (data) => {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(data)) {
      return false; 
    }

    const [dia, mes, ano] = data.split("/").map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    return (
      dataObj.getDate() === dia &&
      dataObj.getMonth() === mes - 1 &&
      dataObj.getFullYear() === ano
    );
  };

  const register = async () => {
    try {
      if (senha !== confirmarSenha) {
        Alert.alert("Erro", "As senhas não coincidem.");
        return;
      }
      if (!isValidDataNascimento(dataNascimento)) {
        Alert.alert("Erro", "Data de nascimento inválida!");
        return;
      }

      const [dia, mes, ano] = dataNascimento.split("/").map(Number);
      const formattedDate = `${ano}-${String(mes).padStart(2, "0")}-${String(
        dia
      ).padStart(2, "0")}`;

      await onRegister(
        nome,
        email,
        new Date(formattedDate),
        senha,
        confirmarSenha
      );
      Alert.alert("Sucesso", "Usuário registrado!");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Erro ao registrar", error);
      const msg =
        error.response?.data?.message || 
        error.message || 
        "Erro desconhecido";

      Alert.alert("Erro", msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRIAR</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Data de nascimento</Text>
        <TextInput
          style={styles.input}
          value={dataNascimento}
          onChangeText={handleDataNascimentoChange} 
          keyboardType="numeric"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <Text style={styles.label}>Confirmar senha</Text>
        <TextInput
          style={styles.input}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
        />

        <Button title="Criar" disabled={!isValidForm} onPress={register} />

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  backLink: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});