import { ExerciseService } from "@/services/exercise.service";
import { Exercise } from "@/models/exercise.model";
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from "react-native";

export default function ExerciseContent({ path }: { path: string }) {
  const [name, setName] = useState("");
  const [setCount, setSetCount] = useState("");
  const [repCount, setRepCount] = useState("");
  const [restTime, setRestTime] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const exerciseService = new ExerciseService();

const fetchExercises = async () => {
    console.log("fetchExercises() called");
    setLoading(true);
    setError(null);
    try {
        const data = await exerciseService.findAll();
        console.log("Fetched exercises:", data); 

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



  // Fonction pour créer un exercice
  const createExercise = async () => {
    if (!name || !setCount || !repCount || !restTime) {
      alert("Tous les champs doivent être remplis !");
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
      await exerciseService.create(newExercise); // Appel à votre service
      alert("Exercice créé avec succès !");
      setName("");
      setSetCount("");
      setRepCount("");
      setRestTime("");
      fetchExercises();
    } catch (error) {
      console.error("Erreur lors de la création de l'exercice :", error);
    }
  };

  // Fonction pour supprimer un exercice
  const deleteExercise = async (id: number) => {
    try {
      await exerciseService.delete(id);
      alert("Exercice supprimé avec succès !");
      fetchExercises(); 
    } catch (error) {
      console.error("Erreur lors de la suppression de l'exercice :", error);
    }
  };

  // Appel de fetchExercises au montage du composant
  useEffect(() => {
    fetchExercises();
  }, []); // [] signifie que ce useEffect ne s'exécute qu'une seule fois, au montage

  return (

  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}> 
    <View style={styles.container}>
      <Text style={styles.title}>Créer un exercice</Text>

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

       <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Créer l'exercice</Text>
        </TouchableOpacity>

      <Text style={styles.title}>Liste des exercices</Text>

      {loading && <Text>Chargement des exercices...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && !error && exercises.length === 0 && <Text>Aucun exercice disponible.</Text>}

      <FlatList
        data={exercises}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : `fallback-${index}`)}
        renderItem={({ item }) => (
          <View style={styles.exerciseItem}>
              <View>
            <Text style={styles.exerciseText}>Nom: {item.name}</Text>
            <Text style={styles.exerciseText}>Séries: {item.set}</Text>
            <Text style={styles.exerciseText}>Répétitions: {item.rep}</Text>
            <Text style={styles.exerciseText}>Repos: {item.restTimeInMinutes} min</Text>
            </View>
            <View style={styles.buttonContainer}> 
                <TouchableOpacity style={styles.editButton} >
                  <Text style={styles.buttonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteExercise(item.id!)} >
                  <Text style={styles.buttonText}>🗑</Text>
                </TouchableOpacity>
              </View>
          </View>
        )}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  </ScrollView>


  );
}
 const screenWidth = Dimensions.get("window").width
  const screenHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
   container: {
    padding: 20,
    width: screenWidth * 0.9,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  createButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseText: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  editButton: {
    backgroundColor: "#ffc107",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
   error: {
    color: "red",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
