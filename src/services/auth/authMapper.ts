import { SignUpDTO } from "./authResource";

export const getSignUpDTO = (data: SignUpDTO) => {
    return {
        nome: data.nome,
        email: data.email,
        dataNascimento: data.dataNascimento,
        senha: data.senha,
        confirmarSenha: data.confirmarSenha,
    };
};

export const getSignUpResponse = (data: any) => {
  return {
    nome: data.nome,
    email: data.email,
    senha: data.senha,
    confirmarSenha: data.confirmarSenha,
  };
};