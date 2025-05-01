import React, { useEffect, useState } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, InteractionManager, ActivityIndicator } from 'react-native'; // Import jwt-decode to decode JWT tokens
import { useColorScheme } from '@/components/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { AuthService } from '@/services/auth.service';
import { UserProvider } from '@/components/contexts/UserContext';

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const colorScheme = useColorScheme();
  const router = useRouter(); 
  const authService = new AuthService(); 
  const pathname = usePathname();
    const publicPaths = ['/register', '/reset-password', '/forgot-password', '/login', '/lostPassword', '/validate-email', '/validate-token', '/validate-reset-password'];

 useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');

      if (token) {
        const isValid = await validateToken(token);

        if (isValid) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
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

  useEffect(() => {
    if (isAuthenticated === false && !publicPaths.includes(pathname)) {
      router.replace('/login');
    }
  }, [isAuthenticated, pathname]);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Vérification de l'authentification...</Text>
      </View>
    );
  }

  return (
    <UserProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {isAuthenticated ? (
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                headerBackVisible: false,
              }}
            />
          ) : (
            <>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
            </>
          )}
        </Stack>
      </ThemeProvider>
    </UserProvider>
  );
}

