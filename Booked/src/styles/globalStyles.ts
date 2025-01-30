import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#31C99E", 
    padding: 20 
  },

  title: { 
    fontSize: 40, 
    fontWeight: "bold", 
    color: "#7DFFE3", 
    marginBottom: 30 
  },

  input: { 
    width: "80%", 
    padding: 12, 
    borderRadius: 10, 
    backgroundColor: "#fff", 
    marginBottom: 10 
  },

  inputError: { 
    borderWidth: 1, 
    borderColor: "red" 
  },

  errorText: { 
    color: "red", 
    fontSize: 12, 
    alignSelf: "flex-start", 
    marginLeft: "10%", 
    marginBottom: 10 
  },

  button: { 
    backgroundColor: "#26A480", 
    padding: 12, 
    borderRadius: 10, 
    width: "80%", 
    alignItems: "center", 
    marginTop: 10 
  },

  buttonText: { 
    color: "#7DFFE3", 
    fontSize: 18, 
    fontWeight: "bold" 
  },

  forgotText: { 
    marginTop: 10, 
    color: "#D9FFF5", 
    fontSize: 14 
  },

  signupContainer: { 
    flexDirection: "row", 
    marginTop: 20 
  },

  signupText: { 
    color: "#fff", 
    fontSize: 14 
  },

  signupLink: { 
    color: "#7DFFE3", 
    fontSize: 14, 
    fontWeight: "bold" 
  },

  profileImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    marginBottom: 10, 
    borderColor: "#7DFFE3", 
    borderWidth: 2,
    alignSelf: "center"
  },

  uploadText: { 
    color: "#7DFFE3", 
    fontSize: 14, 
    textAlign: "center", 
    marginBottom: 15 
  },

  label: { 
    color: "#D9FFF5", 
    fontSize: 16, 
    marginBottom: 5, 
    alignSelf: "flex-start",
    marginLeft: "10%",
  },

  categoryButton: { 
    backgroundColor: "#D9FFF5", 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10, 
    width: "80%", 
    alignItems: "center" 
  },

  categoryButtonText: { 
    color: "#26A480", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});
