import React, { useEffect, useRef, useState } from 'react';
import { 
  ActivityIndicator, 
  Animated, 
  Dimensions, 
  Easing, 
  FlatList, 
  Modal, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Text, View } from './Themed';
import { Exercise } from '@/models/exercise.model';
import { Training } from '@/models/training.model';
import { trainingService } from '@/services/training.service';
import AppModal from './AppModal';
import { exerciseService } from '@/services/exercise.service';
import { useUserContext } from './contexts/UserContext';
import TrainingDetails from './TrainingDetails';
import CustomDatePicker from './CustomDatePicker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function TrainingContent({ path }: { path: string }) {
  const [trainingName, setTrainingName] = useState("");
  const [trainingDate, setTrainingDate] = useState(new Date());
  const [trainingDuration, setTrainingDuration] = useState(0);
  const [numberOfExercise, setNumberOfExercise] = useState(0);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateSectionVisible, setIsCreateSectionVisible] = useState(false); // Fermé par défaut
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isExercisePickerVisible, setIsExercisePickerVisible] = useState(false);
  const { currentUser, isLoading } = useUserContext();
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const insets = useSafeAreaInsets();

  // État pour les modals
  const [modal, setModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "info" | "success" | "error"
  });
  
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    trainingId: null as number | null
  });
  
  const animatedHeight = useRef(new Animated.Value(0)).current; // Fermé par défaut
  const arrowRotation = useRef(new Animated.Value(0)).current; // Fermé par défaut

  const fetchTrainings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainingService.findAllByUser(currentUser!.id);
      if (!data || data.length === 0) {
        setTrainings([]);
        setError("Aucun entraînement disponible.");
      } else {
        setTrainings(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des entraînements :", error);
      setError("Impossible de récupérer les entraînements. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const data = await exerciseService.findAll();
      setExercises(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des exercices :", error);
      showModal('error', 'Erreur', 'Impossible de charger les exercices.');
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

  const showConfirmModal = (trainingId: number) => {
    setConfirmModal({
      visible: true,
      trainingId
    });
    closeMenu();
  };

  // Calculer les statistiques d'entraînement
  const calculateTrainingStats = (exercises: Exercise[]) => {
    const numberOfExercise = exercises.length;
    let totalMinutesOfRest = 0;
    let totalMinutesOfTraining = 0;
    
    exercises.forEach(exercise => {
      if (exercise.restTimeInMinutes && exercise.set) {
        totalMinutesOfRest += exercise.restTimeInMinutes * (exercise.set - 1);
      }
    });
    
    if(trainingDuration == null && trainingDuration <= 0) {
      let totalMinutesOfExecution = 0;
      exercises.forEach(exercise => {
        if (exercise.set) {
          totalMinutesOfExecution += exercise.set;
        }
      });
      totalMinutesOfTraining = totalMinutesOfExecution + totalMinutesOfRest;
    } else {
      totalMinutesOfTraining = trainingDuration;
    }
    
    return {
      numberOfExercise,
      totalMinutesOfRest,
      totalMinutesOfTraining
    };
  };

  const createTraining = async () => {
    if (!trainingName) {
      showModal('error', 'Erreur', 'Le nom de l\'entraînement est requis !');
      return;
    }

    if (selectedExercises.length === 0) {
      showModal('error', 'Erreur', 'Veuillez sélectionner au moins un exercice !');
      return;
    }

    try {
      const stats = calculateTrainingStats(selectedExercises);
      
      const newTraining: Training = {
        id: null,
        name: trainingName,
        date: trainingDate,
        numberOfExercise: stats.numberOfExercise,
        totalMinutesOfRest: stats.totalMinutesOfRest,
        totalMinutesOfTraining: stats.totalMinutesOfTraining,
        trainingUser: currentUser!.id,
        exercises: selectedExercises,
      };
      
      await trainingService.create(newTraining);
      showModal('success', 'Succès', 'Entraînement créé avec succès !');
      setTrainingName("");
      setTrainingDate(new Date());
      setSelectedExercises([]);
      
      // Fermer le formulaire après création
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
      
      fetchTrainings();
    } catch (error) {
      console.error("Erreur lors de la création de l'entraînement :", error);
      showModal('error', 'Erreur', 'Une erreur est survenue lors de la création de l\'entraînement.');
    }
  };

  const deleteTraining = async (id: number) => {
    try {
      await trainingService.delete(id);
      showModal('success', 'Succès', 'Entraînement supprimé avec succès!');
      fetchTrainings();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'entraînement :", error);
      showModal('error', 'Erreur', 'Une erreur est survenue lors de la suppression de l\'entraînement.');
    }
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
    outputRange: [0, 458],
  });

  const openMenu = (trainingId: number) => {
    setSelectedTrainingId(trainingId);
    setIsMenuVisible(true);
  };

  const closeMenu = () => {
    setIsMenuVisible(false);
  };

  const openExercisePicker = () => {
    setIsExercisePickerVisible(true);
  };

  const closeExercisePicker = () => {
    setIsExercisePickerVisible(false);
  };

  const toggleExerciseSelection = (exercise: Exercise) => {
    const isSelected = selectedExercises.some(ex => ex.id === exercise.id);
  
    let updatedExercises;
    if (isSelected) {
      updatedExercises = selectedExercises.filter(ex => ex.id !== exercise.id);
    } else {
      updatedExercises = [...selectedExercises, exercise];
    }
  
    setSelectedExercises(updatedExercises);
    setNumberOfExercise(updatedExercises.length);
  };

  const removeSelectedExercise = (exerciseId: number) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.id !== exerciseId));
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const loadData = () => {
    if (currentUser && currentUser.id) {
      fetchTrainings();
      fetchExercises();
    }
  };

  useEffect(() => {
    setNumberOfExercise(selectedExercises.length);
  }, [selectedExercises]);

  useEffect(() => {
    if (!isLoading && currentUser && currentUser.id) {
      fetchTrainings();
      fetchExercises();
    } else if (!isLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Chargement...</Text>
      </View>
    );
  }

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
                <Text style={styles.sectionTitle}>Entraînements</Text>
                <View style={styles.titleUnderline} />
              </View>
              
              {/* Bouton déroulant pour créer un entraînement */}
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
                  placeholder="Nom de l'entraînement"
                  value={trainingName}
                  onChangeText={setTrainingName}
                />

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Date : </Text>
                  <CustomDatePicker
                    value={trainingDate}
                    onChange={setTrainingDate}
                    format="dd/MM/yyyy"
                    minDate={new Date(1990, 0, 1)}
                    maxDate={new Date(2026, 11, 31)}
                    style={styles.datePicker}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Durée totale (minutes) :</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Durée de l'entraînement"
                    keyboardType="numeric"
                    value={trainingDuration ? String(trainingDuration) : ""}
                    onChangeText={text => setTrainingDuration(Number(text))}
                  />
                </View>

                <View style={styles.formNumberOFExercise}>
                  <Text style={styles.label}>Nombre d'exercices: {numberOfExercise}</Text>
                </View>
                
                <View style={styles.selectedExercisesContainer}>
                  <FlatList
                    data={selectedExercises}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={({ item }) => (
                      <View style={styles.selectedExerciseTag}>
                        <Text style={styles.selectedExerciseText}>{item.name}</Text>
                        <TouchableOpacity 
                          onPress={() => removeSelectedExercise(item.id!)}
                          style={styles.removeExerciseButton}
                        >
                          <Text style={styles.removeExerciseText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    ListEmptyComponent={
                      <Text style={styles.noExercisesText}>Aucun exercice sélectionné</Text>
                    }
                  />
                </View>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.addExerciseButton} 
                    onPress={openExercisePicker}
                  >
                    <Text style={styles.addExerciseButtonText}>Ajouter des exercices</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.createButton} 
                    onPress={createTraining}
                  >
                    <Text style={styles.createButtonText}>Créer l'entraînement</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* Messages de statut */}
          {loading && <Text style={styles.statusText}>Chargement des entraînements...</Text>}
          {error && <Text style={styles.statusText}>{error}</Text>}
          {!loading && !error && trainings.length === 0 && (
            <Text style={styles.statusText}>Aucun entraînement disponible.</Text>
          )}

          {/* Liste des entraînements */}
          <FlatList
            data={trainings}
            keyExtractor={(item, index) => (item.id ? item.id.toString() : `fallback-${index}`)}
            renderItem={({ item }) => (
              <View style={styles.trainingItem}>
                <View style={styles.trainingContent}>
                  <View style={styles.trainingInfo}>
                    <Text style={styles.trainingName}>{item.name}</Text>
                    <Text style={styles.trainingDate}>{formatDate(item.date.toString())}</Text>
                    <View style={styles.trainingStats}>
                      <Text style={styles.exerciseCount}>
                        {item.numberOfExercise ?? 0} {(item.numberOfExercise ?? 0) > 1 ? 'exercices' : 'exercice'}
                      </Text>
                      <Text style={styles.trainingDuration}>
                        {item.totalMinutesOfTraining} min (dont {item.totalMinutesOfRest} min de repos)
                      </Text>
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

          {/* Modal pour sélectionner des exercices */}
          <Modal
            visible={isExercisePickerVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={closeExercisePicker}
          >
            <View style={styles.modalContainer}>
              <View style={styles.exercisePickerModal}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Sélectionnez des exercices</Text>
                  <TouchableOpacity onPress={closeExercisePicker}>
                    <Text style={styles.closeButton}>×</Text>
                  </TouchableOpacity>
                </View>
                
                {exercises.length === 0 ? (
                  <Text style={styles.noExercisesAvailable}>
                    Aucun exercice disponible. Veuillez d'abord créer des exercices.
                  </Text>
                ) : (
                  <FlatList
                    data={exercises}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={({ item }) => {
                      const isSelected = selectedExercises.some(ex => ex.id === item.id);
                      
                      return (
                        <TouchableOpacity
                          style={[
                            styles.exercisePickerItem,
                            isSelected && styles.exercisePickerItemSelected
                          ]}
                          onPress={() => toggleExerciseSelection(item)}
                        >
                          <View style={styles.exercisePickerItemContent}>
                            <Text style={styles.exercisePickerName}>{item.name}</Text>
                            <Text style={styles.exercisePickerDetails}>
                              {item.set} séries • {item.rep} répétitions • {item.restTimeInMinutes} min repos
                            </Text>
                          </View>
                          
                          <View style={styles.checkboxContainer}>
                            {isSelected && (
                              <View style={styles.checkbox}>
                                <Text style={styles.checkmark}>✓</Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
                
                <TouchableOpacity 
                  style={styles.confirmSelectionButton}
                  onPress={closeExercisePicker}
                >
                  <Text style={styles.confirmSelectionText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

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
                    if (selectedTrainingId) {
                      setIsDetailsVisible(true);
                      setIsMenuVisible(false); 
                    }
                  }}
                >
                  <Text style={styles.menuItemIcon}>👁️</Text>
                  <Text style={styles.menuItemText}>Détails / Modifier</Text>
                </TouchableOpacity>
                
                <View style={styles.menuDivider} />
                
                <TouchableOpacity 
                  style={[styles.menuItem, styles.deleteMenuItem]}
                  onPress={() => {
                    if (selectedTrainingId) {
                      showConfirmModal(selectedTrainingId);
                    } 
                  }}
                >
                  <Text style={styles.menuItemIcon}>🗑️</Text>
                  <Text style={styles.menuItemText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Détails de l'entraînement */}
          {selectedTrainingId && (
            <TrainingDetails
              trainingId={selectedTrainingId}
              visible={isDetailsVisible}
              onClose={() => {
                setIsDetailsVisible(false);
                loadData();
              }}
              onUpdate={(updatedTraining) => {
                loadData();
              }}
            />
          )}

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
            message="Êtes-vous sûr de vouloir supprimer cet entraînement ?"
            type="error"
            onClose={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
            confirmButton={{
              text: "Supprimer",
              onPress: () => {
                if (confirmModal.trainingId !== null) {
                  deleteTraining(confirmModal.trainingId);
                  setConfirmModal({ visible: false, trainingId: null });
                }
              }
            }}
            cancelButton={{
              text: "Annuler",
              onPress: () => setConfirmModal({ visible: false, trainingId: null })
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const screenWidth = Dimensions.get("window").width;

const colors = {
  primary: '#4a90e2',
  primaryDark: '#2971cc',
  background: '#f5f5f5',
  white: '#ffffff',
  text: {
    dark: '#333',
    medium: '#666',
    light: '#6c757d',
  },
  border: '#e0e0e0',
  shadow: '#000',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  titleContainer: {
    width: "100%",
    backgroundColor: "black",
    shadowColor: colors.shadow,
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: colors.white,
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 8,
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
  toggleIcon: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "bold",
  },
  createSectionContainer: {
    backgroundColor: colors.primaryDark,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  formInnerContainer: {
    backgroundColor: colors.primaryDark,
    padding: 16,
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
  formGroup: {
    marginBottom: 15,
    backgroundColor: colors.primaryDark,
  },
  formNumberOFExercise: {
    backgroundColor: colors.primaryDark,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: colors.white,
    fontWeight: "500",
  },
  datePicker: {
    width: '100%',
    marginTop: 5,
    backgroundColor: colors.primaryDark,
  },
  selectedExercisesContainer: {
    marginVertical: 12,
    backgroundColor: colors.primaryDark,
  },
  selectedExerciseTag: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedExerciseText: {
    fontSize: 14,
    color: colors.white,
    marginRight: 6,
    fontWeight: "500",
  },
  removeExerciseButton: {
    width: 20,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeExerciseText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  noExercisesText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontStyle: 'italic',
    backgroundColor: colors.primaryDark,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: colors.primaryDark,
  },
  addExerciseButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  addExerciseButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  createButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  createButtonText: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 4,
    flexGrow: 1,
  },
  trainingItem: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 10,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    overflow: "hidden",
  },
  trainingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
  },
  trainingInfo: {
    flex: 1,
    backgroundColor: colors.white,
  },
  trainingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.dark,
    marginBottom: 4,
  },
  trainingDate: {
    fontSize: 14,
    color: colors.text.medium,
    marginBottom: 4,
  },
  trainingStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.white,
  },
  exerciseCount: {
    fontSize: 14,
    color: colors.text.light,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  trainingDuration: {
    fontSize: 14,
    color: colors.text.light,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  menuButton: {
    padding: 12,
  },
  menuDots: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.medium,
  },
  statusText: {
    textAlign: 'center',
    color: colors.text.light,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  exercisePickerModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.dark,
  },
  closeButton: {
    fontSize: 28,
    color: colors.text.light,
  },
  exercisePickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  exercisePickerItemSelected: {
    backgroundColor: "rgba(74, 144, 226, 0.1)",
  },
  exercisePickerItemContent: {
    flex: 1,
    backgroundColor: colors.white,
  },
  exercisePickerName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.dark,
    marginBottom: 4,
    backgroundColor: colors.white,
  },
  exercisePickerDetails: {
    fontSize: 14,
    color: colors.text.light,
    backgroundColor: colors.white,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: colors.white,
  },
  checkbox: {
    width: 18,
    height: 18,
    backgroundColor: colors.primary,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  confirmSelectionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmSelectionText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  noExercisesAvailable: {
    textAlign: 'center',
    marginVertical: 20,
    color: colors.text.light,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  contextMenu: {
    width: 200,
    backgroundColor: colors.white,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: colors.shadow,
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
    color: colors.text.dark,
  },
  deleteMenuItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
});