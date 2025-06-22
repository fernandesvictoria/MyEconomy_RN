import api from "../utils/api";

export interface DespesaDTO {
  idDespesa?: string;
  descricao: string;
  valor: number;
  data: string;
  idUsuario?: string;
}

// DTO para o frontend com campos calculados
export interface DespesaFrontendDTO extends DespesaDTO {
  mes: number;
  ano: number;
  mesNome: string;
  anoString: string;
  mesAnoFormatado: string;
  dataFormatada: string;
}

// Função para formatar data para o backend (YYYY-MM-DD)
const formatarDataParaBackend = (data: Date): string => {
  const ano = data.getFullYear();
  const mes = (data.getMonth() + 1).toString().padStart(2, "0");
  const dia = data.getDate().toString().padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

// Função para extrair informações de uma data
const extrairInfoData = (dataString: string) => {
  const data = new Date(dataString + "T00:00:00");
  return {
    mes: data.getMonth(), // 0-11
    ano: data.getFullYear(),
    mesNome: data.toLocaleDateString("pt-BR", { month: "long" }),
    anoString: data.getFullYear().toString(),
    dataFormatada: data.toLocaleDateString("pt-BR"), // DD/MM/YYYY
  };
};

export const cadastrarDespesa = async (
  descricao: string,
  valor: string | number,
  data: Date
): Promise<void> => {
  try {
    const dataFormatada = formatarDataParaBackend(data);

    const despesaData: DespesaDTO = {
      descricao: descricao.trim(),
      valor: parseFloat(valor.toString()),
      data: dataFormatada,
    };

    console.log("Enviando dados para o backend:", despesaData);

    const response = await api.post("/despesa", despesaData);

    if (response.status !== 201) {
      throw new Error("Erro inesperado ao cadastrar despesa");
    }
  } catch (error: any) {
    console.error("Erro ao cadastrar despesa:", error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    if (error.response?.status === 400) {
      throw new Error("Dados inválidos para cadastro da despesa");
    }

    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    throw new Error("Erro ao cadastrar despesa");
  }
};

export const editarDespesa = async (
  idDespesa: string,
  descricao: string,
  valor: string | number,
  data: Date
): Promise<void> => {
  try {
    const dataFormatada = formatarDataParaBackend(data);

    const despesaData: DespesaDTO = {
      idDespesa: idDespesa,
      descricao: descricao.trim(),
      valor: parseFloat(valor.toString()),
      data: dataFormatada,
    };

    console.log(`Editando despesa ${idDespesa}:`, despesaData);

    const response = await api.put(`/despesa/${idDespesa}`, despesaData);

    if (response.status !== 204) {
      throw new Error("Erro inesperado ao editar despesa");
    }
  } catch (error: any) {
    console.error("Erro ao editar despesa:", error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    if (error.response?.status === 404) {
      throw new Error("Despesa não encontrada");
    }

    throw new Error("Erro ao editar despesa");
  }
};

export const deletarDespesa = async (idDespesa: string): Promise<void> => {
  console.log(`Deletando despesa com ID: ${idDespesa}`);
  try {
    console.log(`Deletando despesa ${idDespesa}`);

    const response = await api.delete(`/despesa/${idDespesa}`);

    if (response.status !== 200 && response.status !== 204) {
      throw new Error("Erro inesperado ao deletar despesa");
    }
  } catch (error: any) {
    console.error("Erro ao deletar despesa:", error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    if (error.response?.status === 404) {
      throw new Error("Despesa não encontrada");
    }

    throw new Error("Erro ao deletar despesa");
  }
};

export const buscarDespesas = async (): Promise<DespesaFrontendDTO[]> => {
  try {
    const response = await api.get("/despesa/despesas");

    const despesasComInfo: DespesaFrontendDTO[] = response.data.map(
      (despesa: DespesaDTO) => {
        const { mes, ano, mesNome, anoString, dataFormatada } = extrairInfoData(
          despesa.data
        );

        return {
          // Campos do backend
          idDespesa: despesa.idDespesa,
          descricao: despesa.descricao,
          valor: despesa.valor,
          data: despesa.data,
          idUsuario: despesa.idUsuario,

          // Campos para o frontend
          mes: mes,
          ano: ano,
          mesNome: mesNome,
          anoString: anoString,
          mesAnoFormatado: `${mesNome}/${anoString}`,
          dataFormatada: dataFormatada, // DD/MM/YYYY
        };
      }
    );

    return despesasComInfo;
  } catch (error: any) {
    console.error("Erro ao buscar despesas:", error);

    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    throw new Error("Erro ao carregar despesas");
  }
};

// Função utilitária para filtrar despesas por mês/ano
export const filtrarDespesasPorMesAno = (
  despesas: DespesaFrontendDTO[],
  mes: number,
  ano: number
): DespesaFrontendDTO[] => {
  return despesas.filter(
    (despesa) => despesa.mes === mes && despesa.ano === ano
  );
};

// Função utilitária para calcular total de despesas
export const calcularTotalDespesas = (
  despesas: DespesaFrontendDTO[]
): number => {
  return despesas.reduce((total, despesa) => total + despesa.valor, 0);
};

// Função utilitária para agrupar despesas por usuário
export const agruparDespesasPorUsuario = (despesas: DespesaFrontendDTO[]) => {
  return despesas.reduce(
    (grupos: Record<string, DespesaFrontendDTO[]>, despesa) => {
      if (!grupos[despesa.idUsuario]) {
        grupos[despesa.idUsuario] = [];
      }
      grupos[despesa.idUsuario].push(despesa);
      return grupos;
    },
    {}
  );
};

// Função utilitária para agrupar despesas por mês/ano
export const agruparDespesasPorMesAno = (despesas: DespesaFrontendDTO[]) => {
  return despesas.reduce(
    (grupos: Record<string, DespesaFrontendDTO[]>, despesa) => {
      const chave = despesa.mesAnoFormatado;
      if (!grupos[chave]) {
        grupos[chave] = [];
      }
      grupos[chave].push(despesa);
      return grupos;
    },
    {}
  );
};
