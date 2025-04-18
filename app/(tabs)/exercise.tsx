import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import ExerciseContent from '@/components/ExerciseContent';

// ceci est le parents de exercise content la page
// ou je peux importer tous mes modules pour faire mon "screen exercise"
export default function ExerciseScreen() {
  return (
   
      <ExerciseContent path="components/ExerciseContent.tsx" />
  
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
