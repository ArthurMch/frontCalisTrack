import { User } from "@/models/user.model";
import { userService } from "@/services/user.service";
import { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CommunButton from "./CommunButton";
import { useUserContext } from "./contexts/UserContext";
import AppModal from "./AppModal";
import { router } from "expo-router";
import { authService } from "@/services/auth.service";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileContent({ path }: { path: string }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const insets = useSafeAreaInsets();
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showPasswordInfoModal, setShowPasswordInfoModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { currentUser, isLoading: userLoading } = useUserContext();
  
  const fetchUser = async () => {
    if (!currentUser || currentUser == null) {
      console.error("Aucun utilisateur connecté.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data: User = await userService.findById(currentUser.id!);
    
      if (!data) {
        setUser(null);
        setError("Aucun utilisateur trouvé.");
        showErrorMessage("Erreur", "Aucun utilisateur trouvé.");
      } else {
        setUser(data);
        setFirstname(data.firstname);
        setLastname(data.lastname);
        setPhone(data.phone);
        setEmail(data.email);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      setError("Impossible de récupérer l'utilisateur. Veuillez réessayer plus tard.");
      showErrorMessage("Erreur de chargement", "Impossible de récupérer l'utilisateur. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    } 
  };
  const showErrorMessage = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowErrorModal(true);
  };
  const showSuccessMessage = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowSuccessModal(true);
  };

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

  const validateProfileForm = () => {
    if (!firstname || !lastname || !email || !phone) {
      showErrorMessage("Champs obligatoires", "Veuillez remplir tous les champs obligatoires.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showErrorMessage("Format invalide", "Veuillez entrer une adresse email valide.");
      return false;
    }
    return true;
  };

  const validatePasswordForm = () => {
    if (!password || !confirmPassword) {
      showErrorMessage("Champs obligatoires", "Veuillez remplir les deux champs de mot de passe.");
      return false;
    }

    if (password !== confirmPassword) {
      showErrorMessage("Mots de passe différents", "Les mots de passe ne correspondent pas.");
      return false;
    }

    // Vérification de la complexité du mot de passe selon le pattern requis
    // Pattern: au moins 10 caractères, au moins 1 chiffre, 1 minuscule, 1 majuscule et 1 caractère spécial
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!.,;+:§£¤%*=|`\\#?&(){}\[\]~\/^_-]).{10,}$/;
    
    if (!passwordPattern.test(password)) {
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

  const updateProfile = async () => {
    if (!validateProfileForm()) {
      return;
    }

    setIsSavingProfile(true);
    try {
      const profileUpdatePayload = {
        firstname,
        lastname,
        phone,
        email
      };
      const response = await userService.updateProfile(profileUpdatePayload);

      if (response.success) {
        showSuccessMessage(
          "Profil mis à jour",
          "Vos informations personnelles ont été mises à jour avec succès !"
        );
        if (response.accessToken) {
          await AsyncStorage.setItem("token", response.accessToken);
        }
        fetchUser();
      } else {
        showErrorMessage(
          "Échec de la mise à jour",
          "Une erreur est survenue lors de la mise à jour du profil."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
      showErrorMessage(
        "Erreur système",
        "Une erreur est survenue lors de la mise à jour du profil."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };
  const updatePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsSavingPassword(true);
    try {
      const passwordUpdatePayload = {
        password
      };
      const response = await userService.updatePassword(passwordUpdatePayload);
      if (response.status === 'DONE') {
        showSuccessMessage(
          "Mot de passe mis à jour",
          "Votre mot de passe a été mis à jour avec succès !"
        );
        if (response.accessToken) {
          await AsyncStorage.setItem("token", response.accessToken);
        }
        setPassword("");
        setConfirmPassword("");
      } else if (response.status === 'INCORRECT') {
        setModalTitle("Format incorrect");
        setModalMessage(
          "Le mot de passe doit contenir au moins 10 caractères, incluant au moins:\n" +
          "- Une lettre majuscule\n" +
          "- Une lettre minuscule\n" +
          "- Un chiffre\n" +
          "- Un caractère spécial (@$!.,;+:§£¤%*=|`#?&(){}/^_-...)"
        );
        setShowPasswordInfoModal(true);
      } else if (response.status === 'ALREADY') {
        showErrorMessage(
          "Mot de passe déjà utilisé",
          "Ce mot de passe a déjà été utilisé récemment. Veuillez en choisir un nouveau."
        );
      } else {
        showErrorMessage(
          "Échec de la mise à jour",
          "Une erreur est survenue lors de la mise à jour du mot de passe."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe :", error);
      showErrorMessage(
        "Erreur système",
        "Une erreur est survenue lors de la mise à jour du mot de passe."
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const confirmDeleteUser = () => {
    setShowDeleteConfirmModal(true);
  };

  const deleteUser = async () => {
    if (!user) {
      return;
    }
    
    setShowDeleteConfirmModal(false);
    setIsSavingProfile(true);
    
    try {
      await userService.delete(user.id!);
      showSuccessMessage(
        "Compte supprimé", 
        "Votre compte a été supprimé avec succès."
      );
      setUser(null);
      
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("currentUser");
      
      setTimeout(() => {
        setShowSuccessModal(false);
        router.replace("/login");
      }, 1500); // 1.5 secondes de délai
      
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
      showErrorMessage(
        "Échec de la suppression", 
        "Une erreur est survenue lors de la suppression du compte."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    if (!currentUser && !userLoading) {
      router.replace("/login");
      return;
    }
    fetchUser();
  }, [currentUser]);


  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Chargement de votre profil...</Text>
      </View>
      </SafeAreaView>
    );
  }
  if (userLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {firstname && lastname ? `${firstname.charAt(0)}${lastname.charAt(0)}` : "?"}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>Mon Profil</Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <CommunButton label="Réessayer" onClick={fetchUser} />
          </View>
        ) : user ? (
          <View style={styles.formContainer}>
            {/* Section Informations personnelles */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Informations personnelles</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre prénom"
                  value={firstname}
                  onChangeText={setFirstname}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre nom"
                  value={lastname}
                  onChangeText={setLastname}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Téléphone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre téléphone"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.buttonSection}>
                <CommunButton 
                  label={isSavingProfile ? "Enregistrement..." : "Enregistrer les informations"} 
                  onClick={updateProfile}
                  disabled={isSavingProfile}
                />
              </View>
            </View>

            {/* Section Sécurité / Mot de passe */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Changer mon mot de passe</Text>
              
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Votre mot de passe doit respecter des critères de sécurité spécifiques.
                </Text>
                <TouchableOpacity onPress={showPasswordRequirements}>
                  <Text style={styles.infoLink}>Voir les exigences</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Nouveau mot de passe"
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
                <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirmer le mot de passe"
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
              
              <View style={styles.buttonSection}>
                <CommunButton 
                  label={isSavingPassword ? "Mise à jour..." : "Modifier le mot de passe"} 
                  onClick={updatePassword}
                  disabled={isSavingPassword}
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Gestion de compte</Text>
            <CommunButton 
              label={"Déconnexion"} 
              onClick={() => setShowLogoutModal(true)}
              disabled={isSavingProfile || isSavingPassword}
            />
            {/* Section de suppression du compte */}
            <TouchableOpacity 
              style={styles.deleteAccountButton} 
              onPress={confirmDeleteUser}
              disabled={isSavingProfile || isSavingPassword}
            >
              <Text style={styles.deleteAccountText}>Supprimer mon compte</Text>
            </TouchableOpacity>
            </View>
          </View>
        ) : null}
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

      <AppModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        type="info"
        confirmButton={{
          text: "Déconnexion",
          onPress: () => {
            authService.signout()
              .catch((error) => {
                console.error("Erreur lors de la déconnexion :", error);
                showErrorMessage("Erreur de déconnexion", "Une erreur est survenue lors de la déconnexion.");
              });
            setShowLogoutModal(false);
          }
        }}
        cancelButton={{
          text: "Annuler",
          onPress: () => setShowLogoutModal(false)
        }} />

      <AppModal
        visible={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Supprimer le compte"
        message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
        type="error"
        confirmButton={{
          text: "Supprimer",
          onPress: deleteUser
        }}
        cancelButton={{
          text: "Annuler",
          onPress: () => setShowDeleteConfirmModal(false)
        }}
      />
      </SafeAreaView>
    </ScrollView>
    
  );
}

const screenWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    minHeight: Dimensions.get('window').height,
  },
  container: {
    width: screenWidth ,
    alignSelf: "center",
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    margin: 0,
    overflow: "hidden",
    flex: 1,
  },
  header: {
    backgroundColor: "#4a90e2",
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4a90e2",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    flexWrap: "wrap",
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    marginRight: 5,
  },
  infoLink: {
    fontSize: 13,
    color: "#4a90e2",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  buttonSection: {
    marginTop: 15,
  },
  deleteAccountButton: {
    alignSelf: "center",
    paddingVertical: 10,
    marginBottom: 20,
  },
  deleteAccountText: {
    color: "#e74c3c",
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
});