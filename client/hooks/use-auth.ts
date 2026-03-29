import { useChatStore } from '../lib/store/chat-store';

export function useAuth() {
  const store = useChatStore();
  return {
    isAuthenticated: store.isAuthenticated,
    currentUser: store.currentUser,
    isLoading: store.isLoading,
    login: store.login,
    signup: store.signup,
    googleLogin: store.googleLogin,
    logout: store.logout,
    checkAuth: store.checkAuth,
  };
}
