import axios from "axios";

const api = axios.create({
  baseURL: "https://os80w4wwsggwosc4o88k0csc.kirisame.jp.net",
  withCredentials: true,
});

export default api;
