import axios from "axios";
import { User } from "@/models/user.model";
import { getApiUrl } from "@/utils/UrlUtils";

const ngRockUrl = getApiUrl();
const API_URL = ngRockUrl + "/user";

export class UserService {
  /**
   * Crée un nouvel utilisateur
   * @param user L'objet utilisateur à créer
   * @returns L'utilisateur créé
   */
  async create(user: User): Promise<User> {
    const response = await axios.post<User>(`${API_URL}/`, user);
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
    const response = await axios.get<User>(`${API_URL}/${id}`);
    return response.data;
  }

  /**
   * Met à jour un utilisateur existant
   * @param id L'ID de l'utilisateur à mettre à jour
   * @param user Les nouvelles données de l'utilisateur
   * @returns L'utilisateur mis à jour
   */
  async update(id: number, user: User): Promise<User> {
    const response = await axios.put<User>(`${API_URL}/${id}`, user);
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

// Exemple d'utilisation
const userService = new UserService();

(async () => {
  try {
    // Créer un utilisateur
    const newUser = await userService.create({
      id: null,
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      password: "password123",
    });
    console.log("Utilisateur créé :", newUser);

    // Récupérer tous les utilisateurs
    const users = await userService.findAll();
    console.log("Liste des utilisateurs :", users);

    // Mettre à jour un utilisateur
    const updatedUser = await userService.update(newUser.id!, {
      ...newUser,
      firstname: "Johnathan",
    });
    console.log("Utilisateur mis à jour :", updatedUser);

    // Supprimer un utilisateur
    const deleteMessage = await userService.delete(updatedUser.id!);
    console.log("Message de suppression :", deleteMessage);
  } catch (error) {
    console.error("Erreur :", error);
  }
})();
