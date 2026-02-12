import api from "./api";

export type ChatLeadPayload = {
  name: string;
  email: string;
  message: string;
  company?: string;
  language?: string;
};

export const sendChatMessage = async (message: string) => {
  const response = await api.post("/chat/message", { message });
  return response.data as { reply: string };
};

export const createChatLead = async (payload: ChatLeadPayload) => {
  const response = await api.post("/chat/lead", payload);
  return response.data as { id: number };
};
