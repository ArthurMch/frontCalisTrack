import { Exercise } from "./exercise.model";
import { User } from "./user.model";

export interface Training {
  id: number | null;
  date: string;
  numberOfExercise: number | null;
  totalMinutesOfRest: number | null;
  totalMinutesOfTraining: number | null;
  trainingUser: User;
}
