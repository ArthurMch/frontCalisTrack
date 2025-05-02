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
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="lost-password" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="reset-password" 
          options={{ 
            headerShown: false,
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