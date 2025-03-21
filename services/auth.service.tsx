import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "https://999a-2001-861-3640-60f0-5481-6d71-e75b-e7c8.ngrok-free.app/api/auth";

export class AuthService {
  async login(email: string, password: string): Promise<string> {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data; // This will be the JWT token
  }

   async logout() {
    await AsyncStorage.removeItem("token"); // Clear the token
  }

  async register(email: string, password: string): Promise<void> {
    await axios.post(`${API_URL}/register`, { email, password });
  }
}