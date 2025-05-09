import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./apiClient";
import { User } from "@/models/user.model";
import { LoginRequest } from "@/models/auth/LoginRequest";
import { JwtResponse } from "@/models/auth/JwtResponse";
import { router } from "expo-router";

const AUTH_ENDPOINT = "/api/auth";

export class AuthService {
  
  async login(loginRequest: LoginRequest): Promise<JwtResponse> {
    const response = await api.post<JwtResponse>(`${AUTH_ENDPOINT}/login`, loginRequest);
    
    // Stocker le token après la connexion
    if (response.data.accessToken) {
      await AsyncStorage.setItem("token", response.data.accessToken);
    }
    
    return response.data;
  }

  async logout() {

    // Nettoyage local
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("currentUser");
   
  }

  async register(user: User): Promise<void> {
    await api.post(`${AUTH_ENDPOINT}/register`, user);
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await api.post(`${AUTH_ENDPOINT}/validate-token`, { token });
      return response.data.isValid;
    } catch (error) {
      console.error("Token validation failed:", error);
      // En cas d'erreur, on considère que le token n'est pas valide
      await this.logout()

      
      return false;
    }
  }
  
  async getUserInfo(): Promise<User> {
    try {
      const response = await api.get<User>(`${AUTH_ENDPOINT}/user`);
      
      // Optionnel : stocker les informations utilisateur
      await AsyncStorage.setItem("currentUser", JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      throw error;
    }
  }

  async lostPassword(email: string): Promise<void> {
    try {
      await api.post(`${AUTH_ENDPOINT}/lost-password`, { email });
    } catch (error) {
      console.error("Failed to send reset password email:", error);
      throw error;
    }
  }

  async isValidLostPassword(token: string): Promise<void> {
    try {
      await api.post(`${AUTH_ENDPOINT}/is-valid-lost-password`, { token });
    } catch (error) {
      console.error("Invalid token:", error);
      throw error;
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await api.post(`${AUTH_ENDPOINT}/reset-password`, { token, password });
    } catch (error) {
      console.error("Failed to reset password:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();