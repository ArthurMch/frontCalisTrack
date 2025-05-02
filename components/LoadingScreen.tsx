import { ActivityIndicator, View, Text } from "react-native";

export default function LoadingScreen() {
  return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text>Vérification de l'authentification...</Text>
        </View>
      );
}