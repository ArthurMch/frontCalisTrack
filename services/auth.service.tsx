import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { getApiUrl } from "@/utils/UrlUtils";
import { User } from "@/models/user.model";

const ngRockUrl = getApiUrl();
const API_URL = ngRockUrl + "/api/auth";

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
}