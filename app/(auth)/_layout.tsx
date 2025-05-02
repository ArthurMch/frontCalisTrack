import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <Stack>
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            gestureEnabled: false
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            headerTitle: "Inscription",
            headerBackTitle: "Retour"
          }} 
        />
        <Stack.Screen 
          name="lost-password" 
          options={{ 
            headerTitle: "Mot de passe oublié",
            headerBackTitle: "Retour"
          }} 
        />
        <Stack.Screen 
          name="reset-password" 
          options={{ 
            headerTitle: "Réinitialiser le mot de passe",
            headerBackTitle: "Retour"
          }} 
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});