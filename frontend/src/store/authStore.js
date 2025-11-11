// stores/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "../api/axiosConfig";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // État
      user: null,
      tokens: {
        access: null,
        refresh: null,
      },
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions

      /**
       * Inscription
       */
      register: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.post("/user/register/", userData);

          set({ isLoading: false, error: null });
          return { success: true, message: response.data.message };
        } catch (error) {
          const errorData = error.response?.data || {
            message: "Erreur de connexion",
          };
          set({ isLoading: false, error: errorData });
          return { success: false, errors: errorData };
        }
      },

      /**
       * Connexion
       */
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.post("/user/login/", {
            email,
            password,
          });
          const { data } = response;

          set({
            user: data.user,
            tokens: { access: data.access, refresh: data.refresh },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user: data.user };
        } catch (error) {
          const errorData = error.response?.data || {
            message: "Erreur de connexion",
          };
          set({
            isLoading: false,
            error: errorData,
            isAuthenticated: false, 
            user: null, 
            tokens: { access: null, refresh: null }, 
          });
          return { success: false, errors: errorData };
        }
      },

      refreshTokenMthod: async () => {
        set({ isLoading: true, error: null });
        const refreshToken = get().tokens.refresh;

        if (!refreshToken) {
          set({
            user: null,
            tokens: { access: null, refresh: null },
            isAuthenticated: false,
            isLoading: false,
            error: { message: "Aucun refresh token disponible" },
          });
          return {
            success: false,
            errors: { message: "Aucun refresh token disponible" },
          };
        }

        try {
          const response = await apiClient.post("/user/token/refresh/", {
            refresh: refreshToken,
          });
          const { data } = response;
          console.log("refreshTokenMthod", data);

          set({
            user: data.user,
            tokens: {
              access: data.access,
              refresh: data.refresh || refreshToken, 
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user: data.user };
        } catch (error) {
          console.error("Erreur refresh token:", error);
          const errorData = error.response?.data || {
            message: "Erreur de connexion",
          };

          set({
            user: null,
            tokens: {
              access: null,
              refresh: null,
            },
            isAuthenticated: false,
            isLoading: false,
            error: errorData,
          });

          return { success: false, errors: errorData };
        }
      },

      /**
       * Déconnexion
       */
      logout: async () => {
        set({ isLoading: true });

        try {
          await apiClient.post("/user/logout/");
        } catch (error) {
          console.warn("Erreur lors du logout serveur:", error);
        } finally {
          set({
            user: null,
            tokens: { access: null, refresh: null },
            isAuthenticated: false,
            error: null,
            isLoading: false,
          });
        }
      },

      /**
       * Profil utilisateur
       */
      fetchUserProfile: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get("/user/info/");

          set({
            user: { ...get().user, ...response.data },
            isLoading: false,
            error: null,
          });

          return { success: true, user: response.data };
        } catch (error) {
          const errorData = error.response?.data || {
            message: "Erreur de connexion",
          };
          set({ isLoading: false, error: errorData });
          return { success: false, errors: errorData };
        }
      },

      /**
       * Mise à jour profil
       */
      updateUserInfo: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.put(
            "/user/update-user-info/",
            userData
          );

          set({
            user: { ...get().user, ...response.data },
            isLoading: false,
            error: null,
          });

          return { success: true, user: response.data };
        } catch (error) {
          const errorData = error.response?.data || {
            message: "Erreur de connexion",
          };
          set({ isLoading: false, error: errorData });
          return { success: false, errors: errorData };
        }
      },

      /**
       * Mise à jour mot de passe
       */
      updatePassword: async (passwordData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.post(
            "/user/update-password/",
            passwordData
          );

          set({ isLoading: false, error: null });
          return { success: true, message: response.data.message };
        } catch (error) {
          const errorData = error.response?.data || {
            message: "Erreur de connexion",
          };
          set({ isLoading: false, error: errorData });
          return { success: false, errors: errorData };
        }
      },

      /**
       * Vérifier si l'utilisateur est toujours authentifié
       */
      checkAuthStatus: async () => {
        const { tokens, isAuthenticated } = get();

        if (!isAuthenticated || !tokens.access) {
          return false;
        }

        try {
          await apiClient.get("/user/info/");
          return true;
        } catch (error) {
          if (error.response?.status === 401) {
            // Token expiré, l'intercepteur va tenter un refresh automatiquement
            return false;
          }
          throw error;
        }
      },

      /**
       * Réinitialiser erreurs
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Utilitaires
       */
      getUserType: () => {
        const state = get();
        const { user } = state;
        if (!user) return null;
        return user.is_superuser ? "admin" : "franchise";
      },

      isAdmin: () => {
        const state = get();
        const { user } = state;
        return user?.is_superuser || false;
      },
      getHasFranchise: () => {
        const state = get();
        return state.user?.has_franchise;
      },

      getFullName: () => {
        const state = get();
        const { user } = state;
        if (!user) return "";
        return (
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.email
        );
      },

      getInitials: () => {
        const state = get();
        const { user } = state;
        if (!user) return "";

        const firstName = user.first_name || "";
        const lastName = user.last_name || "";

        if (firstName && lastName) {
          return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        }

        return user.email.charAt(0).toUpperCase();
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
