import { useChatStore } from './store';

export function useAuth() {
  const { isAuthenticated, currentUser, login, signup, logout } = useChatStore();
  
  return {
    isAuthenticated,
    currentUser,
    login,
    signup,
    logout,
  };
}
