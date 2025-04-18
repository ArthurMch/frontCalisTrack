import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from './Themed';
import { useRouter } from 'expo-router';

export default function TrainingContent({ path }: { path: string }) {

   const router = useRouter(); 
   const goToLoginScreen = () => {
    router.replace('/login');; // Naviguez vers l'écran "Login"
  };
  return (
    <View>
      <Text>
         <TouchableOpacity style={styles.buttonStyle}  onPress={goToLoginScreen}>
          <Text style={styles.buttonText}>Go back to login screen for demo</Text>
         </TouchableOpacity>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: 'center',
  },
  buttonStyle: {
    backgroundColor: "#4a90e2",
   padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
  color: "white",
  fontSize: 16,
  fontWeight: "bold",
  },
});
