import api from "./api";

export const askAI = async (question: string): Promise<string> => {
  const res = await api.post("/ai/ask", { question });

  return res.data?.body?.reply ?? res.data?.reply ?? "";
};