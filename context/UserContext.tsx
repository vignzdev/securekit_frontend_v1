// src/context/UserContext.tsx
"use client";
import { createContext, useContext } from "react";
import { UserProfile } from "@/lib/auth";

type UserContextType = {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  authChecked: boolean;
  setAuthChecked: (val: boolean) => void;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
