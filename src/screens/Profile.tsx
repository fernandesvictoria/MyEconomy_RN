import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, SafeAreaView } from "react-native";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import BottomNavigation from "../components/BottomNavigation";

export default function Profile({ navigation }) {
  const { authState, onLogout, loadUserData, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');

  // Carrega os dados do usuário quando o componente é montado
  useEffect(() => {
    if (authState?.authenticated && !authState?.user && loadUserData) {
      loadUserData();
    }
  }, [authState?.authenticated, authState?.user, loadUserData]);

  const handleLogout = async () => {
    try {
      await onLogout();
      navigation.navigate("Login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    
    // Navegação baseada no tab selecionado
    switch (tabName) {
      case 'Home':
        navigation.navigate('Home');
        break;
      case 'Despesa':
        navigation.navigate('Despesa');
        break;
      case 'Home':
        navigation.navigate('Home');
        break;
      case 'Limite':
        navigation.navigate('Limite');
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  // Dados do usuário do contexto
  const userData = authState?.user;

  // Exibe loading enquanto carrega os dados
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Meus Dados</Text>
        
        <View style={styles.dataContainer}>
          <View style={styles.dataItem}>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.value}>{userData?.nome || "Não informado"}</Text>
          </View>

          <View style={styles.dataItem}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{userData?.email || "Não informado"}</Text>
          </View>

          <View style={styles.dataItem}>
            <Text style={styles.label}>Data de nascimento</Text>
            <Text style={styles.value}>
              {userData?.dataNascimento
                ? formatDate(userData.dataNascimento)
                : "Não informado"}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="SAIR" onPress={handleLogout} />
        </View>
      </View>

      <BottomNavigation 
        activeTab={activeTab} 
        onTabPress={handleTabPress} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 90, // Aumentado para garantir espaço para a bottom navigation
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 40,
  },
  dataContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  dataItem: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#666",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  buttonContainer: {
    paddingHorizontal: 10,
    paddingBottom: 100, // Aumentado para dar espaço suficiente para a bottom navigation
    marginBottom: 20,
  },
});