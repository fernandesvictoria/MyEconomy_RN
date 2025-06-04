import api from "../../utils/api";

export interface Usuario {
  id: number;
  nome: string;
  nickname: string;
  email: string;
  dataNascimento: string;
}

// Get current logged user
export const getCurrentUser = async (): Promise<Usuario> => {
  try {
    const response = await api.get<Usuario>("/usuarios/usuario-autenticado");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};
