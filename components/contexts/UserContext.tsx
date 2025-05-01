import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Ton type utilisateur
interface User {
  id: number;
  email: string;
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

// Crée le contexte
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);

  // Charger l'utilisateur depuis AsyncStorage au démarrage
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("currentUser");
        if (storedUser) {
          setCurrentUserState(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur :", error);
      }
    };

    loadUserFromStorage();
  }, []);

  // Mettre à jour à la fois le state et AsyncStorage
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

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook d'accès au contexte
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
