import { Training } from "./training.model";

export interface User {
  id: number | null;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}
