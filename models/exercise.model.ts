import { Training } from "./training.model";

export interface Exercise {
  id: number | null;
  name: string;
  set: number | null;
  rep: number | null;
  restTimeInMinutes: number | null;
  userId: number | null;
}
