import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Button from "../components/Button";
import BottomNavigation from "../components/BottomNavigation";
import { 
  cadastrarLimite, 
  editarLimite, 
  deletarLimite, 
  buscarLimites
} from "../services/limiteService";

export default function Limite({ navigation }) {
  const [activeTab, setActiveTab] = useState("Limite");
  const [loading, setLoading] = useState(false);
  
  // Estados do formulário
  const [valor, setValor] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState("");
  
  // Estados para histórico
  const [mesHistorico, setMesHistorico] = useState("");
  const [anoHistorico, setAnoHistorico] = useState("");
  const [limitesFiltrados, setLimitesFiltrados] = useState([]);
  
  // Estados para edição
  const [modalVisible, setModalVisible] = useState(false);
  const [limiteEditando, setLimiteEditando] = useState(null);
  const [valorEdit, setValorEdit] = useState("");
  
  // Estados de dados
  const [limites, setLimites] = useState([]);

  // Gerar meses e anos disponíveis
  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();
  
  const meses = [
    { value: '0', label: 'Janeiro' },
    { value: '1', label: 'Fevereiro' },
    { value: '2', label: 'Março' },
    { value: '3', label: 'Abril' },
    { value: '4', label: 'Maio' },
    { value: '5', label: 'Junho' },
    { value: '6', label: 'Julho' },
    { value: '7', label: 'Agosto' },
    { value: '8', label: 'Setembro' },
    { value: '9', label: 'Outubro' },
    { value: '10', label: 'Novembro' },
    { value: '11', label: 'Dezembro' },
  ];

  const anos = [];
  for (let i = anoAtual; i <= anoAtual + 2; i++) {
    anos.push({ value: i.toString(), label: i.toString() });
  }

  // Inicializar com mês e ano atual
  useEffect(() => {
    setMesSelecionado(mesAtual.toString());
    setAnoSelecionado(anoAtual.toString());
    setMesHistorico(mesAtual.toString());
    setAnoHistorico(anoAtual.toString());
    carregarLimites();
  }, []);

  // Filtrar limites quando mudar o histórico
  useEffect(() => {
    filtrarLimitesPorMes();
  }, [mesHistorico, anoHistorico, limites]);

  const carregarLimites = async () => {
    setLoading(true);
    try {
      const limitesCarregados = await buscarLimites();
      setLimites(limitesCarregados);
    } catch (error) {
      console.error("Erro ao carregar limites:", error);
      Alert.alert("Erro", error.message || "Não foi possível carregar os limites.");
    } finally {
      setLoading(false);
    }
  };

  const filtrarLimitesPorMes = () => {
    const limitesDoMes = limites.filter(limite => {
      return limite.mes === parseInt(mesHistorico) && 
             limite.ano === parseInt(anoHistorico);
    });
    setLimitesFiltrados(limitesDoMes);
  };

  const validarMesPermitido = (mes, ano) => {
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);
    
    if (anoNum > anoAtual) return true;
    if (anoNum === anoAtual && mesNum >= mesAtual) return true;
    
    return false;
  };

  const formatarValorInput = (text) => {
    // Remove tudo que não é número ou vírgula
    const apenasNumeros = text.replace(/[^0-9,]/g, '');
    
    // Substitui vírgula por ponto para validação
    const valorNumerico = apenasNumeros.replace(',', '.');
    
    // Valida se é um número válido
    if (valorNumerico && !isNaN(parseFloat(valorNumerico))) {
      setValor(apenasNumeros);
    } else if (valorNumerico === '') {
      setValor('');
    }
  };

  const formatarValorInputEdit = (text) => {
    // Remove tudo que não é número ou vírgula
    const apenasNumeros = text.replace(/[^0-9,]/g, '');
    
    // Substitui vírgula por ponto para validação
    const valorNumerico = apenasNumeros.replace(',', '.');
    
    // Valida se é um número válido
    if (valorNumerico && !isNaN(parseFloat(valorNumerico))) {
      setValorEdit(apenasNumeros);
    } else if (valorNumerico === '') {
      setValorEdit('');
    }
  };

  const obterValorNumerico = (valorString) => {
    const valorLimpo = valorString.replace(',', '.');
    return parseFloat(valorLimpo) || 0;
  };

  const salvarLimite = async () => {
    const valorNumerico = obterValorNumerico(valor);
    
    if (!valor || valorNumerico <= 0) {
      Alert.alert("Erro", "Digite um valor válido maior que zero.");
      return;
    }

    if (!validarMesPermitido(mesSelecionado, anoSelecionado)) {
      Alert.alert('Erro', 'Não é possível criar limites para meses anteriores ao atual');
      return;
    }

    setLoading(true);
    try {
      // Convertendo strings para números antes de passar para a função
      await cadastrarLimite(
        parseInt(mesSelecionado), 
        parseInt(anoSelecionado), 
        valorNumerico
      );
      Alert.alert("Sucesso", "Limite salvo com sucesso!");
      
      setValor("");
      await carregarLimites();
    } catch (error) {
      console.error("Erro ao salvar limite:", error);
      Alert.alert("Erro", error.message || "Não foi possível salvar o limite.");
    } finally {
      setLoading(false);
    }
  };

  const editarLimiteItem = (limite) => {
    // Validar se pode editar baseado no mês/ano do limite
    if (!validarMesPermitido(limite.mes.toString(), limite.ano.toString())) {
      Alert.alert('Erro', 'Não é possível editar limites de meses anteriores');
      return;
    }
    
    setLimiteEditando(limite);
    setValorEdit(limite.valor.toString().replace('.', ','));
    setModalVisible(true);
  };

  const salvarEdicao = async () => {
    const valorNumerico = obterValorNumerico(valorEdit);
    
    if (!valorEdit || valorNumerico <= 0) {
      Alert.alert("Erro", "Digite um valor válido maior que zero.");
      return;
    }

    setLoading(true);
    try {
      // Garantindo que idLimite é uma string válida
      const identificador = limiteEditando.idLimite || `${limiteEditando.mes}-${limiteEditando.ano}`;
      
      await editarLimite(
        identificador, 
        parseInt(limiteEditando.mes), // Convertendo para número
        parseInt(limiteEditando.ano), // Convertendo para número
        valorNumerico
      );
      Alert.alert("Sucesso", "Limite atualizado com sucesso!");
      
      setModalVisible(false);
      setLimiteEditando(null);
      await carregarLimites();
    } catch (error) {
      console.error("Erro ao editar limite:", error);
      Alert.alert("Erro", error.message || "Não foi possível editar o limite.");
    } finally {
      setLoading(false);
    }
  };

  const excluirLimite = (limite) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Deseja excluir o limite de ${limite.mesAnoFormatado}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => confirmarExclusao(limite)
        }
      ]
    );
  };

  const confirmarExclusao = async (limite) => {
    setLoading(true);
    try {
      // Garantindo que idLimite é uma string válida
      const identificador = limite.idLimite || `${limite.mes}-${limite.ano}`;
      
      await deletarLimite(identificador);
      Alert.alert("Sucesso", "Limite excluído com sucesso!");
      await carregarLimites();
    } catch (error) {
      console.error("Erro ao excluir limite:", error);
      Alert.alert("Erro", error.message || "Não foi possível excluir o limite.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);

    switch (tabName) {
      case "Home":
        navigation.navigate("Home");
        break;
      case "Despesa":
        navigation.navigate("Despesa");
        break;
      case "Profile":
        navigation.navigate("Profile");
        break;
      default:
        break;
    }
  };

  const formatarValorExibicao = (valor) => {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  };

  const renderLimiteItem = ({ item }) => {
    // Verificação de segurança para dados inválidos
    if (!item || !item.mesAnoFormatado || item.valor === undefined) {
      return null;
    }

    return (
      <View style={styles.limiteItem}>
        <View style={styles.limiteInfo}>
          <Text style={styles.limiteMes}>{item.mesAnoFormatado}</Text>
          <Text style={styles.limiteValor}>{formatarValorExibicao(item.valor)}</Text>
        </View>
        <View style={styles.limiteActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => editarLimiteItem(item)}
          >
            <Ionicons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => excluirLimite(item)}
          >
            <Ionicons name="trash" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Limite Mensal</Text>
        
        {/* Formulário de Cadastro */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Valor *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o valor do limite (ex: 1500,00)"
            keyboardType="numeric"
            value={valor}
            onChangeText={formatarValorInput}
          />

          <Text style={styles.label}>Mês *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={mesSelecionado}
              onValueChange={setMesSelecionado}
              style={styles.picker}
            >
              {meses.map((mes) => (
                <Picker.Item key={mes.value} label={mes.label} value={mes.value} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Ano *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={anoSelecionado}
              onValueChange={setAnoSelecionado}
              style={styles.picker}
            >
              {anos.map((ano) => (
                <Picker.Item key={ano.value} label={ano.label} value={ano.value} />
              ))}
            </Picker>
          </View>

          <View style={styles.buttonContainer}>
            <Button 
              title={loading ? "SALVANDO..." : "SALVAR"} 
              onPress={salvarLimite}
              disabled={loading}
            />
          </View>
        </View>

        {/* Histórico */}
        <View style={styles.historicoContainer}>
          <Text style={styles.historicoTitle}>Histórico</Text>
          
          <View style={styles.filtroContainer}>
            <View style={styles.filtroItem}>
              <Text style={styles.label}>Mês:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={mesHistorico}
                  onValueChange={setMesHistorico}
                  style={styles.picker}
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
                  selectedValue={anoHistorico}
                  onValueChange={setAnoHistorico}
                  style={styles.picker}
                >
                  {anos.map((ano) => (
                    <Picker.Item key={ano.value} label={ano.label} value={ano.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />
          ) : (
            <View style={styles.listContainer}>
              <FlatList
                data={limitesFiltrados}
                renderItem={renderLimiteItem}
                keyExtractor={(item, index) => {
                  // Correção para evitar erro de toString undefined
                  if (item.idLimite) {
                    return typeof item.idLimite === 'string' ? item.idLimite : item.idLimite.toString();
                  }
                  return `limite-${item.ano || 'ano'}-${item.mes || 'mes'}-${index}`;
                }}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    Nenhum limite encontrado para {meses[parseInt(mesHistorico)]?.label}/{anoHistorico}
                  </Text>
                }
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            </View>
          )}
        </View>
        
        {/* Espaçamento extra para o bottom navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal de Edição */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Editar Limite - {limiteEditando?.mesAnoFormatado}
            </Text>
            
            <Text style={styles.label}>Valor *</Text>
            <TextInput
              style={styles.input}
              value={valorEdit}
              onChangeText={formatarValorInputEdit}
              placeholder="Digite o valor do limite"
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={salvarEdicao}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
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
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
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
  buttonContainer: {
    marginTop: 30,
  },
  historicoContainer: {
    marginBottom: 20,
    paddingBottom: 20,
  },
  listContainer: {
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 10,
  },
  bottomSpacing: {
    height: 100,
  },
  historicoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  filtroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filtroItem: {
    flex: 0.48,
  },
  limiteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  limiteInfo: {
    flex: 1,
  },
  limiteMes: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  limiteValor: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
    marginTop: 5,
  },
  limiteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  emptyText: {
    textAlign: 'center',
    color: "#666",
    fontSize: 16,
    marginTop: 20,
    fontStyle: 'italic',
  },
  loading: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});