import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import * as ImagePicker from "react-native-image-picker";

const interests = ["Trips", "Parties", "Coffee", "Workouts", "Outdoor", "Dining", "Gaming", "Concerts"];

export default function Signup({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setStep(1);
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        username,
        email,
        interests: selectedInterests,
        profileImage,
        createdAt: new Date(),
      });

      navigation.replace("Onboarding");
      Alert.alert("Success", "Account created successfully");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    }
  };

  const pickImage = async () => {
    ImagePicker.launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>

        {step === 1 && (
          <>
            <TextInput style={styles.input} placeholder="Full Name *" value={fullName} onChangeText={setFullName} />
            <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <TextInput style={styles.input} placeholder="Username (Optional)" value={username} onChangeText={setUsername} />
            <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep(3)}>
              <Text style={styles.skipText}>Skip this step</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.subtitle}>Select Interests (Optional)</Text>
            <View style={styles.interestsContainer}>
              {interests.map((interest, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.interestButton, selectedInterests.includes(interest) && styles.interestSelected]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text style={[styles.interestText, selectedInterests.includes(interest) && styles.interestTextSelected]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={() => setStep(4)}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep(4)}>
              <Text style={styles.skipText}>Skip this step</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 4 && (
          <>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              <Image
                source={profileImage ? { uri: profileImage } : require("../../assets/default-avatar.png")}
                style={styles.profileImage}
              />
              <Text style={styles.uploadText}>Upload Profile Picture (Optional)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Finish</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.skipText}>Skip this step</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}> Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: "center" },
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#31C99E", padding: 20 },
  title: { fontSize: 32, fontWeight: "bold", color: "#7DFFE3", marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: "bold", color: "#7DFFE3", textAlign: "center", marginBottom: 10 },
  imageContainer: { alignItems: "center", marginBottom: 20 },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderColor: "#7DFFE3", borderWidth: 3 },
  uploadText: { color: "#7DFFE3", fontSize: 14, marginTop: 10 },
  input: { width: "80%", padding: 12, borderRadius: 10, backgroundColor: "#fff", marginBottom: 15 },
  button: { backgroundColor: "#26A480", padding: 12, borderRadius: 10, width: "80%", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#7DFFE3", fontSize: 18, fontWeight: "bold" },
  interestsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginBottom: 20 },
  interestButton: { backgroundColor: "#D9FFF5", padding: 10, borderRadius: 10, margin: 5 },
  interestSelected: { backgroundColor: "#26A480" },
  interestText: { fontSize: 14, color: "#31C99E", fontWeight: "bold" },
  interestTextSelected: { color: "#7DFFE3" },
  loginContainer: { flexDirection: "row", marginTop: 20 },
  loginText: { color: "#fff", fontSize: 14, marginRight: 5 },
  loginLink: { color: "#7DFFE3", fontSize: 14, fontWeight: "bold" },
  skipText: { color: "#D9FFF5", fontSize: 14, marginTop: 10 },
});
