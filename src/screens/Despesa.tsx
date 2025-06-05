import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Button from "../components/Button";
import BottomNavigation from "../components/BottomNavigation";

export default function Despesa({ navigation }) {
  const [activeTab, setActiveTab] = useState('Despesa');
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados do formulário
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState('');
  
  // Estados para histórico
  const [mesHistorico, setMesHistorico] = useState('');
  const [anoHistorico, setAnoHistorico] = useState('');
  const [despesasFiltradas, setDespesasFiltradas] = useState([]);
  
  // Estados para edição
  const [modalVisible, setModalVisible] = useState(false);
  const [despesaEditando, setDespesaEditando] = useState(null);
  const [descricaoEdit, setDescricaoEdit] = useState('');
  const [valorEdit, setValorEdit] = useState('');

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
    carregarDespesas();
  }, []);

  // Filtrar despesas quando mudar o histórico
  useEffect(() => {
    filtrarDespesasPorMes();
  }, [mesHistorico, anoHistorico, despesas]);

  const carregarDespesas = async () => {
    setLoading(true);
    try {
      // Aqui você faria a chamada para sua API
      // const response = await api.get('/despesas');
      // setDespesas(response.data);
      
      // Simulando dados para exemplo
      const dadosSimulados = [
        {
          id: 1,
          descricao: 'Supermercado',
          valor: 150.00,
          mes: mesAtual,
          ano: anoAtual,
          dataCreated: new Date().toISOString(),
        },
        {
          id: 2,
          descricao: 'Combustível',
          valor: 200.00,
          mes: mesAtual,
          ano: anoAtual,
          dataCreated: new Date().toISOString(),
        },
      ];
      setDespesas(dadosSimulados);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      Alert.alert('Erro', 'Falha ao carregar despesas');
    } finally {
      setLoading(false);
    }
  };

  const filtrarDespesasPorMes = () => {
    const despesasDoMes = despesas.filter(despesa => 
      despesa.mes.toString() === mesHistorico && 
      despesa.ano.toString() === anoHistorico
    );
    setDespesasFiltradas(despesasDoMes);
  };

  const validarMesPermitido = (mes, ano) => {
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);
    
    if (anoNum > anoAtual) return true;
    if (anoNum === anoAtual && mesNum >= mesAtual) return true;
    
    return false;
  };

  const salvarDespesa = async () => {
    if (!descricao.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return;
    }
    
    if (!valor || isNaN(parseFloat(valor))) {
      Alert.alert('Erro', 'Valor deve ser um número válido');
      return;
    }
    
    if (!validarMesPermitido(mesSelecionado, anoSelecionado)) {
      Alert.alert('Erro', 'Não é possível criar despesas para meses anteriores ao atual');
      return;
    }

    setLoading(true);
    try {
      const novaDespesa = {
        id: Date.now(), // Em produção, use um ID do backend
        descricao: descricao.trim(),
        valor: parseFloat(valor),
        mes: parseInt(mesSelecionado),
        ano: parseInt(anoSelecionado),
        dataCreated: new Date().toISOString(),
      };

      //  chamada para API
      
      
      setDespesas([...despesas, novaDespesa]);
      
    
      setDescricao('');
      setValor('');
      
      Alert.alert('Sucesso', 'Despesa salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      Alert.alert('Erro', 'Falha ao salvar despesa');
    } finally {
      setLoading(false);
    }
  };

  const editarDespesa = (despesa) => {
    if (!validarMesPermitido(despesa.mes.toString(), despesa.ano.toString())) {
      Alert.alert('Erro', 'Não é possível editar despesas de meses anteriores');
      return;
    }
    
    setDespesaEditando(despesa);
    setDescricaoEdit(despesa.descricao);
    setValorEdit(despesa.valor.toString());
    setModalVisible(true);
  };

  const salvarEdicao = async () => {
    if (!descricaoEdit.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return;
    }
    
    if (!valorEdit || isNaN(parseFloat(valorEdit))) {
      Alert.alert('Erro', 'Valor deve ser um número válido');
      return;
    }

    setLoading(true);
    try {
      const despesaAtualizada = {
        ...despesaEditando,
        descricao: descricaoEdit.trim(),
        valor: parseFloat(valorEdit),
      };

      // chamada para API
 
      
      const despesasAtualizadas = despesas.map(d => 
        d.id === despesaEditando.id ? despesaAtualizada : d
      );
      setDespesas(despesasAtualizadas);
      
      setModalVisible(false);
      setDespesaEditando(null);
      
      Alert.alert('Sucesso', 'Despesa atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao editar despesa:', error);
      Alert.alert('Erro', 'Falha ao editar despesa');
    } finally {
      setLoading(false);
    }
  };

  const excluirDespesa = (despesa) => {
    if (!validarMesPermitido(despesa.mes.toString(), despesa.ano.toString())) {
      Alert.alert('Erro', 'Não é possível excluir despesas de meses anteriores');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir a despesa "${despesa.descricao}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => confirmarExclusao(despesa) },
      ]
    );
  };

  const confirmarExclusao = async (despesa) => {
    setLoading(true);
    try {
      // Aqui você faria a chamada para sua API
      // await api.delete(`/despesas/${despesa.id}`);
      
      const despesasAtualizadas = despesas.filter(d => d.id !== despesa.id);
      setDespesas(despesasAtualizadas);
      
      Alert.alert('Sucesso', 'Despesa excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      Alert.alert('Erro', 'Falha ao excluir despesa');
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
    
    switch (tabName) {
      case 'Home':
        navigation.navigate('Home');
        break;
      case 'Profile':
        navigation.navigate('Profile');
        break;
      case 'Limite':
        navigation.navigate('Limite');
        break;
      default:
        break;
    }
  };

  const formatarValor = (valor) => {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  };

  const renderDespesaItem = ({ item }) => (
    <View style={styles.despesaItem}>
      <View style={styles.despesaInfo}>
        <Text style={styles.despesaDescricao}>{item.descricao}</Text>
        <Text style={styles.despesaValor}>{formatarValor(item.valor)}</Text>
      </View>
      <View style={styles.despesaActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={() => editarDespesa(item)}
        >
          <Ionicons name="pencil" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => excluirDespesa(item)}
        >
          <Ionicons name="trash" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Cadastro de Despesa</Text>
        
        {/* Formulário de Cadastro */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={styles.input}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Digite a descrição da despesa"
            maxLength={100}
          />

          <Text style={styles.label}>Valor *</Text>
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={setValor}
            placeholder="0,00"
            keyboardType="numeric"
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
              onPress={salvarDespesa}
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
                data={despesasFiltradas}
                renderItem={renderDespesaItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Nenhuma despesa encontrada para este mês</Text>
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
            <Text style={styles.modalTitle}>Editar Despesa</Text>
            
            <Text style={styles.label}>Descrição *</Text>
            <TextInput
              style={styles.input}
              value={descricaoEdit}
              onChangeText={setDescricaoEdit}
              placeholder="Digite a descrição da despesa"
              maxLength={100}
            />

            <Text style={styles.label}>Valor *</Text>
            <TextInput
              style={styles.input}
              value={valorEdit}
              onChangeText={setValorEdit}
              placeholder="0,00"
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
    paddingTop: 40, // Aumentado de 20 para 40 para dar mais espaço no topo
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
    height: 100, // Espaço para o bottom navigation
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
  despesaItem: {
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
  despesaInfo: {
    flex: 1,
  },
  despesaDescricao: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  despesaValor: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
    marginTop: 5,
  },
  despesaActions: {
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