
export const useAuth = () => {
  // Hardcoded role for scaffolding
  const user = { role: 'admin', name: 'Test User' };
  
  const login = async (username, password) => {
    console.log("Login stub", username);
    return true;
  };

  const logout = () => {
    console.log("Logout stub");
  };

  return { user, login, logout, isAuthenticated: !!user };
};
