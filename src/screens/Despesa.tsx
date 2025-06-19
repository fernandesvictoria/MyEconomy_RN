import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavigation from "../components/BottomNavigation";
import Button from "../components/Button";
import {
  buscarDespesas,
  cadastrarDespesa,
  deletarDespesa,
  editarDespesa,
  filtrarDespesasPorMesAno,
} from "../services/despesaService";

export default function Despesa({ navigation }) {
  const [activeTab, setActiveTab] = useState("Despesa");
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados do formulário
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState("");

  // Estados do histórico
  const [mesHistorico, setMesHistorico] = useState("");
  const [anoHistorico, setAnoHistorico] = useState("");
  const [despesasFiltradas, setDespesasFiltradas] = useState([]);

  // Estados da edição
  const [modalVisible, setModalVisible] = useState(false);
  const [despesaEditando, setDespesaEditando] = useState(null);
  const [descricaoEdit, setDescricaoEdit] = useState("");
  const [valorEdit, setValorEdit] = useState("");

  // Gerar meses e anos disponíveis
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
      const despesasCarregadas = await buscarDespesas();
      setDespesas(despesasCarregadas);
    } catch (error) {
      console.error("Erro ao carregar despesas:", error);
      Alert.alert("Erro", error.message || "Falha ao carregar despesas");
    } finally {
      setLoading(false);
    }
  };

  const filtrarDespesasPorMes = () => {
    const mesNum = parseInt(mesHistorico);
    const anoNum = parseInt(anoHistorico);

    const despesasDoMes = filtrarDespesasPorMesAno(despesas, mesNum, anoNum);
    setDespesasFiltradas(despesasDoMes);
  };

  const validarMesPermitido = (mes, ano) => {
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);

    if (anoNum > anoAtual) return true;
    if (anoNum === anoAtual && mesNum >= mesAtual) return true;

    return false;
  };

  const criarDataDoMesAno = (mes, ano) => {
    // Criar uma data para o primeiro dia do mês/ano selecionado
    return new Date(parseInt(ano), parseInt(mes), 1);
  };

  const salvarDespesa = async () => {
    if (!descricao.trim()) {
      Alert.alert("Erro", "Descrição é obrigatória");
      return;
    }

    if (!valor || isNaN(parseFloat(valor))) {
      Alert.alert("Erro", "Valor deve ser um número válido");
      return;
    }

    if (!validarMesPermitido(mesSelecionado, anoSelecionado)) {
      Alert.alert(
        "Erro",
        "Não é possível criar despesas para meses anteriores ao atual"
      );
      return;
    }

    setLoading(true);
    try {
      const dataParaCadastro = criarDataDoMesAno(
        mesSelecionado,
        anoSelecionado
      );

      await cadastrarDespesa(
        descricao.trim(),
        parseFloat(valor),
        dataParaCadastro
      );

      await carregarDespesas();

      // limpar formulário
      setDescricao("");
      setValor("");

      Alert.alert("Sucesso", "Despesa salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      Alert.alert("Erro", error.message || "Falha ao salvar despesa");
    } finally {
      setLoading(false);
    }
  };

  const editarDespesaItem = (despesa) => {
    if (!validarMesPermitido(despesa.mes.toString(), despesa.ano.toString())) {
      Alert.alert("Erro", "Não é possível editar despesas de meses anteriores");
      return;
    }

    setDespesaEditando(despesa);
    setDescricaoEdit(despesa.descricao);
    setValorEdit(despesa.valor.toString());
    setModalVisible(true);
  };

  const salvarEdicao = async () => {
    if (!descricaoEdit.trim()) {
      Alert.alert("Erro", "Descrição é obrigatória");
      return;
    }

    if (!valorEdit || isNaN(parseFloat(valorEdit))) {
      Alert.alert("Erro", "Valor deve ser um número válido");
      return;
    }

    setLoading(true);
    try {
      // Usar a data original da despesa
      const dataOriginal = new Date(despesaEditando.data + "T00:00:00");

      await editarDespesa(
        despesaEditando.idDespesa,
        descricaoEdit.trim(),
        parseFloat(valorEdit),
        dataOriginal
      );

      // recarregar as despesas
      await carregarDespesas();

      setModalVisible(false);
      setDespesaEditando(null);

      Alert.alert("Sucesso", "Despesa atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao editar despesa:", error);
      Alert.alert("Erro", error.message || "Falha ao editar despesa");
    } finally {
      setLoading(false);
    }
  };

  const excluirDespesa = (despesa) => {
    if (!validarMesPermitido(despesa.mes.toString(), despesa.ano.toString())) {
      Alert.alert(
        "Erro",
        "Não é possível excluir despesas de meses anteriores"
      );
      return;
    }

    Alert.alert(
      "Confirmar Exclusão",
      `Deseja excluir a despesa "${despesa.descricao}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => confirmarExclusao(despesa),
        },
      ]
    );
  };

  const confirmarExclusao = async (despesa) => {
    setLoading(true);
    try {
      await deletarDespesa(despesa.idDespesa);

      // recarregar as despesas
      await carregarDespesas();

      Alert.alert("Sucesso", "Despesa excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
      Alert.alert("Erro", error.message || "Falha ao excluir despesa");
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
      case "Profile":
        navigation.navigate("Profile");
        break;
      case "Limite":
        navigation.navigate("Limite");
        break;
      default:
        break;
    }
  };

  const formatarValor = (valor) => {
    return `R$ ${valor.toFixed(2).replace(".", ",")}`;
  };

  const renderDespesaItem = ({ item }) => (
    <View style={styles.despesaItem}>
      <View style={styles.despesaInfo}>
        <Text style={styles.despesaDescricao}>{item.descricao}</Text>
        <Text style={styles.despesaValor}>{formatarValor(item.valor)}</Text>
        <Text style={styles.despesaData}>{item.dataFormatada}</Text>
      </View>
      <View style={styles.despesaActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => editarDespesaItem(item)}
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
      {/* ScrollView permite rolagem quando conteúdo é maior que tela */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Cadastro de Despesa</Text>

        {/* FORMULÁRIO DE CADASTRO */}
        <View style={styles.formContainer}>
          {/* Campo Descrição */}
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={styles.input}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Digite a descrição da despesa"
            maxLength={100}
          />

          {/* Campo Valor */}
          <Text style={styles.label}>Valor *</Text>
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={setValor}
            placeholder="0,00"
            keyboardType="numeric"
          />

          {/* Seletor de Mês */}
          <Text style={styles.label}>Mês *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={mesSelecionado}
              onValueChange={setMesSelecionado}
              style={styles.picker}
            >
              {meses.map((mes) => (
                <Picker.Item
                  key={mes.value}
                  label={mes.label}
                  value={mes.value}
                />
              ))}
            </Picker>
          </View>

          {/* Seletor de Ano */}
          <Text style={styles.label}>Ano *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={anoSelecionado}
              onValueChange={setAnoSelecionado}
              style={styles.picker}
            >
              {anos.map((ano) => (
                <Picker.Item
                  key={ano.value}
                  label={ano.label}
                  value={ano.value}
                />
              ))}
            </Picker>
          </View>

          {/* Botão Salvar */}
          <View style={styles.buttonContainer}>
            <Button
              title={loading ? "SALVANDO..." : "SALVAR"}
              onPress={salvarDespesa}
              disabled={loading}
            />
          </View>
        </View>

        {/*  SEÇÃO DE HISTÓRICO  */}
        <View style={styles.historicoContainer}>
          <Text style={styles.historicoTitle}>Histórico</Text>

          {/* Filtros de Mês e Ano para o histórico */}
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
                    <Picker.Item
                      key={mes.value}
                      label={mes.label}
                      value={mes.value}
                    />
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
                    <Picker.Item
                      key={ano.value}
                      label={ano.label}
                      value={ano.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Lista de despesas ou loading */}
          {loading ? (
            // Mostra indicador de carregamento
            <ActivityIndicator
              size="large"
              color="#4CAF50"
              style={styles.loading}
            />
          ) : (
            // Lista das despesas filtradas
            <View style={styles.listContainer}>
              <FlatList
                data={despesasFiltradas}
                renderItem={renderDespesaItem} // Como renderizar cada item
                keyExtractor={(item, index) => {
                  // Gera chave única para cada item
                  if (item.idDespesa) {
                    return typeof item.idDespesa === "string"
                      ? item.idDespesa
                      : item.idDespesa.toString();
                  }
                  return `despesa-${item.ano || "ano"}-${
                    item.mes || "mes"
                  }-${index}`;
                }}
                ListEmptyComponent={
                  // Componente mostrado quando lista está vazia
                  <Text style={styles.emptyText}>
                    Nenhuma despesa encontrada para este mês
                  </Text>
                }
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            </View>
          )}
        </View>

        {/* Espaçamento para não cobrir com navegação */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/*  MODAL DE EDIÇÃO  */}
      <Modal
        animationType="slide" // Animação de deslizar
        transparent={true} // Fundo transparente
        visible={modalVisible} // Controla visibilidade
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Conteúdo do modal */}
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

            {/* Botões do modal */}
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

      {/* Navegação inferior fixa */}
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  filtroItem: {
    flex: 0.48,
  },
  despesaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  despesaData: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  despesaActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 20,
    fontStyle: "italic",
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    gap: 15,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
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
