import 'react-datepicker/dist/react-datepicker.css';
import '@/global.css';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProvider } from '@/components/contexts/UserContext';
import { authService } from '@/services/auth.service';


export const unstable_settings = {
  initialRouteName: '(auth)',
};

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text>Vérification de l'authentification...</Text>
    </View>
  );
}

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        
        if (token) {
          // Utilisez votre API client pour vérifier le token
          // Cela déclenchera automatiquement l'intercepteur en cas d'erreur 401
          const isValid = await validateToken(token);
          setIsAuthenticated(isValid);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      // Appel à votre endpoint de validation de token
      // L'intercepteur gérera automatiquement les erreurs 401
      await authService.validateToken(token);
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  // Afficher un écran de chargement pendant la vérification
  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  return (
    <UserProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen 
              name="(app)" 
              options={{ 
                headerShown: false,
                // Empêcher le retour aux écrans d'authentification
                gestureEnabled: false 
              }} 
            />
          ) : (
            <Stack.Screen 
              name="(auth)" 
              options={{ 
                headerShown: false 
              }} 
            />
          )}
        </Stack>
      </ThemeProvider>
    </UserProvider>
  );
}