import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#100f0f",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  gradient: {
    flex: 1,
  },

  // Typography
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  subtitle: {
    color: "#D9FFF5",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  text: {
    color: "#fff",
    fontSize: 14,
  },

  // Inputs
  input: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginLeft: 5,
    marginBottom: 10,
  },

  // Buttons
  buttonContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    padding: 16,
  },

  // Links
  linkText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  // Form footers
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },

  // Profile
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#7DFFE3",
  },
  uploadText: {
    color: "#7DFFE3",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },

  // Interests
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  interestButton: {
    padding: 10,
    borderRadius: 20,
    margin: 5,
    backgroundColor: "rgba(89, 77, 168, 0.3)",
  },
  interestText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export const GradientButton = ({ children, onPress, style = {} }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[globalStyles.buttonContainer, style]}>
      <LinearGradient
        colors={["#594DA8", "#574BA6", "#453995", "#2D1C9F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          borderRadius: 12,
        }}
      />
      <Text style={globalStyles.buttonText}>{children}</Text>
    </TouchableOpacity>
  );
};