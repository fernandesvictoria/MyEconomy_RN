import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { useAuth } from "../../hooks/useAuth";
import BottomNavigation from "../../components/BottomNavigation";
import { buscarSaldoDoMes, buscarLimites, LimiteFrontendDTO } from "../../services/limiteService";

export default function Home({ navigation }) {
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState('Home');

  const [saldoRestante, setSaldoRestante] = useState<number>(0);
  const [limites, setLimites] = useState<LimiteFrontendDTO[]>([]);
  const [limiteDoMes, setLimiteDoMes] = useState<number>(0);
  const [mesSelecionado, setMesSelecionado] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState("");


  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();
  const meses = [
    { value: "0", label: "Janeiro" },
    { value: "1", label: "Fevereiro" },
    { value: "2", label: "Março" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Maio" },
    { value: "5", label: "Junho" },
    { value: "6", label: "Julho" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Setembro" },
    { value: "9", label: "Outubro" },
    { value: "10", label: "Novembro" },
    { value: "11", label: "Dezembro" },
  ];

  const anos = useMemo(() => {
    const lista = [];
    for (let i = anoAtual - 1; i <= anoAtual + 2; i++) {
      lista.push({ value: i.toString(), label: i.toString() });
    }
    return lista;
  }, [anoAtual]);

  const buscarLimiteDoMes = (mesNum: number, anoNum: number): number => {
    const limite = limites.find((l) => l.mes === mesNum && l.ano === anoNum);
    return limite ? limite.valor : 0;
  };

  const carregarDados = async (mesStr: string, anoStr: string) => {
    const mesNum = parseInt(mesStr);
    const anoNum = parseInt(anoStr);

    const data = new Date(anoNum, mesNum, 1);

    try {
      const limiteMes = buscarLimiteDoMes(mesNum, anoNum);
      setLimiteDoMes(limiteMes);

      if (limiteMes > 0) {
        const responseSaldo = await buscarSaldoDoMes(data);
        setSaldoRestante(responseSaldo);
      } else {
        setSaldoRestante(0);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setSaldoRestante(0);
      setLimiteDoMes(0);
    }
  };


  const carregarLimites = async () => {
    try {
      const limitesData = await buscarLimites();
      setLimites(limitesData);
    } catch (error) {
      console.error("Erro ao carregar limites:", error);
      setLimites([]);
    }
  };

  useEffect(() => {
    carregarLimites();
  }, []);

  useEffect(() => {
    setMesSelecionado(mesAtual.toString());
    setAnoSelecionado(anoAtual.toString());
    carregarDados(mesAtual.toString(), anoAtual.toString());
  }, [limites]);

  const handleMonthChange = (itemValue: string) => {
    setMesSelecionado(itemValue);
    carregarDados(itemValue, anoSelecionado);
  };

  const handleYearChange = (itemValue: string) => {
    setAnoSelecionado(itemValue);
    carregarDados(mesSelecionado, itemValue);
  };

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

  const userName = authState?.user?.nome || 'Usuário';

  // Usar o limite do mês e calcular os gastos
  const limiteTotal = limiteDoMes;
  const saldoDisponivel = saldoRestante;
  const valorGasto = limiteTotal - saldoDisponivel;

  // Calcular porcentagem gasta
  const porcentagemGasta = limiteTotal > 0 ? (valorGasto / limiteTotal) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header com saudação */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {userName}! 👋</Text>
          <Text style={styles.subtitle}>É bom te ver por aqui!</Text>
        </View>

        {/* Seletor de mês */}
        <View style={styles.filtroContainer}>
          <View style={styles.filtroItem}>
            <Text style={styles.label}>Mês:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={mesSelecionado}
                onValueChange={handleMonthChange}
              >
                {meses.map((mes) => (
                  <Picker.Item key={mes.value} label={mes.label} value={mes.value} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filtroItem}>
            <Text style={styles.label}>Ano:</Text>
            <View style={styles.pickerContainer}>

              <Picker
                selectedValue={anoSelecionado}
                onValueChange={handleYearChange}
              >
                {anos.map((ano) => (
                  <Picker.Item key={ano.value} label={ano.label} value={ano.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Cards de informações */}
        <View style={styles.cardsContainer}>
          {/* Card do Limite Total */}
          <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>Limite do Mês</Text>
            <Text style={styles.cardValue}>R$ {limiteTotal.toFixed(2)}</Text>
          </View>

          {/* Card do Valor Gasto */}
          <View style={[styles.infoCard, styles.spentCard]}>
            <Text style={styles.cardLabel}>Valor Gasto</Text>
            <Text style={styles.cardValue}>R$ {valorGasto.toFixed(2)}</Text>
          </View>
        </View>

        {/* Verificar se há limite cadastrado */}
        {limiteTotal === 0 ? (
          <View style={styles.noLimitCard}>
            <Text style={styles.noLimitText}>📋</Text>
            <Text style={styles.noLimitTitle}>Nenhum limite cadastrado</Text>
            <Text style={styles.noLimitSubtitle}>
              Cadastre um limite para este mês na aba "Limite"
            </Text>
            <TouchableOpacity
              style={styles.noLimitButton}
              onPress={() => navigation.navigate('Limite')}
            >
              <Text style={styles.noLimitButtonText}>Cadastrar Limite</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Card principal com progresso */
          <View style={styles.mainCard}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>
                {porcentagemGasta < 60 ? '😊' : porcentagemGasta < 100 ? '😰' : '🤯'}
              </Text>
            </View>
            <Text style={styles.continueText}>
              {porcentagemGasta < 60 ? 'Continue assim!' :
                porcentagemGasta < 100 ? 'Cuidado com os gastos!' :
                  'Atenção! Limite esgotado!'}
            </Text>

            {/* Seção de progresso */}
            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Saldo Disponível</Text>
              <Text style={styles.progressValue}>
                R$ {Math.max(saldoDisponivel, 0).toFixed(2)}
              </Text>

              {/* Barra de progresso */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(porcentagemGasta, 100)}%`,
                      backgroundColor: porcentagemGasta < 50 ? '#ffffff' :
                        porcentagemGasta < 80 ? '#FFA500' : '#FF6B6B'
                    },
                  ]}
                />
              </View>

              {/* Aviso se excedeu o limite */}
              {saldoDisponivel < 0 && (
                <Text style={styles.warningText}>
                  ⚠️ Limite excedido em R$ {Math.abs(saldoDisponivel).toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        )}

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
  filtroContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  filtroItem: {
    flex: 0.48,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    height: 50,
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 15,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 15,
    flex: 0.48,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  spentCard: {
    backgroundColor: "#FF9800",
  },
  cardLabel: {
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 5,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: 'center',
  },
  noLimitCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderStyle: 'dashed',
  },
  noLimitText: {
    fontSize: 50,
    marginBottom: 15,
  },
  noLimitTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: 'center',
  },
  noLimitSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: 'center',
    marginBottom: 20,
  },
  noLimitButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  noLimitButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
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
    textAlign: 'center',
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
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.9,
  },
  warningText: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "bold",
    marginTop: 10,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
});