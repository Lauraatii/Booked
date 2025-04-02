import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WelcomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={["#100f0f", "#2a0b4e"]} style={styles.gradient}>
      <View style={[styles.container, { paddingBottom: insets.bottom || 30 }]}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>BOOK YOUR DREAM{"\n"}VACATION WITH FRIENDS</Text>
        </View>

        <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.buttonText}>Get started</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.buttonText}>I already have an account</Text>
        </TouchableOpacity>

        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    lineHeight: 30,
  },
  buttonsContainer: {
    width: "100%",
  },
  button: {
    backgroundColor: "#5F4FFF",
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
