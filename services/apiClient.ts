import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { router } from "expo-router";

// Global event handler for token expiration
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
    // Request interceptor to add token
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

    // Response interceptor to handle authentication errors
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // If the error is 403 Unauthorized or 401 (token expired)
        if (error.response?.status === 403 || error.response?.status === 401) {
          if (!originalRequest._retry) {
            if (!this.isRefreshing) {
              this.isRefreshing = true;

              try {
                // Global token expired handler
                if (AuthEvents.onTokenExpired) {
                  AuthEvents.onTokenExpired();
                }

                // Clear stored tokens and user data
                await AsyncStorage.multiRemove([
                  "token",
                  "refreshToken",
                  "currentUser",
                ]);

                // Always redirect, both web and native
                router.replace("/login");

                this.isRefreshing = false;
                return Promise.reject(error);
              } catch (refreshError) {
                this.isRefreshing = false;
                return Promise.reject(refreshError);
              }
            } else {
              return Promise.reject(error);
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Public API methods (GET, POST, PUT, DELETE, PATCH)
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

// Create and export an instance with your base URL
const API_BASE_URL = Constants.expoConfig?.extra?.LOCALHOST_URL;
export const api = new ApiClient(API_BASE_URL);
