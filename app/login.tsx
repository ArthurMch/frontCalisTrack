import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { AuthService } from "@/services/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserContext } from "@/components/contexts/UserContext";

const authService = new AuthService();

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setCurrentUser } = useUserContext(); 

  const handleLogin = async () => {
    try {
      const loginRequest = { email, password };
      const response = await authService.login(loginRequest);
      const token = response.accessToken;
      await AsyncStorage.setItem("token", token);
      setCurrentUser({
        id: response.id,
        email: response.email,
      });
      
      router.push("/(tabs)/exercise"); // Redirect to the main app screen after login
      
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => router.push("/register")} />
      <TouchableOpacity onPress={() => router.push("/lostPassword")}>
        <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
  },
 error: {
    color: "red",
    marginBottom: 10,
  },
  forgotPassword: {
    marginTop: 15,
    color: "#007bff",
    textAlign: "center",
  },
});