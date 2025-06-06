import api from "../utils/api";

export interface LimiteDTO {
  idLimite?: string; 
  valor: number;
  data: string;      // LocalDate será enviada como string YYYY-MM-DD
 
}


export interface LimiteListagemDTO {
  valor: number;     // Double
  data: string;      // LocalDate recebida como string
}

// DTO extendido para uso no frontend (com campos calculados)
export interface LimiteFrontendDTO {
  idLimite: string;
  valor: number;
  data: string;
  mes: number;        
  ano: number;
  mesNome: string;
  anoString: string;
  mesAnoFormatado: string;
}

// Função para formatar data para o backend (YYYY-MM-DD)
const formatarDataParaBackend = (mes: number, ano: number): string => {
  const mesNum = parseInt(mes.toString()) + 1; // Picker retorna 0-11, precisamos 1-12
  const mesFormatado = mesNum.toString().padStart(2, "0");
  return `${ano}-${mesFormatado}-01`; // Sempre dia 01 do mês
};

// Função para extrair mês e ano de uma data
const extrairMesAno = (dataString: string) => {
  const data = new Date(dataString + "T00:00:00");
  return {
    mes: data.getMonth(), // 0-11
    ano: data.getFullYear(),
    mesNome: data.toLocaleDateString("pt-BR", { month: "long" }),
    anoString: data.getFullYear().toString(),
  };
};

export const cadastrarLimite = async (mes: number, ano: number, valor: string | number): Promise<any> => {
  try {
    const dataFormatada = formatarDataParaBackend(mes, ano);

    // Estrutura conforme LimiteDTO do backend
    const limiteData: Omit<LimiteDTO, 'idLimite' | 'idUsuario'> = {
      valor: parseFloat(valor.toString()),
      data: dataFormatada,
    };

    console.log("Enviando dados para o backend:", limiteData);

    const response = await api.post("/limite", limiteData);
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar limite:", error);

  
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    if (error.response?.status === 400) {
      throw new Error("Dados inválidos ou limite já existe para este mês");
    }

    throw new Error("Erro ao cadastrar limite");
  }
};

export const editarLimite = async (idLimite: string, mes: number, ano: number, valor: string | number): Promise<any> => {
  try {
    const dataFormatada = formatarDataParaBackend(mes, ano);

    
    const limiteData: LimiteDTO = {
      idLimite: idLimite,
      valor: parseFloat(valor.toString()),
      data: dataFormatada,
    };

    console.log(`Editando limite ${idLimite}:`, limiteData);

    const response = await api.put(`/limite/${idLimite}`, limiteData);
    return response.data;
  } catch (error) {
    console.error("Erro ao editar limite:", error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error("Erro ao editar limite");
  }
};

export const deletarLimite = async (idLimite: string): Promise<any> => {
  try {
    console.log(`Deletando limite ${idLimite}`);

    const response = await api.delete(`/limite/${idLimite}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar limite:", error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error("Erro ao deletar limite");
  }
};

export const buscarLimites = async (): Promise<LimiteFrontendDTO[]> => {
  try {
    console.log("Buscando limites do usuário...");

    const response = await api.get("/limite/limites");

    // Transformar LimiteListagemDTO em LimiteFrontendDTO
    const limitesComMes: LimiteFrontendDTO[] = response.data.map((limite: any) => {
      const { mes, ano, mesNome, anoString } = extrairMesAno(limite.data);

      return {
        // Campos do backend (assumindo que o backend retorna um ID)
        idLimite: limite.id || limite.idLimite, // Flexibilidade para diferentes estruturas
        valor: limite.valor,
        data: limite.data,
        
        // Campos calculados para o frontend
        mes: mes, // 0-11 para compatibilidade com o Picker
        ano: ano,
        mesNome: mesNome,
        anoString: anoString,
        mesAnoFormatado: `${mesNome}/${anoString}`, // Para exibição
      };
    });

    console.log("Limites carregados:", limitesComMes);
    return limitesComMes;
  } catch (error) {
    console.error("Erro ao buscar limites:", error);

    if (error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    throw new Error("Erro ao carregar limites");
  }
};