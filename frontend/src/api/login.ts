import axios from "axios";

export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post("/auth/login", { username, password });
    const data = response.data;

    if (data.access_token === undefined) {
      throw new Error("User does not exist");
    }

    return {
      access_token: data.access_token,
      role: data.role,
      user: data.user,
    };
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Invalid credentials");
  }
};