import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, Alert } from "react-native";
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

  const handleDataNascimentoChange = (text: string) => {
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

  
  const isValidDataNascimento = (data: string): boolean => {
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

      // Converte a data de nascimento para o formato YYYY-MM-DD
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
    } catch (error: any) {
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
      <Text style={styles.title}>Registrar</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

     <TextInput
        style={styles.input}
        placeholder="Data de Nascimento"
        value={dataNascimento}
        onChangeText={handleDataNascimentoChange} 
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        secureTextEntry
      />

      <Button title="Cadastrar" disabled={!isValidForm} onPress={register} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
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
    width: "90%",
    textAlign: "center",
  },
  buttonContainer: {
    width: "90%",
    marginTop: 20,
  },
});