import axios from "axios";
import { Exercise } from "@/models/exercise.model";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "@/utils/UrlUtils";

const ngRockUrl = getApiUrl();
const API_URL = ngRockUrl + "/exercise";


export class ExerciseService {
  
      /**
   * Crée un nouvel exercise
   * @param exercise L'objet exercise à créer
   * @returns L'exercise créé
   */
  async create(exercise: Exercise): Promise<Exercise> {
  const token = await AsyncStorage.getItem("token"); // Récupérer le token
  const response = await axios.post<Exercise>(
    `${API_URL}/`,
    exercise,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Inclure le token dans les en-têtes
      },
    }
  );
  return response.data;
}


  /**
   * Récupère la liste de tous les exercises
   * @returns Liste des exercises
   */
  async findAll(): Promise<Exercise[]> {
    const token = await AsyncStorage.getItem("token"); // Retrieve the token
    const response = await axios.get<Exercise[]>(`${API_URL}/`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });
    return response.data;
  }

    /**
   * Récupère un exercise
   * @param id id de l'exercise
   * @returns l'exercise
   */
  async findById(id: number): Promise<Exercise> {
    const response = await axios.get<Exercise>(`${API_URL}/${id}`);
    return response.data;
  }

    /**
   * Met à jour un exercise existant
   * @param id L'ID de l'exercise à mettre à jour
   * @param user Les nouvelles données de l'exercise
   * @returns L'exercise mis à jour
   */
  async update(id: number, exercise: Exercise): Promise<Exercise> {
    const response = await axios.put<Exercise>(`${API_URL}/${id}`, exercise);
    return response.data;
  }

  /**
   * Supprime un exercise par son ID
   * @param id L'ID de l'exercise à supprimer
   * @returns Un message de confirmation
   */
  async delete(id: number): Promise<string> {
    const response = await axios.delete<string>(`${API_URL}/${id}`);
    return response.data;
  }

}