import { User } from "@/models/user.model";
import { UserService } from "@/services/user.service";
import { useContext, useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image
} from "react-native";
import CommunButton from "./CommunButton";
import { useUserContext } from "./contexts/UserContext";

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
  const [isSaving, setIsSaving] = useState(false);
  const userService = new UserService();
  const { currentUser } = useUserContext();
  

  // Fonction pour récupérer l'utilisateur
  const fetchUser = async () => {
     if (!currentUser || currentUser == null) {
      console.error("Aucun utilisateur connecté.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data: User = await userService.findById(currentUser.id);
    
      if (!data) {
        setUser(null);
        setError("Aucun utilisateur trouvé.");
      } else {
        console.log("Utilisateur récupéré :", data);
        setUser(data);
        setFirstname(data.firstname);
        setLastname(data.lastname);
        setPhone(data.phone);
        setEmail(data.email);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      setError("Impossible de récupérer l'utilisateur. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    } 
  };

  useEffect(() => {
  if (currentUser) {
    fetchUser();
  }
  }, [currentUser]); // 🔁 Déclenche fetchUser dès que currentUser est dispo


  // Fonction pour valider le formulaire
  const validateForm = () => {
    if (!firstname || !lastname || !email || !phone) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return false;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erreur", "Veuillez entrer une adresse email valide.");
      return false;
    }

    // Vérification si les mots de passe correspondent
    if ((password || confirmPassword) && password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return false;
    }

    // Vérification de la complexité du mot de passe si modifié
    if (password) {
      if (password.length < 8) {
        Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères.");
        return false;
      }
    }

    return true;
  };

  // Fonction pour mettre à jour l'utilisateur
  const updateUser = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser: User = {
        id: user?.id ?? null,
        firstname: firstname,
        lastname: lastname,
        phone: phone,
        email,
        password: password, // N'envoie le mot de passe que s'il est renseigné
      };
      await userService.update(user?.id!, updatedUser);
      Alert.alert(
        "Succès", 
        "Votre profil a été mis à jour avec succès !",
        [{ text: "OK" }]
      );
      setPassword("");
      setConfirmPassword("");
      fetchUser();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
      Alert.alert(
        "Erreur", 
        "Une erreur est survenue lors de la mise à jour du profil."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour confirmer la suppression de l'utilisateur
  const confirmDeleteUser = () => {
    Alert.alert(
      "Supprimer le compte",
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => deleteUser() }
      ]
    );
  };

  // Fonction pour supprimer l'utilisateur
  const deleteUser = async () => {
    if (!user) {
      return;
    }
    setIsSaving(true);
    try {
      await userService.delete(user.id!);
      Alert.alert(
        "Compte supprimé", 
        "Votre compte a été supprimé avec succès.",
        [{ text: "OK" }]
      );
      setUser(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
      Alert.alert(
        "Erreur", 
        "Une erreur est survenue lors de la suppression du compte."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Chargement de votre profil...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                  value={user.phone}
                  editable={false} // Rendre le champ non modifiable
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
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Sécurité</Text>
              <Text style={styles.infoText}>
                Laissez les champs vides si vous ne souhaitez pas modifier votre mot de passe
              </Text>

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
            </View>

            <View style={styles.buttonSection}>
              <CommunButton 
                label={isSaving ? "Enregistrement..." : "Enregistrer les modifications"} 
                onClick={updateUser}
                disabled={isSaving}
              />
            </View>

            <TouchableOpacity 
              style={styles.deleteAccountButton} 
              onPress={confirmDeleteUser}
              disabled={isSaving}
            >
              <Text style={styles.deleteAccountText}>Supprimer mon compte</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const screenWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    width: screenWidth * 0.95,
    alignSelf: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    margin: 10,
    overflow: "hidden",
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
  infoText: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 10,
  },
  buttonSection: {
    marginBottom: 20,
  },
  deleteAccountButton: {
    alignSelf: "center",
    paddingVertical: 10,
    marginBottom: 10,
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
