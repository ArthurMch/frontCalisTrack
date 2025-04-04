import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native'; // Import jwt-decode to decode JWT tokens
import { useColorScheme } from '@/components/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { getApiUrl } from '@/utils/UrlUtils';
import { AuthService } from '@/services/auth.service';

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const colorScheme = useColorScheme();
  const router = useRouter(); 
  const authService = new AuthService(); 

 useEffect(() => {
  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');

    if (token) { 
      const isValid = await validateToken(token);

      if (isValid) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push('/login');
      }
    } else {
      setIsAuthenticated(false);
      router.push('/login'); 
    }
  };

  checkAuth();
}, []);


  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const data = await authService.validateToken(token); 
      return data; 
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  if (isAuthenticated === null) {
    
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <Stack>
      {isAuthenticated ? (
        // Authenticated routes with tab navigation
        <Stack.Screen
          name="(tabs)"
           options={{ 
              headerShown: false,
              headerBackVisible: false
            }}
        />
            ) : (
        // Unauthenticated routes
        <>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </>
      )}
    </Stack></ThemeProvider>
  );
}

