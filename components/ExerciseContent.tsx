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
  Modal
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
  const [isCreateSectionVisible, setIsCreateSectionVisible] = useState(true);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { currentUser } = useUserContext();
  
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
  
  const animatedHeight = useRef(new Animated.Value(1)).current;
  const arrowRotation = useRef(new Animated.Value(1)).current;

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

    try {
      const newExercise: Exercise = {
        id: null,
        name,
        set: parseInt(setCount),
        rep: parseInt(repCount),
        restTimeInMinutes: parseInt(restTime),
      };
      await exerciseService.create(newExercise);
      showModal('success', 'Succès', 'Exercice créé avec succès !');
      setName("");
      setSetCount("");
      setRepCount("");
      setRestTime("");
      fetchExercises();
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
    } catch (error) {
      console.error("Erreur lors de la suppression de l'exercice :", error);
      showModal('error', 'Erreur', 'Une erreur est survenue lors de la suppression de l\'exercice.');
    }
  };

  const editExercise = (exerciseId: number) => {
    // Implémentation future de la modification
    showModal('info', 'Information', 'Fonctionnalité de modification à venir.');
    closeMenu();
  };

  // Toggle animation for the create section
  const toggleCreateSection = () => {
    const newVisibility = !isCreateSectionVisible;
    setIsCreateSectionVisible(newVisibility);
    
    // Animate the height
    Animated.timing(animatedHeight, {
      toValue: newVisibility ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
    
    // Animate the arrow rotation
    Animated.timing(arrowRotation, {
      toValue: newVisibility ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  };

  // Calculate rotation value for the arrow
  const rotateArrow = arrowRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Calculate the height of the animated container
  const maxHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 370], // Ajusté pour inclure le bouton
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
    <View style={styles.container}>
      {/* Liste des exercices */}
  <View style={styles.titleContainer}>
  <Text style={styles.sectionTitle}>Liste des exercices</Text>
  <View style={styles.titleUnderline} />
  </View>
      {loading && <Text style={styles.statusText}>Chargement des exercices...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && !error && exercises.length === 0 && (
        <Text style={styles.statusText}>Aucun exercice disponible.</Text>
      )}

      <FlatList
        data={exercises}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : `fallback-${index}`)}
        renderItem={({ item }) => (
          <View style={styles.exerciseItem}>
            {/* Image placeholder */}
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
              
              {/* Options menu button */}
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
      />

      {/* Section header with toggle button */}
      <TouchableOpacity
        style={[
          styles.sectionHeader,
          {
            borderBottomLeftRadius: isCreateSectionVisible ? 0 : 10,
            borderBottomRightRadius: isCreateSectionVisible ? 0 : 10,
          }
        ]}
        onPress={toggleCreateSection}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionHeaderText}>Créer un exercice</Text>
        <Animated.View style={{ transform: [{ rotate: rotateArrow }] }}>
          <Text style={styles.toggleIcon}>▲</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Animated container for the create section */}
      <Animated.View 
        style={[
          styles.createSectionContainer,
          { height: maxHeight, overflow: 'hidden', opacity: animatedHeight }
        ]}
      >
        {/* Contenu du formulaire dans une View imbriquée pour garantir l'affichage même à height 0 */}
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

      {/* Modals utilisant le composant AppModal */}
      <AppModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal(prev => ({ ...prev, visible: false }))}
      />

      {/* Modal de confirmation de suppression */}
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
    </SafeAreaView>
  );
}

const screenWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth ,
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
    marginTop: 10, // Supprimé l'espace entre le header et le contenu
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
    backgroundColor: "#4a90e2",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: 0, // Marge appliquée au conteneur extérieur plutôt qu'au header
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
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#2971cc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 0,
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
    borderColor: "#e0e0e0",
    padding: 14,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  createButton: {
    backgroundColor: "#2971cc", // Légèrement plus foncé que le fond pour se distinguer
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 4,
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