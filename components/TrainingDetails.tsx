import { trainingService } from '@/services/training.service';
import { exerciseService } from '@/services/exercise.service'; // Ajout du service exercice
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Modal } from 'react-native';
import { Training } from '@/models/training.model';
import { Exercise } from '@/models/exercise.model'; // Ajout du modèle exercice
import AppModal from './AppModal';
import { useUserContext } from './contexts/UserContext';
import CustomDatePicker from './CustomDatePicker';
import '@/global.css';

  /**
   * Composant pour afficher les détails d'un entraînement
   * @param trainingId ID de l'entraînement à afficher
   * @param visible Indique si le modal est visible
   * @param onClose Fonction de rappel pour fermer le modal
   * @param onUpdate Fonction de rappel pour mettre à jour l'entraînement
   */

  interface TrainingDetailsProps {
    trainingId: number;
    visible: boolean;
    onClose: () => void;
    onUpdate?: (updatedTraining: Training) => void;
  }
  
  export default function TrainingDetails({ 
    trainingId, 
    visible, 
    onClose,
    onUpdate
  }: TrainingDetailsProps) {
    const [training, setTraining] = useState<Training | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedDate, setEditedDate] = useState<Date>(new Date());
    const [editedDuration, setEditedDuration] = useState(0);
    const [editedExercises, setEditedExercises] = useState<Exercise[]>([]); // Nouveaux états pour les exercices
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser } = useUserContext();
    const [modal, setModal] = useState({
      visible: false,
      title: "",
      message: "",
      type: "info" as "info" | "success" | "error"
    });

    // États pour le sélecteur d'exercices
    const [isExercisePickerVisible, setIsExercisePickerVisible] = useState(false);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  
    useEffect(() => {
      if (visible && trainingId) {
        fetchTraining();
        if (isEditing) {
          fetchAvailableExercises();
        }
      }
    }, [trainingId, visible, isEditing]);

    const fetchAvailableExercises = async () => {
      if (!currentUser) return;
      
      try {
        const exercises = await exerciseService.findAllByUserId(currentUser!.id!);
        setAvailableExercises(exercises);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        showModal('error', 'Erreur', 'Impossible de charger les exercices disponibles.');
      }
    };
  
    const fetchTraining = async () => {
      if (!trainingId) {
        setError('Training ID is required');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await trainingService.findById(trainingId);
        setTraining(response);
        // Initialiser les états d'édition avec les valeurs actuelles
        setEditedName(response.name);
        // S'assurer que la date est un objet Date
        setEditedDate(response.date instanceof Date ? response.date : new Date(response.date));
        setEditedDuration(response.totalMinutesOfTraining || 0);
        setEditedExercises([...response.exercises]); // Copier les exercices
        setSelectedExercises([...response.exercises]); // Initialiser la sélection
      } catch (error) {
        console.error('Error fetching training:', error);
        setError('Impossible de charger les détails de l\'entraînement.');
      } finally {
        setLoading(false);
      }
    };
  
    const toggleEditMode = () => {
      if (!isEditing) {
        // Entrer en mode édition - récupérer les exercices disponibles
        fetchAvailableExercises();
      }
      setIsEditing(!isEditing);
    };

    const openExercisePicker = () => {
      setIsExercisePickerVisible(true);
    };

    const closeExercisePicker = () => {
      setIsExercisePickerVisible(false);
      // Mettre à jour les exercices édités avec la sélection
      setEditedExercises([...selectedExercises]);
      // Rafraîchir la liste des exercices disponibles
      fetchAvailableExercises();
    };

    const toggleExerciseSelection = (exercise: Exercise) => {
      setSelectedExercises(prev => {
        const isSelected = prev.some(ex => ex.id === exercise.id);
        if (isSelected) {
          return prev.filter(ex => ex.id !== exercise.id);
        } else {
          return [...prev, exercise];
        }
      });
    };

    const removeExercise = (exerciseId: number | undefined) => {
      if (!exerciseId) return;
      setEditedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
      setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    };
  
    const saveChanges = async () => {
      if (!training) return;
      
      try {
        const updatedTraining: Training = {
          ...training,
          name: editedName,
          date: editedDate,
          totalMinutesOfTraining: editedDuration,
          exercises: editedExercises,
          numberOfExercise: editedExercises.length,
          totalMinutesOfRest: editedExercises.reduce((total, ex) => total + (ex.restTimeInMinutes || 0), 0)
        };
        
        if (!currentUser) {
          showModal('error', 'Erreur', 'Utilisateur non connecté.');
          return;
        }
        await trainingService.update(currentUser!.id!, updatedTraining);
        setTraining(updatedTraining);
        setIsEditing(false);
        
        showModal('success', 'Succès', 'Entraînement mis à jour avec succès!');
        
        // Informer le composant parent de la mise à jour
        if (onUpdate) {
          onUpdate(updatedTraining);
        }
      } catch (error) {
        console.error('Error updating training:', error);
        showModal('error', 'Erreur', 'Une erreur est survenue lors de la mise à jour.');
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
  
    const formatDate = (date: Date) => {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'Date invalide';
      }
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('fr-FR', options);
    };
  
    // Formatter la date pour l'affichage dans le TextInput
    const formatDateForInput = (date: Date) => {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return '';
      }
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
  
    // Fonction pour analyser la date depuis l'input
    const parseDateFromInput = (dateString: string): Date => {
      const dateParts = dateString.split('-');
      if (dateParts.length !== 3) return new Date();
      
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;  // Les mois en JS sont 0-indexés
      const day = parseInt(dateParts[2], 10);
      
      const parsedDate = new Date(year, month, day);
      return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    };
  
    if (!visible) return null;
  
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.container}>
            {loading ? (
              <Text style={styles.loadingText}>Chargement...</Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : training ? (
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>
                    {isEditing ? 'Modifier l\'entraînement' : 'Détails de l\'entraînement'}
                  </Text>
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
  
                {isEditing ? (
                  // Mode édition
                  <View style={styles.editForm}>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Nom:</Text>
                      <TextInput
                        style={styles.input}
                        value={editedName}
                        onChangeText={setEditedName}
                      />
                    </View>
  
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Date:</Text>
                      <CustomDatePicker
                        value={editedDate}
                        onChange={setEditedDate}
                        format="yyyy-MM-dd"
                        minDate={new Date(2000, 0, 1)}
                        maxDate={new Date(2100, 11, 31)}
                        style={styles.datePicker}
                      />
                    </View>
  
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Durée totale (minutes):</Text>
                      <TextInput
                        style={styles.input}
                        value={String(editedDuration)}
                        onChangeText={(text) => setEditedDuration(Number(text) || 0)}
                        keyboardType="numeric"
                      />
                    </View>

                    {/* Section exercices en mode édition */}
                    <View style={styles.formGroup}>
                      <View style={styles.exerciseHeader}>
                        <Text style={styles.label}>Exercices ({editedExercises.length}):</Text>
                        <TouchableOpacity 
                          style={styles.addExerciseButton}
                          onPress={openExercisePicker}
                        >
                          <Text style={styles.addExerciseButtonText}>+ Modifier</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <FlatList
                        data={editedExercises}
                        keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
                        renderItem={({ item }) => (
                          <View style={styles.editExerciseItem}>
                            <View style={styles.exerciseContent}>
                              <Text style={styles.exerciseName}>{item.name}</Text>
                              <Text style={styles.exerciseDetails}>
                                {item.set} séries • {item.rep} répétitions • {item.restTimeInMinutes} min repos
                              </Text>
                            </View>
                            <TouchableOpacity 
                              style={styles.removeExerciseButton}
                              onPress={() => removeExercise(item.id ?? undefined)}
                            >
                              <Text style={styles.removeExerciseButtonText}>×</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        style={styles.editExerciseList}
                        nestedScrollEnabled={true}
                      />
                    </View>
                  </View>
                ) : (
                  // Mode visualisation
                  <View style={styles.detailsContainer}>
                    <Text style={styles.trainingName}>{training.name}</Text>
                    <Text style={styles.date}>Date: {formatDate(training.date)}</Text>
                    <View style={styles.statsContainer}>
                      <View style={styles.stat}>
                        <Text style={styles.statValue}>{training.totalMinutesOfTraining}</Text>
                        <Text style={styles.statLabel}>minutes</Text>
                      </View>
                      <View style={styles.stat}>
                        <Text style={styles.statValue}>{training.numberOfExercise}</Text>
                        <Text style={styles.statLabel}>exercices</Text>
                      </View>
                      <View style={styles.stat}>
                        <Text style={styles.statValue}>{training.totalMinutesOfRest}</Text>
                        <Text style={styles.statLabel}>min repos</Text>
                      </View>
                    </View>
                  </View>
                )}

                {!isEditing && (
                  <>
                    <Text style={styles.sectionTitle}>Exercices:</Text>
                    <FlatList
                      data={training.exercises}
                      keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
                      renderItem={({ item }) => (
                        <View style={styles.exerciseItem}>
                          <Text style={styles.exerciseName}>{item.name}</Text>
                          <Text style={styles.exerciseDetails}>
                            {item.set} séries • {item.rep} répétitions • {item.restTimeInMinutes} min repos
                          </Text>
                        </View>
                      )}
                      style={styles.exerciseList}
                    />
                  </>
                )}
  
                <View style={styles.buttonContainer}>
                  {isEditing ? (
                    <>
                      <TouchableOpacity style={styles.cancelButton} onPress={toggleEditMode}>
                        <Text style={styles.buttonText}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
                        <Text style={styles.buttonText}>Enregistrer</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity style={styles.editButton} onPress={toggleEditMode}>
                      <Text style={styles.buttonText}>Modifier</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            ) : (
              <Text style={styles.errorText}>Aucune donnée trouvée</Text>
            )}
          </View>
        </View>

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
              
              {availableExercises.length === 0 ? (
                <Text style={styles.noExercisesAvailable}>
                  Aucun exercice disponible. Veuillez d'abord créer des exercices.
                </Text>
              ) : (
                <FlatList
                  data={availableExercises}
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
  
        <AppModal
          visible={modal.visible}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onClose={() => setModal(prev => ({ ...prev, visible: false }))}
        />
      </Modal>
    );
  }

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    padding: 5
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666'
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 20
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#e74c3c',
    marginVertical: 20
  },
  detailsContainer: {
    marginBottom: 20
  },
  trainingName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5
  },
  date: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10
  },
  stat: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db'
  },
  statLabel: {
    fontSize: 14,
    color: '#95a5a6'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#34495e'
  },
  exerciseList: {
    maxHeight: 200
  },
  exerciseItem: {
    backgroundColor: '#f5f6fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50'
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginLeft: 10
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginRight: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  editForm: {
    marginBottom: 20
  },
  formGroup: {
    marginBottom: 15
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#34495e'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    height: 40,
    backgroundColor: '#f8f9fa'
  },
  dateHelperText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5
  },
  datePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  // Styles pour la gestion des exercices en mode édition
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  addExerciseButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6
  },
  addExerciseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  editExerciseList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 5
  },
  editExerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 5
  },
  exerciseContent: {
    flex: 1
  },
  removeExerciseButton: {
    backgroundColor: '#e74c3c',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  removeExerciseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  // Styles pour le modal de sélection d'exercices
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  exercisePickerModal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '70%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  noExercisesAvailable: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 16,
    marginVertical: 20
  },
  exercisePickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa'
  },
  exercisePickerItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#3498db',
    borderWidth: 1
  },
  exercisePickerItemContent: {
    flex: 1
  },
  exercisePickerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50'
  },
  exercisePickerDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 3
  },
  checkboxContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  confirmSelectionButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 15
  },
  confirmSelectionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});