import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { User } from "@/models/user.model";
import { authService } from "@/services/auth.service";
import CommunButton from "@/components/CommunButton";
import AppModal from "@/components/AppModal";

export default function RegisterPage() {
  // Form fields state
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI state
  const [isRegistering, setIsRegistering] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  // Modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPasswordInfoModal, setShowPasswordInfoModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  
  const router = useRouter();
  
  // Function to show password requirements
  const showPasswordRequirements = () => {
    setModalTitle("Exigences du mot de passe");
    setModalMessage(
      "Votre mot de passe doit contenir au moins 10 caractères, incluant au moins:\n" +
      "- Une lettre majuscule\n" +
      "- Une lettre minuscule\n" +
      "- Un chiffre\n" +
      "- Un caractère spécial (@$!.,;+:§£¤%*=|`#?&(){}/^_-...)"
    );
    setShowPasswordInfoModal(true);
  };
  
  // Function to show error message
  const showErrorMessage = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowErrorModal(true);
  };
  
  // Function to show success message
  const showSuccessMessage = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowSuccessModal(true);
  };
  
  // Validate form fields
  const validateForm = () => {
    // Check if all fields are filled
    if (!firstname || !lastname || !email || !phone || !password || !confirmPassword) {
      showErrorMessage("Champs obligatoires", "Veuillez remplir tous les champs obligatoires.");
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showErrorMessage("Format invalide", "Veuillez entrer une adresse email valide.");
      return false;
    }
    
    // Validate phone format (simple check for now)
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      showErrorMessage("Format invalide", "Veuillez entrer un numéro de téléphone valide (minimum 10 chiffres).");
      return false;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      showErrorMessage("Mots de passe différents", "Les mots de passe ne correspondent pas.");
      return false;
    }
    
    // Validate password strength
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!.,;+:§£¤%*=|`\\#?&(){}\[\]~\/^_-]).{10,}$/;
    if (!passwordPattern.test(password)) {
      // Show password requirements modal
      setModalTitle("Format incorrect");
      setModalMessage(
        "Le mot de passe doit contenir au moins 10 caractères, incluant au moins:\n" +
        "- Une lettre majuscule\n" +
        "- Une lettre minuscule\n" +
        "- Un chiffre\n" +
        "- Un caractère spécial (@$!.,;+:§£¤%*=|`#?&(){}/^_-...)"
      );
      setShowPasswordInfoModal(true);
      return false;
    }
    
    return true;
  };
  
  // Handle register submission
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsRegistering(true);
    try {
      const user: User = { 
        id: null, 
        firstname, 
        lastname, 
        email, 
        phone, 
        password 
      };
      
      const response = await authService.register(user);
      
      // Show success message
      showSuccessMessage(
        "Inscription réussie", 
        "Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion."
      );
      
      // Redirect to login after a short delay
      setTimeout(() => {
        setShowSuccessModal(false);
        router.replace("/login");
      }, 2000);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Handle specific error cases based on response
      if (error.response && error.response.status === 409) {
        showErrorMessage(
          "Email déjà utilisé", 
          "Un compte avec cet e-mail existe déjà."
        );
      } else {
        showErrorMessage(
          "Échec de l'inscription", 
          "Une erreur est survenue lors de l'inscription. Veuillez réessayer."
        );
      }
    } finally {
      setIsRegistering(false);
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Veuillez remplir tous les champs ci-dessous</Text>
        </View>
        
        <View style={styles.formContainer}>
          {/* Personal Information Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Prénom *</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre prénom"
                value={firstname}
                onChangeText={setFirstname}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom *</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre nom"
                value={lastname}
                onChangeText={setLastname}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Téléphone *</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre téléphone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          {/* Password Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Sécurité</Text>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Votre mot de passe doit respecter des critères de sécurité spécifiques.
              </Text>
              <TouchableOpacity onPress={showPasswordRequirements}>
                <Text style={styles.infoLink}>Voir les exigences</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Votre mot de passe"
                  value={password}
                  secureTextEntry={!passwordVisible}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Text>{passwordVisible ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmer le mot de passe *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirmer votre mot de passe"
                  value={confirmPassword}
                  secureTextEntry={!confirmPasswordVisible}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                >
                  <Text>{confirmPasswordVisible ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Register Button */}
          <View style={styles.buttonSection}>
            <CommunButton 
              label={isRegistering ? "Inscription en cours..." : "S'inscrire"} 
              onClick={handleRegister}
              disabled={isRegistering}
            />
          </View>
          
          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>Vous avez déjà un compte ?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Modals */}
      <AppModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={modalTitle}
        message={modalMessage}
        type="error"
      />
      
      <AppModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={modalTitle}
        message={modalMessage}
        type="success"
      />
      
      <AppModal
        visible={showPasswordInfoModal}
        onClose={() => setShowPasswordInfoModal(false)}
        title={modalTitle}
        message={modalMessage}
        type="info"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    borderTopColor: "#ddd",
    borderTopWidth: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  buttonSection: {
    marginVertical: 16,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f0f7ff",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4a90e2",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#555",
  },
  infoLink: {
    color: "#4a90e2",
    fontWeight: "600",
    marginLeft: 8,
    textDecorationLine: "underline",
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  loginText: {
    color: "#666",
    fontSize: 16,
  },
  loginLink: {
    color: "#4a90e2",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});