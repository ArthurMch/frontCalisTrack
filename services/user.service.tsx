import axios from "axios";
import { User } from "@/models/user.model";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCALHOST_URL = Constants.expoConfig?.extra?.LOCALHOST_URL;
const API_URL = LOCALHOST_URL +  "/user";

export class UserService {
  /**
   * Crée un nouvel utilisateur
   * @param user L'objet utilisateur à créer
   * @returns L'utilisateur créé
   */
  async create(user: User): Promise<User> {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post<User>(`${API_URL}/`, user , {
      headers: {  Authorization: `Bearer ${token}`, },
    });
    return response.data;
  }

  /**
   * Récupère la liste de tous les utilisateurs
   * @returns Liste des utilisateurs
   */
  async findAll(): Promise<User[]> {
    const response = await axios.get<User[]>(`${API_URL}/`);
    return response.data;
  }

      /**
   * Récupère un utilisateur
   * @param id id de l'utilisateur
   * @returns l'utilisateur
   */
  async findById(id: number): Promise<User> {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get<User>(`${API_URL}/${id}` , {
      headers: {  Authorization: `Bearer ${token}`, },
    });
    return response.data;
  }

  /**
   * Met à jour un utilisateur existant
   * @param id L'ID de l'utilisateur à mettre à jour
   * @param user Les nouvelles données de l'utilisateur
   * @returns L'utilisateur mis à jour
   */
  async update(id: number, user: User): Promise<User> {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put<User>(`${API_URL}/${id}`, user, {
      headers: {  Authorization: `Bearer ${token}`, },
    });
    return response.data;
  }

  /**
   * Supprime un utilisateur par son ID
   * @param id L'ID de l'utilisateur à supprimer
   * @returns Un message de confirmation
   */
  async delete(id: number): Promise<string> {
    const response = await axios.delete<string>(`${API_URL}/${id}`);
    return response.data;
  }
}

