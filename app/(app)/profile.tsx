import ProfileContent from "@/components/ProfileContent";
import { View, Text } from "@/components/Themed";
import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
 <ProfileContent path="components/ProfileContent.tsx" />
        </View>
    )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
