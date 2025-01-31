import { ExerciseService } from "@/services/exercise.service";
import { Exercise } from "@/models/exercise.model";
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, Dimensions } from "react-native";

export default function ExerciseContent({ path }: { path: string }) {
  const [name, setName] = useState("");
  const [setCount, setSetCount] = useState("");
  const [repCount, setRepCount] = useState("");
  const [restTime, setRestTime] = useState("");
  const [trainingId, setTrainingId] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const exerciseService = new ExerciseService();

const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await exerciseService.findAll();

      if (!data || data.length === 0) {
        setExercises([]);
        setError("Aucun exercice disponible.");
      } else {
        setExercises(data);
      }
    } catch (error) {
      console.error("Erreur lors de l'appel API pour récupérer les exercices :", error);
      setError("Impossible de récupérer les exercices. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };


  // Fonction pour créer un exercice
  const createExercise = async () => {
    if (!name || !setCount || !repCount || !restTime || !trainingId) {
      alert("Tous les champs doivent être remplis !");
      return;
    }

    try {
      const newExercise: Exercise = {
        name,
        set: parseInt(setCount),
        rep: parseInt(repCount),
        restTimeInMinutes: parseInt(restTime),
        training: { id: parseInt(trainingId) },
      };
      await exerciseService.create(newExercise); // Appel à votre service
      alert("Exercice créé avec succès !");
      setName("");
      setSetCount("");
      setRepCount("");
      setRestTime("");
      setTrainingId("");
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
      <TextInput
        style={styles.input}
        placeholder="ID de l'entraînement"
        value={trainingId}
        keyboardType="numeric"
        onChangeText={setTrainingId}
      />

      <Button title="Créer l'exercice" onPress={createExercise} />

         <Text style={styles.title}>Liste des exercices</Text>

      {loading && <Text>Chargement des exercices...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && !error && exercises.length === 0 && <Text>Aucun exercice disponible.</Text>}

      <FlatList
        data={exercises}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : `fallback-${index}`)}
        renderItem={({ item }) => (
          <View style={styles.exerciseItem}>
            <Text>Nom: {item.name}</Text>
            <Text>Séries: {item.set}</Text>
            <Text>Répétitions: {item.rep}</Text>
            <Text>Repos: {item.restTimeInMinutes} min</Text>
            <Button title="Supprimer" onPress={() => deleteExercise(item.id!)} color="red" />
          </View>
        )}
      />
    </View>
  );
}
 const screenWidth = Dimensions.get("window").width
  const screenHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
  
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "pink",
  },
  exerciseItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    width: screenWidth * 0.9, // ✅ Calculer 90% dynamiquement
  },
  error: {
    color: "red",
    marginBottom: 10,
  }
});
