import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const chatApi = axios.create({
  baseURL,
});

export type ChatLeadPayload = {
  name: string;
  email: string;
  message: string;
  company?: string;
  language?: string;
};

export const sendChatMessage = async (message: string) => {
  const response = await chatApi.post("/api/chat/message", { message });
  return response.data as { reply: string };
};

export const createChatLead = async (payload: ChatLeadPayload) => {
  const response = await chatApi.post("/api/chat/lead", payload);
  return response.data as { id: number };
};
