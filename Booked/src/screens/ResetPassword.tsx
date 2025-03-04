import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function ResetPassword({ navigation }: any) {
  const [email, setEmail] = useState("");

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Success",
        "A password reset link has been sent to your email.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "An error occurred.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.signupText}>Back to <Text style={styles.signupLink}>Login</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#31C99E", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#7DFFE3", textAlign: "center", marginBottom: 20 },
  input: { width: "80%", padding: 12, borderRadius: 10, backgroundColor: "#fff", marginBottom: 15 },
  button: { backgroundColor: "#26A480", padding: 12, borderRadius: 10, width: "80%", alignItems: "center" },
  buttonText: { color: "#7DFFE3", fontSize: 18, fontWeight: "bold" },
  signupText: { color: "#fff", fontSize: 14 },
  signupLink: { color: "#7DFFE3", fontSize: 14, fontWeight: "bold" },
});
