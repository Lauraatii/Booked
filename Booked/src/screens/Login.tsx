import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import Animated, { FadeIn } from "react-native-reanimated";
import { globalStyles } from "../styles/globalStyles"; // Import global styles

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateFields = () => {
    let valid = true;
    let newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email address.";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace("Main");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <Animated.View style={globalStyles.container} entering={FadeIn.duration(500)}>
      <Text style={globalStyles.title}>Booked</Text>

      <TextInput
        style={[globalStyles.input, errors.email && globalStyles.inputError]}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((prev) => ({ ...prev, email: "" }));
        }}
        keyboardType="email-address"
      />
      {errors.email && <Text style={globalStyles.errorText}>{errors.email}</Text>}

      <TextInput
        style={[globalStyles.input, errors.password && globalStyles.inputError]}
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrors((prev) => ({ ...prev, password: "" }));
        }}
        secureTextEntry
      />
      {errors.password && <Text style={globalStyles.errorText}>{errors.password}</Text>}

      <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
        <Text style={globalStyles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")}>
        <Text style={globalStyles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={globalStyles.signupContainer}>
        <Text style={globalStyles.signupText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={globalStyles.signupLink}> Sign up</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
