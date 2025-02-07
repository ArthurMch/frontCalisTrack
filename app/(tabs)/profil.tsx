import { View, Text } from "@/components/Themed";
import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

export default function TabProfilScreen() {
    return (
        <View style={styles.container}>
<FontAwesome name="user-circle" size={50} color="gray" style={styles.icon} />
        <Text style={styles.title}>Profil</Text>
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
