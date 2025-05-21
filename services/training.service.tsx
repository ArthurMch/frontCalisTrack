import axios from "axios";
import { Training } from "@/models/training.model";
import Constants from "expo-constants";
import { api } from "./apiClient";

const LOCALHOST_URL = Constants.expoConfig?.extra?.LOCALHOST_URL;

export class TrainingService {
     
   private readonly BASE_PATH = '/training/';
      
      /**
   * Crée un nouvel entrainement
   * @param exercise L'objet training à créer
   * @returns L'entrainement créé
   */
  async create(training: Training): Promise<Training> {
    const response = await api.post<Training>(this.BASE_PATH, training);
    return response.data;
  }

  /**
   * Récupère la liste de tous les entrainements
   * @returns Liste des entrainements
   */
  async findAll(filters = {}): Promise<Training[]> {
    const response = await api.get(this.BASE_PATH, { params: filters });
    return response.data;
  }

    /**
   * Récupère la liste de tous les entrainements
   * @returns Liste des entrainements
   */
  async findAllByUser(id: number): Promise<Training[]> {
    const response = await api.get(`${this.BASE_PATH + "user/"}${id}`);
    return response.data;
  }

    /**
   * Récupère un entrainement
   * @param id id de l'entrainement
   * @returns l'entrainement
   */
  async findById(id: number): Promise<Training> {
    const response = await api.get(`${this.BASE_PATH}${id}`);
    return response.data;
  }

    /**
   * Met à jour un entrainement existant
   * @param id L'ID de l'entrainement à mettre à jour
   * @param user Les nouvelles données de l'entrainement
   * @returns L'entrainement mis à jour
   */
  async update(trainingId: number, training: Training): Promise<Training> {
    const response = await api.put(`${this.BASE_PATH}${trainingId}`, training);
    return response.data;
  }

  /**
   * Supprime un entrainement par son ID
   * @param id L'ID de l'entrainement à supprimer
   * @returns Un message de confirmation
   */
  async delete(id: number): Promise<string> {
    const response = await api.delete(`${this.BASE_PATH}${id}`);
    return response.data;
  }
  
}

export const trainingService = new TrainingService();