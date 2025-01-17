import { Training } from "./training.model";

export interface User {
  id: number | null; // Correspond à Long en Java
  firstname: string; // Correspond à String en Java
  lastname: string; // Correspond à String en Java
  email: string; // Correspond à String en Java
  password: string; // Correspond à String en Java
  trainings: Training[]; // Relation OneToMany avec Training
}
