import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/ExerciseContent';
import { Text, View } from '@/components/Themed';
import ExerciseContent from '@/components/ExerciseContent';

// ceci est le parents de exercise content la page
// ou je peux importer tous mes modules pour faire mon "screen exercise"
export default function TabExerciseScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <ExerciseContent path="app/(tabs)/exercise.tsx" />
    </View>
  );
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
});
