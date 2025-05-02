import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '@/services/auth.service';

export default function LostPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const authService = new AuthService();

  const handleResetPassword = async () => {
    // Validation de l'email
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Veuillez saisir une adresse email valide' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Remplacez par votre appel API réel
      await authService.lostPassword(email);
      
      // Message de succès
      setMessage({ 
        type: 'success', 
        text: 'Instructions de réinitialisation envoyées à votre adresse email' 
      });
      
      // Optionnel : rediriger après quelques secondes
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Une erreur est survenue. Veuillez réessayer ultérieurement.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mot de passe oublié</Text>
      
      <Text style={styles.instructions}>
        Veuillez saisir l'adresse email associée à votre compte. 
        Vous recevrez un lien pour réinitialiser votre mot de passe.
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      {message ? (
        <Text style={message.type === 'error' ? styles.error : styles.success}>
          {message.text}
        </Text>
      ) : null}
      
      <Button 
        title={isLoading ? "Envoi en cours..." : "Réinitialiser le mot de passe"} 
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
    marginBottom: 20,
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