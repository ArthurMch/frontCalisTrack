import { trainingService } from '@/services/training.service';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Modal } from 'react-native';
import { Training } from '@/models/training.model';
import AppModal from './AppModal';
import { useUserContext } from './contexts/UserContext';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser } = useUserContext();
    const [modal, setModal] = useState({
      visible: false,
      title: "",
      message: "",
      type: "info" as "info" | "success" | "error"
    });
  
    useEffect(() => {
      if (visible && trainingId) {
        fetchTraining();
      }
    }, [trainingId, visible]);
  
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
      } catch (error) {
        console.error('Error fetching training:', error);
        setError('Impossible de charger les détails de l\'entraînement.');
      } finally {
        setLoading(false);
      }
    };
  
    const toggleEditMode = () => {
      setIsEditing(!isEditing);
    };
  
    const saveChanges = async () => {
      if (!training) return;
      
      try {
        const updatedTraining: Training = {
          ...training,
          name: editedName,
          date: editedDate,
          totalMinutesOfTraining: editedDuration
        };
        
        if (!currentUser) {
          showModal('error', 'Erreur', 'Utilisateur non connecté.');
          return;
        }
        await trainingService.update(currentUser.id, updatedTraining);
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
                      <TextInput
                        style={styles.input}
                        value={formatDateForInput(editedDate)}
                        onChangeText={(text) => setEditedDate(parseDateFromInput(text))}
                        placeholder="AAAA-MM-JJ"
                      />
                      <Text style={styles.dateHelperText}>Format: AAAA-MM-JJ</Text>
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
  }
});