import React from 'react';
import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useUserContext } from "@/components/contexts/UserContext";
import { authService } from '@/services/auth.service';
import { useEffect } from 'react';
import { useRef } from 'react';
import AppModal from '@/components/AppModal';


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setCurrentUser } = useUserContext();
  
  // État pour les messages d'erreur
  const [errorMessage, setErrorMessage] = useState("");
  const [errorLogin, setErrorLogin] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // État pour le modal
  const [modal, setModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "info" | "success" | "error"
  });
  
  const showModal = (type: 'error' | 'success' | 'info', title: string, message: string) => {
    setModal({
      visible: true,
      title,
      message,
      type
    });
  };
  
  const handleLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    
    if (!email.trim()) {
      setErrorMessage("Veuillez saisir votre email");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Veuillez saisir votre mot de passe");
      return;
    }
    
    try {
      const loginRequest = { email, password };
      const response = await authService.login(loginRequest);
  
      if (response.accessToken) {
        await AsyncStorage.setItem('token', response.accessToken);
      }
  
      await setCurrentUser({
        id: response.id,
        email: response.email,
      });
      
      router.push("/(app)/exercise");
    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      if (err && err.response && err.response.status === 403) {
        setErrorMessage("Email ou mot de passe incorrect.");
      } else {
        setErrorMessage("Une erreur est survenue lors de la connexion.");
        showModal('error', 'Erreur de connexion', 'Une erreur est survenue lors de la connexion.');
      }
    } 
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/logoCalistrackAndText.png')} // ← Chemin vers votre logo
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Suivez vos performances</Text>
      </View>
        
        <View style={styles.formContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Connexion</Text>
            <View style={styles.titleUnderline} />
          </View>
          
          {/* Affichage du message d'erreur */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
          
          {/* Affichage du message de succès */}
          {successMessage ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          {/* Affichage du message d'erreur */}
          {errorLogin ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorLogin}</Text>
            </View>
          ) : null}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={() => router.push("/register")}
          >
            <Text style={styles.registerButtonText}>Créer un compte</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={() => router.push("/lost-password")}
          >
            <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>
          {/* Modal pour les messages d'erreur/succès */}
          <AppModal
          visible={modal.visible}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onClose={() => setModal(prev => ({ ...prev, visible: false }))}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const screenWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  logo: {
    width: 200,        // ← Ajustez la taille selon votre logo
    height: 150,       // ← Ajustez la hauteur
    marginBottom: 10,  // ← Espacement avec le sous-titre
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  titleGlobal: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4a90e2",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    width: screenWidth > 500 ? 500 : screenWidth - 40,
    alignSelf: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: "#4a90e2",
    borderRadius: 3,
  },
  // Styles pour le message d'erreur
  errorContainer: {
    backgroundColor: "#ffebee",
    borderWidth: 1,
    borderColor: "#f44336",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
  },
  // Styles pour le message de succès
  successContainer: {
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#4caf50",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: "#2e7d32",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 14,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#4a90e2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "#2971cc",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPasswordContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  forgotPassword: {
    color: "#4a90e2",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});