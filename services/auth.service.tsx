import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { User } from "@/models/user.model";
import Constants from "expo-constants";

const LOCALHOST_URL = Constants.expoConfig?.extra?.LOCALHOST_URL;
const API_URL = LOCALHOST_URL + "/api/auth";

export class AuthService {
  
  async login(email: string, password: string): Promise<string> {
      console.log(API_URL);
    const response = await axios.post(`${API_URL}/login`, { email, password });
  
    return response.data; // This will be the JWT token
  }

   async logout() {
    await AsyncStorage.removeItem("token"); // Clear the token
  }

  async register(user: User): Promise<void> {
    await axios.post(`${API_URL}/register`, user);
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/validate-token`, { token });
      return response.data.isValid;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  }
  async getUserInfo(token: string): Promise<User> {
    try {
      const response = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Assume the API returns user data
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      throw error;
    }
  }

}