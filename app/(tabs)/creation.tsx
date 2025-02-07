import { View, Text } from "@/components/Themed";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React from "react";
import { StyleSheet } from "react-native";
import { faCableCar } from "@fortawesome/free-solid-svg-icons";


export default function TabCreationScreen() {
    return (
        <View style={styles.container}>
         <FontAwesomeIcon icon={faCableCar} />
        <Text style={styles.title}>Creation</Text>
        </View>
    )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  icon: {
    marginBottom: 20, // Ajoute un espace entre l'icône et le texte
  },
});
