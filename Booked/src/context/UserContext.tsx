import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext<{ user: User | null; userData: any }>({ user: null, userData: null });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await AsyncStorage.setItem("user", JSON.stringify(currentUser));
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        await AsyncStorage.removeItem("user");
        setUserData(null);
      }
    });

    return unsubscribe;
  }, []);

  return <UserContext.Provider value={{ user, userData }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
