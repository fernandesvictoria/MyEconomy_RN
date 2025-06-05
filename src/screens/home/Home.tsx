import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { useAuth } from "../../hooks/useAuth";
import BottomNavigation from "../../components/BottomNavigation";


export default function Home({ navigation }) {
  const { authState } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [activeTab, setActiveTab] = useState('Home');
  
  // Dados mockados - substitua por dados reais da API
  const [monthlyData, setMonthlyData] = useState({
    budget: 1500,
    spent: 1100,
    percentage: 73
  });

  const months = [
    'Janeiro/2024', 'Fevereiro/2024', 'Março/2024', 'Abril/2024',
    'Maio/2024', 'Junho/2024', 'Julho/2024', 'Agosto/2024',
    'Setembro/2024', 'Outubro/2024', 'Novembro/2024', 'Dezembro/2024'
  ];

  useEffect(() => {
    // Define o mês atual como padrão
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    setSelectedMonth(`${months[currentMonth]}`);
  }, []);

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    
    switch (tabName) {
      case 'Profile':
        navigation.navigate('Profile');
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

  const userName = authState?.user?.nome || 'João';
  const progressPercentage = (monthlyData.spent / monthlyData.budget) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header com saudação */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá {userName} 👋</Text>
          <Text style={styles.subtitle}>É bom te ver por aqui!</Text>
        </View>

        {/* Seletor de mês */}
        <View style={styles.monthSelector}>
          <Picker
            selectedValue={selectedMonth}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          >
            {months.map((month, index) => (
              <Picker.Item key={index} label={month} value={month} />
            ))}
          </Picker>
        </View>

        {/* Card principal com progresso */}
        <TouchableOpacity style={styles.mainCard}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>😊</Text>
          </View>
          <Text style={styles.continueText}>Continue assim!</Text>
          
          {/* Seção de progresso */}
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Progresso</Text>
            <Text style={styles.progressValue}>
              R${monthlyData.spent.toFixed(2)}/R${monthlyData.budget.toFixed(2)}
            </Text>
            
            {/* Barra de progresso */}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min(progressPercentage, 100)}%` }]} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Espaçamento para a bottom navigation */}
        <View style={styles.spacer} />
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
    paddingTop: 20,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  monthSelector: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  picker: {
    height: 50,
    color: "#333",
  },
  mainCard: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#FFD700",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  emoji: {
    fontSize: 40,
  },
  continueText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 25,
  },
  progressSection: {
    width: "100%",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  progressBarContainer: {
    width: "100%",
    height: 12,
    backgroundColor: "#ffffff30",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 6,
  },
  spacer: {
    flex: 1,
  },
});