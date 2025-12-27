import apiClient from "./client.js";

export const authAPI = {
  login: async (username, password) => {
    const response = await apiClient.post("/auth/login", { username, password });
    return response.data;
  },
};

