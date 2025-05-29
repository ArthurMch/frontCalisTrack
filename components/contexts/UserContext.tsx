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

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        setIsLoading(true);
        const storedUser = await AsyncStorage.getItem("currentUser");
        if (storedUser) {
          setCurrentUserState(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur :", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  useEffect(() => {
    AuthEvents.onTokenExpired = () => {
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
      await AsyncStorage.multiRemove(["token", "refreshToken", "currentUser"]);
      setCurrentUserState(null);
      
      // Vérifier qu'on n'est pas déjà sur la page de login
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