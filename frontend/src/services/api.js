import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
          refresh_token: localStorage.getItem("refreshToken"),
        });
        localStorage.setItem("accessToken", refreshResponse.data.access_token);
        localStorage.setItem("refreshToken", refreshResponse.data.refresh_token);
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

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

export const register = async (payload) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const getDashboardActivity = async () => {
  const response = await api.get("/dashboard/activity");
  return response.data;
};

export const getDashboardUrgent = async () => {
  const response = await api.get("/dashboard/urgent");
  return response.data;
};

export const getLeads = async () => {
  const response = await api.get("/leads");
  return response.data;
};

export const updateLeadStatus = async (leadId, status) => {
  const response = await api.patch(`/leads/${leadId}/status`, { status });
  return response.data;
};

export const getLeadEmails = async (leadId) => {
  const response = await api.get(`/leads/${leadId}/emails`);
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

export const getEmailThread = async (emailId) => {
  const response = await api.get(`/emails/${emailId}`);
  return response.data;
};

export const getEmailAnalysis = async (emailId) => {
  const response = await api.get(`/emails/${emailId}/analysis`);
  return response.data;
};

export const regenerateEmailReply = async (emailId) => {
  const response = await api.post(`/emails/${emailId}/generate-reply`);
  return response.data;
};

export const getTemplates = async () => {
  const response = await api.get("/templates");
  return response.data;
};

export const createTemplate = async (payload) => {
  const response = await api.post("/templates", payload);
  return response.data;
};

export const updateTemplate = async (templateId, payload) => {
  const response = await api.put(`/templates/${templateId}`, payload);
  return response.data;
};

export const deleteTemplate = async (templateId) => {
  await api.delete(`/templates/${templateId}`);
};

export const getAnalyticsOverview = async () => {
  const response = await api.get("/analytics/overview");
  return response.data;
};

export const getCompanySettings = async () => {
  const response = await api.get("/companies/me");
  return response.data;
};

export const updateCompanySettings = async (payload) => {
  const response = await api.put("/companies/me", payload);
  return response.data;
};

export const rotateCompanyKey = async () => {
  const response = await api.post("/companies/me/rotate-key");
  return response.data;
};

export const getEmailIntegrationStatus = async () => {
  const response = await api.get("/integrations/email/status");
  return response.data;
};

export const connectEmailIntegration = async (payload) => {
  const response = await api.post("/integrations/email/connect", payload);
  return response.data;
};

export default api;
