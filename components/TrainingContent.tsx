import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, FlatList, Modal, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from './Themed';
import { Exercise } from '@/models/exercise.model';
import { Training } from '@/models/training.model';
import { trainingService } from '@/services/training.service';
import AppModal from './AppModal';
import { exerciseService } from '@/services/exercise.service';
import { useUserContext } from './contexts/UserContext';


export default function TrainingContent({ path }: { path: string }) {
  const [trainingName, setTrainingName] = useState("");
  const [trainingDate, setTrainingDate] = useState(new Date().toISOString().split('T')[0]);
  const [trainingDuration, setTrainingDuration] = useState("");
  const [numberOfExercise, setNumberOfExercise] = useState(0);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateSectionVisible, setIsCreateSectionVisible] = useState(true);
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isExercisePickerVisible, setIsExercisePickerVisible] = useState(false);
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
    trainingId: null as number | null
  });
  
  const animatedHeight = useRef(new Animated.Value(1)).current;
  const arrowRotation = useRef(new Animated.Value(1)).current;

  const fetchTrainings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainingService.findAllByUser(currentUser!.id);
       console.log("Données récupérées depuis l'API :", data);
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
    
    // Calculer le temps de repos total en minutes
    exercises.forEach(exercise => {
      // Supposons que chaque exercice a un temps de repos entre les séries
      if (exercise.restTimeInMinutes && exercise.set) {
        // Le temps de repos est appliqué (nombre de séries - 1) fois
        totalMinutesOfRest += exercise.restTimeInMinutes * (exercise.set - 1);
      }
    });
    
    // Estimer le temps total d'entraînement
    // Supposons une moyenne de 1 minute par série pour l'exécution
    let totalMinutesOfExecution = 0;
    exercises.forEach(exercise => {
      if (exercise.set) {
        totalMinutesOfExecution += exercise.set;
      }
    });
    
    const totalMinutesOfTraining = totalMinutesOfExecution + totalMinutesOfRest;
    
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

      console.log("Création de l'entraînement :", newTraining);
      
      await trainingService.create(newTraining);
      showModal('success', 'Succès', 'Entraînement créé avec succès !');
      setTrainingName("");
      setTrainingDate(new Date().toISOString().split('T')[0]);
      setSelectedExercises([]);
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

  const editTraining = (trainingId: number) => {
    // Implémentation future de la modification
    showModal('info', 'Information', 'Fonctionnalité de modification à venir.');
    closeMenu();
  };

  const viewTrainingDetails = (trainingId: number) => {
    // Implémentation de la vue détaillée d'un entraînement
    showModal('info', 'Information', 'Fonctionnalité de détails à venir.');
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
    outputRange: [0, 500], // Ajusté pour le contenu du formulaire d'entraînement (+ place pour le date picker)
  });

  const openMenu = (trainingId: number) => {
    setSelectedTrainingId(trainingId);
    setIsMenuVisible(true);
  };

  const closeMenu = () => {
    setIsMenuVisible(false);
    setSelectedTrainingId(null);
  };

  const openExercisePicker = () => {
    setIsExercisePickerVisible(true);
  };

  const closeExercisePicker = () => {
    setIsExercisePickerVisible(false);
  };

  const toggleExerciseSelection = (exercise: Exercise) => {
    const isSelected = selectedExercises.some(ex => ex.id === exercise.id);
    
    if (isSelected) {
      setSelectedExercises(selectedExercises.filter(ex => ex.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  const removeSelectedExercise = (exerciseId: number) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.id !== exerciseId));
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  useEffect(() => {
    fetchTrainings();
    fetchExercises();
  }, []);

  return (
    <View style={styles.container}>
      {/* Liste des entraînements */}
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>Liste des entraînements</Text>
        <View style={styles.titleUnderline} />
      </View>
      
      {loading && <Text style={styles.statusText}>Chargement des entraînements...</Text>}
      {error && <Text style={styles.statusText}>{error}</Text>}
      {!loading && !error && trainings.length === 0 && (
        <Text style={styles.statusText}>Aucun entraînement disponible.</Text>
      )}

      <FlatList
        data={trainings}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : `fallback-${index}`)}
        renderItem={({ item }) => (
          <View style={styles.trainingItem}>
            <View style={styles.trainingContent}>
              <View style={styles.trainingInfo}>
                <Text style={styles.trainingName}>{item.name}</Text>
                <Text style={styles.trainingDate}>{formatDate(item.date)}</Text>
                <View style={styles.trainingStats}>
                  <Text style={styles.exerciseCount}>
                    {item.numberOfExercise ?? 0} {(item.numberOfExercise ?? 0) > 1 ? 'exercices' : 'exercice'}
                  </Text>
                  <Text style={styles.trainingDuration}>
                    {item.totalMinutesOfTraining} min (dont {item.totalMinutesOfRest} min de repos)
                  </Text>
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
        <Text style={styles.sectionHeaderText}>Créer un entraînement</Text>
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
        <View style={styles.formInnerContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom de l'entraînement"
            value={trainingName}
            onChangeText={setTrainingName}
          />
          
          {/* Date Picker */}
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerLabel}>Date de l'entraînement:</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              value={trainingDate}
              onChangeText={setTrainingDate}
              keyboardType="numeric"
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Durée de l'entraînement (en minutes)"
            value={trainingDuration}
            onChangeText={setTrainingDuration}
          />

          <View>
            <Text style={styles.datePickerLabel}>Nombre d'exercise</Text>
            <Text style={styles.datePickerLabel}>{numberOfExercise}</Text>
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
                if (selectedTrainingId) viewTrainingDetails(selectedTrainingId);
              }}
            >
              <Text style={styles.menuItemIcon}>👁️</Text>
              <Text style={styles.menuItemText}>Voir détails</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                if (selectedTrainingId) editTraining(selectedTrainingId);
              }}
            >
              <Text style={styles.menuItemIcon}>✏️</Text>
              <Text style={styles.menuItemText}>Modifier</Text>
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
  );
}

