import api from "../../utils/api";

export type SignUpDTO = {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: Date;
  confirmarSenha: string;
};

export const signIn = (email, senha) => {
    const basicAuth = 'Basic ' + btoa(`${email}:${senha}`);

    try {
        const resposta = api.post(
        "/auth/login",
        {},
        {
            headers: {
            Authorization: basicAuth,
            },
        }
        );

        return resposta;
    } catch (error) {
        console.error("Erro na autenticação:", error);
        alert("Erro: " + (error.response?.data || error.message));
        throw error;
    }
};

export const signUp = (data: SignUpDTO) => {
  return api.post("/auth/novo", data)
    .then(response => response.data)
    .catch(error => {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || "Erro desconhecido");
      } else {
        throw new Error("Erro de conexão com o servidor");
      }
    });
};

export const signOut = () => {
  return api.get("/auth/signout");
};
