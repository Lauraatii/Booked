import React from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useUser } from "../context/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function Home({ navigation }: any) {
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (error: any) {
      console.error("Logout error: ", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.displayName || "Friend"}! 👋</Text>
      <Text style={styles.subtitle}>What would you like to do today?</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.buttonText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Groups")}
        >
          <Text style={styles.buttonText}>Manage Groups</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Events")}
        >
          <Text style={styles.buttonText}>Upcoming Events</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#31C99E", // Primary background color
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#7DFFE3", // Light teal text
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#D9FFF5", // Softer version of the text color
    marginBottom: 20,
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#26A480", // Darker complementary teal
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#7DFFE3",
    fontSize: 18,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#E74C3C", // Red logout button
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
