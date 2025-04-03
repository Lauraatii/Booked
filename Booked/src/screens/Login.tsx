import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { globalStyles, GradientButton } from "../styles/globalStyles";

interface LoginErrors {
  email?: string;
  password?: string;
}

export default function Login({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    let valid = true;
    let newErrors: LoginErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace("Main");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#100f0f", "#2a0b4e"]} style={globalStyles.gradient}>
      <View style={globalStyles.container}>
        <TextInput
          style={[globalStyles.input, errors.email && globalStyles.inputError]}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={globalStyles.errorText}>{errors.email}</Text>}

        <TextInput
          style={[globalStyles.input, errors.password && globalStyles.inputError]}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          secureTextEntry
        />
        {errors.password && <Text style={globalStyles.errorText}>{errors.password}</Text>}

        <GradientButton onPress={handleLogin}>
          {loading ? "Loading..." : "Log In"}
        </GradientButton>

        <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")}>
          <Text style={globalStyles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={globalStyles.footerContainer}>
          <Text style={globalStyles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Auth", { screen: "Signup" })}>
            <Text style={globalStyles.linkText}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}