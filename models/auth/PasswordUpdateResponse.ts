export type PasswordUpdateResponse = {
  status: "DONE" | "INCORRECT" | "ALREADY";
  message?: string;
  accessToken?: string;
};
