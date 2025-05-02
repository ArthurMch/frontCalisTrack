import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import TrainingContent from '@/components/TrainingContent';

export default function TrainingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Training</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <TrainingContent path="components/TrainingContent.tsx" />
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
