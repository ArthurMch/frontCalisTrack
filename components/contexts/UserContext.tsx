import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode, 
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { AuthEvents } from "@/services/apiClient";
import { authService } from "@/services/auth.service"; // Importez votre authService

interface User {
  id: number;
  email: string;
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour valider le token
  const validateToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        console.log("No token found, user not authenticated");
        setCurrentUserState(null);
        setIsLoading(false);
        return;
      }

      console.log("Validating token...");
      
      // Utilisation de votre authService existant
      const isValid = await authService.validateToken(token);
      
      if (isValid) {
        console.log("Token valid, loading user from storage...");
        // Si le token est valide, charger l'utilisateur depuis le storage
        const storedUser = await AsyncStorage.getItem("currentUser");
        if (storedUser) {
          setCurrentUserState(JSON.parse(storedUser));
        } else {
          // Si pas d'utilisateur en storage mais token valide, 
          // il faut récupérer l'utilisateur du serveur
          console.log("No user in storage, need to fetch user data");
          await logout(); // Force une nouvelle connexion
        }
      } else {
        console.log("Token invalid, logging out...");
        await logout();
      }
      
    } catch (error) {
      console.log("Token validation error:", error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  useEffect(() => {
    AuthEvents.onTokenExpired = () => {
      console.log("Token expired event triggered");
      logout();
    };

    return () => {
      AuthEvents.onTokenExpired = null;
    };
  }, []);

  const setCurrentUser = async (user: User | null) => {
    try {
      if (user) {
        await AsyncStorage.setItem("currentUser", JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem("currentUser");
      }
      setCurrentUserState(user);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'utilisateur :", error);
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out user...");
      await AsyncStorage.multiRemove(["token", "refreshToken", "currentUser"]);
      setCurrentUserState(null);
      router.replace("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};