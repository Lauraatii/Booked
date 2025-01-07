import React from "react";
import AppNavigator from "./AppNavigator";
import { UserProvider } from "./src/UserContext";

export default function App() {
  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  );
}
