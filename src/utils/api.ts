import axios from "axios";

const api = axios.create({
  // baseURL para qd fizer requisição pelo emulador
     baseURL: "http://10.0.2.2:8080/me",

    //baseURL: "http://192.168.25.1:8080/me",
});

export default api;