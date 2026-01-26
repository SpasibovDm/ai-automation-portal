import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);
  const response = await api.post("/auth/login", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const getLeads = async () => {
  const response = await api.get("/leads");
  return response.data;
};

export const updateLead = async (leadId, payload) => {
  const response = await api.put(`/leads/${leadId}`, payload);
  return response.data;
};

export const getEmails = async () => {
  const response = await api.get("/emails");
  return response.data;
};

export const getTemplates = async () => {
  const response = await api.get("/auto-replies");
  return response.data;
};

export const createTemplate = async (payload) => {
  const response = await api.post("/auto-replies", payload);
  return response.data;
};

export const updateTemplate = async (templateId, payload) => {
  const response = await api.put(`/auto-replies/${templateId}`, payload);
  return response.data;
};

export const deleteTemplate = async (templateId) => {
  await api.delete(`/auto-replies/${templateId}`);
};

export default api;
