import axios from "axios";
import { Training } from "../../models/training.model";


const API_URL = "http://localhost:8080/training";

export class TrainingService {

      
      /**
   * Crée un nouvel entrainement
   * @param exercise L'objet training à créer
   * @returns L'entrainement créé
   */
  async create(training: Training): Promise<Training> {
    const response = await axios.post<Training>(`${API_URL}/`, training);
    return response.data;
  }

  /**
   * Récupère la liste de tous les entrainements
   * @returns Liste des entrainements
   */
  async findAll(): Promise<Training[]> {
    const response = await axios.get<Training[]>(`${API_URL}/`);
    return response.data;
  }

    /**
   * Récupère un entrainement
   * @param id id de l'entrainement
   * @returns l'entrainement
   */
  async findById(id: number): Promise<Training> {
    const response = await axios.get<Training>(`${API_URL}/${id}`);
    return response.data;
  }

    /**
   * Met à jour un entrainement existant
   * @param id L'ID de l'entrainement à mettre à jour
   * @param user Les nouvelles données de l'entrainement
   * @returns L'entrainement mis à jour
   */
  async update(id: number, training: Training): Promise<Training> {
    const response = await axios.put<Training>(`${API_URL}/${id}`, training);
    return response.data;
  }

  /**
   * Supprime un entrainement par son ID
   * @param id L'ID de l'entrainement à supprimer
   * @returns Un message de confirmation
   */
  async delete(id: number): Promise<string> {
    const response = await axios.delete<string>(`${API_URL}/${id}`);
    return response.data;
  }

}