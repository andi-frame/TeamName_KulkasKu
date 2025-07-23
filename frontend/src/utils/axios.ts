import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // TODO: change in prod
  withCredentials: true,
});

export default api;
