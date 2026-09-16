import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: (user, tokens) => {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        set({
            user,
            isAuthenticated: true,
            isLoading: false
        });
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({
            user: null,
            isAuthenticated: false,
            isLoading: false
        });
    },

    setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

    setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;