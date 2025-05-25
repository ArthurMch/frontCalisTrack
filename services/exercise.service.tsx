import { Exercise } from "@/models/exercise.model";
import { api } from "./apiClient";

export class ExerciseService {

    private readonly BASE_PATH = '/exercise/';
  
  /**
   * Crée un nouvel exercice
   * @param exercise L'objet exercice à créer
   * @returns L'exercice créé
   */
  async create(exercise: Exercise): Promise<Exercise> {
    const response = await api.post(this.BASE_PATH, exercise);
    return response.data;
  }

   /**
   * Récupère tous les exercices
   * @param filters Filtres optionnels
   * @returns Liste des exercices
   */
  async findAll(filters = {}): Promise<Exercise[]> {
    const response = await api.get(this.BASE_PATH, { params: filters });
    return response.data;
  }

    /**
   * Récupère un exercice par son ID
   * @param id ID de l'exercice
   * @returns L'exercice trouvé
   */
  async findAllByUserId(id: number): Promise<Exercise[]> {
    const response = await api.get(`${this.BASE_PATH + "user/"}${id}`);
    return response.data;
  }

    /**
   * Met à jour un exercise existant
   * @param id L'ID de l'exercise à mettre à jour
   * @param user Les nouvelles données de l'exercise
   * @returns L'exercise mis à jour
   */
  async update(id: number, exercise: Exercise): Promise<Exercise> {
    const response = await api.put(`${this.BASE_PATH}${id}`, exercise);
    return response.data;
  }

  /**
   * Supprime un exercise par son ID
   * @param id L'ID de l'exercise à supprimer
   * @returns Un message de confirmation
   */
  async delete(id: number): Promise<string> {
    const response = await api.delete(`${this.BASE_PATH}${id}`);
    return response.data;
  }

}

export const exerciseService = new ExerciseService();