import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { globalStyles, GradientButton } from "../styles/globalStyles";

const interests = ["Trips", "Parties", "Coffee", "Workouts", "Outdoor", "Dining", "Gaming", "Concerts"];

export default function Signup({ navigation }) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(item => item !== interest)
        : [...prev, interest]
    );
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName,
        username,
        email,
        profileImage,
        interests: selectedInterests,
        createdAt: new Date(),
      });
      navigation.replace("Onboarding");
    } catch (error) {
      Alert.alert("Registration Failed", error.message);
    }
  };

  return (
    <LinearGradient colors={["#100f0f", "#2a0b4e"]} style={globalStyles.gradient}>
      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
        <View style={globalStyles.container}>

          {step === 1 && (
            <>
              <TextInput
                style={globalStyles.input}
                placeholder="Full Name *"
                placeholderTextColor="#aaa"
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={globalStyles.input}
                placeholder="Email *"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={globalStyles.input}
                placeholder="Password *"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <GradientButton onPress={() => setStep(2)}>
                Continue
              </GradientButton>
            </>
          )}

          {step === 2 && (
            <>
              <TextInput
                style={globalStyles.input}
                placeholder="Username (Optional)"
                placeholderTextColor="#aaa"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <GradientButton onPress={() => setStep(3)}>
                Continue
              </GradientButton>
              <TouchableOpacity onPress={() => setStep(3)}>
                <Text style={globalStyles.linkText}>Skip for now</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={globalStyles.subtitle}>Select Your Interests</Text>
              <View style={globalStyles.interestsContainer}>
                {interests.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      globalStyles.interestButton,
                      selectedInterests.includes(interest) && {
                        backgroundColor: "#594DA8"
                      }
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={globalStyles.interestText}>{interest}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <GradientButton onPress={() => setStep(4)}>
                Continue
              </GradientButton>
              <TouchableOpacity onPress={() => setStep(4)}>
                <Text style={globalStyles.linkText}>Skip for now</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 4 && (
            <>
              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : require("../../assets/default-avatar.png")
                  }
                  style={globalStyles.profileImage}
                />
                <Text style={globalStyles.uploadText}>
                  {profileImage ? "Change Photo" : "Add Profile Photo"}
                </Text>
              </TouchableOpacity>
              <GradientButton onPress={handleRegister}>
                Complete Registration
              </GradientButton>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={globalStyles.linkText}>Skip for now</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={globalStyles.footerContainer}>
            <Text style={globalStyles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Auth", { screen: "Login" })}>
              <Text style={globalStyles.linkText}> Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}