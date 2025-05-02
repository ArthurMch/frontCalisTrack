// services/apiClient.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert } from "react-native";
import Constants from "expo-constants";

// Événement global pour la déconnexion
export const AuthEvents = {
  onTokenExpired: null as (() => void) | null,
};

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Intercepteur de requête pour ajouter le token
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur de réponse pour gérer les erreurs d'authentification
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Si l'erreur est 403 Unauthorized
        if (error.response?.status === 403) {
          // Si nous n'avons pas déjà essayé de rafraîchir le token pour cette requête
          if (!originalRequest._retry) {
            // Si nous ne sommes pas déjà en train de rafraîchir
            if (!this.isRefreshing) {
              this.isRefreshing = true;

              try {
                this.logout();
                return Promise.reject(error);
              } catch (refreshError) {
                this.isRefreshing = false;
                this.logout();
                return Promise.reject(refreshError);
              }
            } else {
              // Si nous sommes déjà en train de rafraîchir, mettre la requête en attente
              return new Promise((resolve) => {
                this.addSubscriber((token: string) => {
                  originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization: `Bearer ${token}`,
                  };
                  originalRequest._retry = true;
                  resolve(this.instance(originalRequest));
                });
              });
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private addSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private async logout(): Promise<void> {
    try {
      // Nettoyage du stockage
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("currentUser");

      // Appel de l'événement global de déconnexion
      if (AuthEvents.onTokenExpired) {
        AuthEvents.onTokenExpired();
      }

      // Afficher une alerte avant de rediriger
      Alert.alert(
        "Session expirée",
        "Votre session a expiré. Veuillez vous reconnecter.",
        [
          {
            text: "OK",
            onPress: () => {
              // Redirection vers la page de login
              router.replace("/login");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // En cas d'erreur, essayer de rediriger quand même
      router.replace("/login");
    }
  }

  // Méthodes d'API publiques
  public get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  public delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  public patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }
}

// Créer et exporter une instance avec votre URL de base
const API_BASE_URL = Constants.expoConfig?.extra?.LOCALHOST_URL;
export const api = new ApiClient(API_BASE_URL);
