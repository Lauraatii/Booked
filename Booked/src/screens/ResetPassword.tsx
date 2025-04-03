import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";
import { globalStyles, GradientButton } from "../styles/globalStyles";

interface ResetPasswordProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

export default function ResetPassword({ navigation }: ResetPasswordProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Email Sent",
        "Check your email for the password reset link",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#100f0f", "#2a0b4e"]} style={globalStyles.gradient}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.subtitle}>
          Enter your email to receive a reset link
        </Text>

        <TextInput
          style={globalStyles.input}
          placeholder="Your Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <GradientButton onPress={handlePasswordReset}>
          {loading ? "Sending..." : "Send Reset Link"}
        </GradientButton>

        <View style={globalStyles.footerContainer}>
          <Text style={globalStyles.footerText}>Remember your password?</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={globalStyles.linkText}> Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}