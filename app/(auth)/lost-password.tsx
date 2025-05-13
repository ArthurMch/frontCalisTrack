import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { AuthService } from "@/services/auth.service";
import AppModal from '@/components/AppModal';
import { useRouter } from "expo-router";

const authService = new AuthService();

export default function LostPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
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

  const handleResetPassword = async () => {
    // Validation de l'email
    if (!email.trim()) {
      showModal('error', 'Erreur', 'Veuillez saisir votre adresse email');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showModal('error', 'Format invalide', 'Veuillez saisir une adresse email valide');
      return;
    }

    setIsLoading(true);

    try {
      await authService.lostPassword(email);
      
      // Message de succès
      showModal(
        'success', 
        'Email envoyé', 
        'Instructions de réinitialisation envoyées à votre adresse email. Veuillez vérifier votre boîte de réception.'
      );
      
      // Rediriger après fermeture du modal
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error :any) {
      console.error("Erreur de réinitialisation:", error);
      
      let errorMessage = "Une erreur est survenue. Veuillez réessayer ultérieurement.";
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "Aucun compte n'est associé à cette adresse email.";
        } else if (error.response.status === 429) {
          errorMessage = "Trop de tentatives. Veuillez réessayer plus tard.";
        }
      } else if (error.request) {
        errorMessage = "Impossible de se connecter au serveur. Veuillez vérifier votre connexion.";
      }
      
      showModal('error', 'Erreur', errorMessage);
    } finally {
      setIsLoading(false);
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
          <Text style={styles.titleGlobal}>CALISTRACK</Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Mot de passe oublié</Text>
            <View style={styles.titleUnderline} />
          </View>
          
          <Text style={styles.instructions}>
            Veuillez saisir l'adresse email associée à votre compte. 
            Vous recevrez un lien pour réinitialiser votre mot de passe.
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          
          <TouchableOpacity 
            style={[styles.resetButton, isLoading && styles.disabledButton]} 
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.resetButtonText}>Réinitialiser le mot de passe</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/login')}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
        
        {/* Modal pour les messages */}
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
    marginBottom: 20,
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
  instructions: {
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 14,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  resetButton: {
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
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#a0c4f0",
    opacity: 0.7,
  },
});