import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { exerciseService } from "@/services/exercise.service";
import { Exercise } from "@/models/exercise.model";
import AppModal from "@/components/AppModal"; 
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserContext } from "./contexts/UserContext";
import { router } from "expo-router";

export default function ExerciseContent({ path }: { path: string }) {
  const [name, setName] = useState("");
  const [setCount, setSetCount] = useState("");
  const [repCount, setRepCount] = useState("");
  const [restTime, setRestTime] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateSectionVisible, setIsCreateSectionVisible] = useState(false); // Fermé par défaut
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { currentUser, isLoading: userLoading } = useUserContext();
  
  // État pour les modals
  const [modal, setModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "info" | "success" | "error"
  });
  
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    exerciseId: null as number | null
  });
  
  const animatedHeight = useRef(new Animated.Value(0)).current; // Commencer fermé
  const arrowRotation = useRef(new Animated.Value(0)).current; // Commencer fermé

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await exerciseService.findAllByUserId(currentUser!.id);
      if (!data || data.length === 0) {
        setExercises([]);
        setError("Aucun exercice disponible.");
      } else {
        setExercises(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des exercices :", error);
      setError("Impossible de récupérer les exercices. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (type: 'error' | 'success' | 'info', title: string, message: string) => {
    setModal({
      visible: true,
      title,
      message,
      type
    });
  };

  const showConfirmModal = (exerciseId: number) => {
    setConfirmModal({
      visible: true,
      exerciseId
    });
    closeMenu();
  };

  const createExercise = async () => {
    if (!name || !setCount || !repCount || !restTime) {
      showModal('error', 'Erreur', 'Tous les champs doivent être remplis !');
      return;
    }
    if (!currentUser || !currentUser.id) {
      showModal('error', 'Erreur', 'Utilisateur non identifié.');
      return;
    }

    try {
      const newExercise: Exercise = {
        id: null,
        name,
        set: parseInt(setCount),
        rep: parseInt(repCount),
        restTimeInMinutes: parseInt(restTime),
        userId: currentUser.id
      };
      
      await exerciseService.create(newExercise);
      
      // Réinitialiser les champs
      setName("");
      setSetCount("");
      setRepCount("");
      setRestTime("");
      
      await fetchExercises();
      
      setIsCreateSectionVisible(false);
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 300,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }).start();
      Animated.timing(arrowRotation, {
        toValue: 0,
        duration: 300,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }).start();
      
      // Afficher le message de succès à la fin
      showModal('success', 'Succès', 'Exercice créé avec succès !');
      
    } catch (error) {
      console.error("Erreur lors de la création de l'exercice :", error);
      showModal('error', 'Erreur', 'Une erreur est survenue lors de la création de l\'exercice.');
    }
  };

  const deleteExercise = async (id: number) => {
    try {
      await exerciseService.delete(id);
      showModal('success', 'Succès', 'Exercice supprimé avec succès!');
      fetchExercises();
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'exercice :", error);
      
      if (error.response?.status === 409) {
        showModal('error', 'Suppression impossible', 
          'Cet exercice ne peut pas être supprimé car il est utilisé dans des entraînements. Veuillez d\'abord le retirer de vos entraînements.');
      } else if (error.response?.status === 404) {
        showModal('error', 'Exercice introuvable', 
          'L\'exercice que vous tentez de supprimer n\'existe pas.');
      } else {
        showModal('error', 'Erreur', 
          'Une erreur est survenue lors de la suppression de l\'exercice.');
      }
    }
  };

  const editExercise = (exerciseId: number) => {
    showModal('info', 'Information', 'Fonctionnalité de modification à venir.');
    closeMenu();
  };

  const toggleCreateSection = () => {
    const newVisibility = !isCreateSectionVisible;
    setIsCreateSectionVisible(newVisibility);
    
    Animated.timing(animatedHeight, {
      toValue: newVisibility ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
    
    Animated.timing(arrowRotation, {
      toValue: newVisibility ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  };

  const rotateArrow = arrowRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const maxHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 370],
  });

  const openMenu = (exerciseId: number) => {
    setSelectedExerciseId(exerciseId);
    setIsMenuVisible(true);
  };

  const closeMenu = () => {
    setIsMenuVisible(false);
    setSelectedExerciseId(null);
  };

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    fetchExercises();
  }, [currentUser]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          {/* Titre de la liste avec bouton déroulant intégré */}
          <View style={styles.titleContainer}>
            <View style={styles.titleWithButton}>
              <View style={styles.titleSection}>
                <Text style={styles.sectionTitle}>Liste des exercices</Text>
                <View style={styles.titleUnderline} />
              </View>
              
              {/* Bouton déroulant pour créer un exercice */}
              <TouchableOpacity
                style={styles.createToggleButton}
                onPress={toggleCreateSection}
                activeOpacity={0.7}
              >
                <Text style={styles.createToggleText}>+ Créer</Text>
                <Animated.View style={{ transform: [{ rotate: rotateArrow }] }}>
                  <Text style={styles.toggleIcon}>▼</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Formulaire animé dans le container titre */}
            <Animated.View 
              style={[
                styles.createSectionContainer,
                { height: maxHeight, overflow: 'hidden', opacity: animatedHeight }
              ]}
            >
              <View style={styles.formInnerContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Nom de l'exercice"
                  value={name}
                  onChangeText={setName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de séries"
                  value={setCount}
                  keyboardType="numeric"
                  onChangeText={setSetCount}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de répétitions"
                  value={repCount}
                  keyboardType="numeric"
                  onChangeText={setRepCount}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Temps de repos (en minutes)"
                  value={restTime}
                  keyboardType="numeric"
                  onChangeText={setRestTime}
                />
                <TouchableOpacity style={styles.createButton} onPress={createExercise}>
                  <Text style={styles.createButtonText}>Créer l'exercice</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>

          {/* Messages de statut */}
          {loading && <Text style={styles.statusText}>Chargement des exercices...</Text>}
          {error && <Text style={styles.error}>{error}</Text>}
          {!loading && !error && exercises.length === 0 && (
            <Text style={styles.statusText}>Aucun exercice disponible.</Text>
          )}

          {/* Liste des exercices */}
          <FlatList
            data={exercises}
            keyExtractor={(item, index) => (item.id ? item.id.toString() : `fallback-${index}`)}
            renderItem={({ item }) => (
              <View style={styles.exerciseItem}>
                <View style={styles.exerciseContent}>
                  <View style={styles.imageContainer}>
                    <Text style={styles.imagePlaceholder}>IMG</Text>
                  </View>
                  
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <View style={styles.exerciseDetails}>
                      <Text style={styles.exerciseText}>{item.set} séries</Text>
                      <Text style={styles.exerciseText}>{item.rep} répétitions</Text>
                      <Text style={styles.exerciseText}>{item.restTimeInMinutes} min de repos</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.menuButton}
                    onPress={() => openMenu(item.id!)}
                  >
                    <Text style={styles.menuDots}>⋮</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
          />

          {/* Menu contextuel */}
          <Modal
            visible={isMenuVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeMenu}
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={closeMenu}
            >
              <View style={styles.contextMenu}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    if (selectedExerciseId) editExercise(selectedExerciseId);
                  }}
                >
                  <Text style={styles.menuItemIcon}>✏️</Text>
                  <Text style={styles.menuItemText}>Modifier</Text>
                </TouchableOpacity>
                
                <View style={styles.menuDivider} />
                
                <TouchableOpacity 
                  style={[styles.menuItem, styles.deleteMenuItem]}
                  onPress={() => {
                    if (selectedExerciseId) {
                      showConfirmModal(selectedExerciseId);
                    } 
                  }}
                >
                  <Text style={styles.menuItemIcon}>🗑️</Text>
                  <Text style={styles.menuItemText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Modals */}
          <AppModal
            visible={modal.visible}
            title={modal.title}
            message={modal.message}
            type={modal.type}
            onClose={() => setModal(prev => ({ ...prev, visible: false }))}
          />

          <AppModal
            visible={confirmModal.visible}
            title="Confirmation"
            message="Êtes-vous sûr de vouloir supprimer cet exercice ?"
            type="error"
            onClose={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
            confirmButton={{
              text: "Supprimer",
              onPress: () => {
                if (confirmModal.exerciseId !== null) {
                  deleteExercise(confirmModal.exerciseId);
                  setConfirmModal({ visible: false, exerciseId: null });
                }
              }
            }}
            cancelButton={{
              text: "Annuler",
              onPress: () => setConfirmModal({ visible: false, exerciseId: null })
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const screenWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    alignSelf: "center",
    backgroundColor: "#f5f5f5",
    elevation: 4,
    margin: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#4a90e2",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    marginHorizontal: 16, // Ajout de marges horizontales
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  toggleIcon: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  createSectionContainer: {
    backgroundColor: "#2971cc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  formInnerContainer: {
    padding: 16,
  },
  titleContainer: {
    width: "100%",
    backgroundColor: "black",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 0,
  },
  titleWithButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  titleSection: {
    flex: 1,
    alignItems: "center",
  },
  createToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  createToggleText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    padding: 14,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    color: "#333",
  },
  createButton: {
    backgroundColor: "#fff",
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
  createButtonText: {
    color: "#2971cc",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 4,
    flexGrow: 1, // Permet à la liste de s'étendre
  },
  exerciseItem: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#4a90e2",
    overflow: "hidden",
  },
  exerciseContent: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    paddingHorizontal: 10,
    margin: 8,
  },
  exerciseInfo: {
    flex: 1,
    padding: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  exerciseDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  exerciseText: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 16,
  },
  imagePlaceholder: {
    fontSize: 16,
    color: "#999",
    fontWeight: "bold",
  },
  menuButton: {
    padding: 12,
    position: "absolute",
    top: 0,
    right: 0,
  },
  menuDots: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#666",
  },
  error: {
    color: "#e74c3c",
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  statusText: {
    textAlign: "center",
    color: "#777",
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  contextMenu: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  menuItemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  deleteMenuItem: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#eee",
  },
});