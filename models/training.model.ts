import { Exercise } from "./exercise.model";
import { User } from "./user.model";

export interface Training {
  id: number | null;
  name: string;
  date: string;
  numberOfExercise: number | null;
  totalMinutesOfRest: number | null;
  totalMinutesOfTraining: number | null;
  trainingUser: number | null;
  exercises: Exercise[];
}
