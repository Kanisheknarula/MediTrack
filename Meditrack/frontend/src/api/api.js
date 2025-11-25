
import axios from "axios";

const api = axios.create({
  baseURL: "https://meditrack-server-fmx9.onrender.com",
});

export default api;
