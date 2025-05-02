// services/UserService.ts
import { User } from "@/models/user.model";
import { PasswordUpdateResponse } from "@/models/auth/PasswordUpdateResponse";
import { api } from "./apiClient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class UserService {
  // Utiliser le chemin complet incluant /api s'il est nécessaire
  private readonly BASE_PATH = '/user';

  /**
   * Crée un nouvel utilisateur
   * @param user L'objet utilisateur à créer
   * @returns L'utilisateur créé
   */
  async create(user: User): Promise<User> {
    try {
      const response = await api.post<User>(`${this.BASE_PATH}/`, user);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      throw error;
    }
  }

  /**
   * Récupère la liste de tous les utilisateurs
   * @returns Liste des utilisateurs
   */
  async findAll(): Promise<User[]> {
    try {
      const response = await api.get<User[]>(`${this.BASE_PATH}/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      throw error;
    }
  }

  /**
   * Récupère un utilisateur
   * @param id id de l'utilisateur
   * @returns l'utilisateur
   */
  async findById(id: number): Promise<User> {
    try {
      const response = await api.get<User>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  /**
   * Met à jour un utilisateur existant
   * @param id L'ID de l'utilisateur à mettre à jour
   * @param user Les nouvelles données de l'utilisateur
   * @returns L'utilisateur mis à jour
   */
  async update(id: number, user: User): Promise<User> {
    try {
      const response = await api.put<User>(`${this.BASE_PATH}/${id}`, user);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprime un utilisateur par son ID
   * @param id L'ID de l'utilisateur à supprimer
   * @returns Un message de confirmation
   */
  async delete(id: number): Promise<string> {
    try {
      const response = await api.delete<string>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  /**
   * Met à jour le profil de l'utilisateur
   * @param profileUpdatePayload Les données du profil à mettre à jour
   * @returns Objet contenant le statut de succès et éventuellement un nouveau token
   */
  async updateProfile(profileUpdatePayload: {
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
    password?: string;
  }): Promise<{ success: boolean; accessToken?: string }> {
    try {
      const response = await api.post(`${this.BASE_PATH}/update`, profileUpdatePayload);
      
      // Si un nouveau token est fourni, mettons à jour le stockage
      if (response.data.accessToken) {
        await AsyncStorage.setItem("token", response.data.accessToken);
      }
      
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
      throw error;
    }
  }

  /**
   * Met à jour le mot de passe de l'utilisateur
   * @param passwordUpdatePayload Objet contenant le nouveau mot de passe
   * @returns Réponse de mise à jour du mot de passe
   */
  async updatePassword(passwordUpdatePayload: { password: string }): Promise<PasswordUpdateResponse> {
    try {
      const response = await api.post<PasswordUpdateResponse>(
        `${this.BASE_PATH}/update-password`, 
        passwordUpdatePayload
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe :", error);
      
      // Gestion spécifique des erreurs structurées
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data && error.response.data.status) {
          return error.response.data as PasswordUpdateResponse;
        }
      }
      throw error;
    }
  }
}

export const userService = new UserService();