import { User } from "./user";

// auth.ts
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}