const screenWidth = Dimensions.get("window").width;

const colors = {
  primary: '#4a90e2',
  primaryDark: '#2971cc',
  background: '#f8f9fa',
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
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryDark,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 0,
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
  trainingItem: {
    backgroundColor: colors.white,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  trainingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  trainingInfo: {
    flex: 1,
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
  },
  exerciseCount: {
    fontSize: 14,
    color: colors.text.light,
    marginRight: 10,
  },
  trainingDuration: {
    fontSize: 14,
    color: colors.text.light,
  },
  sectionHeader: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  toggleIcon: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "bold",
  },
  createSectionContainer: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginHorizontal: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formInnerContainer: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: colors.white,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  addExerciseButton: {
    flex: 1,
    backgroundColor: colors.text.light,
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  addExerciseButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  createButton: {
    flex: 1,
    backgroundColor: colors.primaryDark,
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
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedExercisesContainer: {
    marginVertical: 12,
  },
  selectedExerciseTag: {
    backgroundColor: colors.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedExerciseText: {
    fontSize: 14,
    color: colors.text.dark,
    marginRight: 6,
  },
  removeExerciseButton: {
    width: 20,
    height: 20,
    backgroundColor: colors.text.light,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeExerciseText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusText: {
    textAlign: 'center',
    marginVertical: 20,
    color: colors.text.light,
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
  },
  exercisePickerItemSelected: {
    backgroundColor: '#f0f0f0',
  },
  exercisePickerName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.dark,
    marginBottom: 4,
  },
  exercisePickerDetails: {
    fontSize: 14,
    color: colors.text.light,
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
  exercisePickerItemContent: {
    flex: 1,
  },
  noExercisesAvailable: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  text: {
    fontSize: 14,
    color: colors.text.medium,
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
  menuButton: {
    padding: 8,
  },
  menuDots: {
    fontSize: 24,
    color: colors.text.light,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  contextMenu: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: 200,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuItemIcon: {
    marginRight: 12,
    fontSize: 18,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text.dark,
  },
  deleteMenuItem: {
    backgroundColor: '#fff8f8',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  datePickerContainer: {
    marginBottom: 12,
  },
  datePickerLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: colors.text.medium,
  },
  dateInput: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noExercisesText: {
    color: colors.text.light,
    fontSize: 14,
    fontStyle: 'italic',
  },
});