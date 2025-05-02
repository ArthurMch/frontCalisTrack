import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthService } from '@/services/auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const router = useRouter();
  const { token } = useLocalSearchParams();
    const authService = new AuthService();

  useEffect(() => {
    // Vérifier si le token est valide
        const verifyToken = async () => {
      if (!token || typeof token !== 'string') {
        // Si le token est manquant ou n'est pas une chaîne, afficher une erreur
        setMessage({ type: 'error', text: 'Lien invalide ou expiré' });
        setIsTokenValid(false);
        return;
      }

      try {
        // Vérifier la validité du token auprès du serveur
        if (typeof token === 'string') {
          const response = await authService.isValidLostPassword(token);
          setIsTokenValid(true);
        } else {
          throw new Error('Invalid token format');
        }
        setIsTokenValid(true);
      } catch (error) {
        setMessage({ type: 'error', text: 'Ce lien de réinitialisation est invalide ou a expiré' });
        setIsTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleResetPassword = async () => {
     if (!token || typeof token !== 'string') {
      setMessage({ type: 'error', text: 'Lien invalide ou expiré' });
      return;
    }
    // Validation des entrées
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Appel à l'API pour changer le mot de passe
      await authService.resetPassword(token, newPassword);
      
      // Message de succès
      setMessage({ 
        type: 'success', 
        text: 'Votre mot de passe a été réinitialisé avec succès' 
      });
      
      // Rediriger vers la page de connexion après quelques secondes
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Une erreur est survenue lors de la réinitialisation du mot de passe' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Si le token n'est pas valide, afficher un message d'erreur
  if (!isTokenValid && message?.type === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Réinitialisation du mot de passe</Text>
        <Text style={styles.error}>{message.text}</Text>
        <Button 
          title="Retour à la connexion" 
          onPress={() => router.push('/')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réinitialisation du mot de passe</Text>
      
      <Text style={styles.instructions}>
        Veuillez entrer votre nouveau mot de passe ci-dessous.
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nouveau mot de passe"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      {message ? (
        <Text style={message.type === 'error' ? styles.error : styles.success}>
          {message.text}
        </Text>
      ) : null}
      
      <Button 
        title={isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"} 
        onPress={handleResetPassword}
        disabled={isLoading}
      />
      
      <Button 
        title="Retour à la connexion" 
        onPress={() => router.push('/')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  instructions: {
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  success: {
    color: "green",
    marginBottom: 10,
    textAlign: "center",
  },
});