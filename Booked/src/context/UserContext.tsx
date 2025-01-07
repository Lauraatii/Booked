import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../firebaseConfig";

const UserContext = createContext<{ user: User | null }>({ user: null });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe; // Clean up the listener
  }, []);

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
