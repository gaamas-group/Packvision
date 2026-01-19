const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Login failed" }));
    throw new Error(error.error || "Invalid credentials");
  }

  const data = await response.json();

  if (data.access_token === undefined) {
    throw new Error("User does not exist");
  }

  return {
    access_token: data.access_token,
    role: data.role,
    user: data.user,
  };
};