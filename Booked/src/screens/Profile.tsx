import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useUser } from "../context/UserContext";
import { auth, db, storage } from "../../firebaseConfig";
import { signOut, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import * as ImagePicker from "react-native-image-picker";

export default function Profile({ navigation }: any) {
  const { user } = useUser();
  const [name, setName] = useState(user?.displayName || "");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(user?.photoURL || "");

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBio(userData.bio || "");
          setProfileImage(userData.profileImage || "");
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), { name, bio, profileImage }, { merge: true });
      await updateProfile(auth.currentUser!, { displayName: name, photoURL: profileImage });
      Alert.alert("Profile Updated", "Your profile has been successfully updated.");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const handlePickImage = async () => {
    ImagePicker.launchImageLibrary({ mediaType: "photo" }, async (response) => {
      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        if (!user) return;

        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        const responseBlob = await fetch(selectedImage.uri);
        const blob = await responseBlob.blob();

        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);

        setProfileImage(downloadUrl);
        Alert.alert("Upload Successful", "Your profile picture has been updated.");
      }
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Error", "Logout failed.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <TouchableOpacity onPress={handlePickImage}>
        <Image
          source={profileImage ? { uri: profileImage } : require("../../assets/default-avatar.png")}
          style={styles.profileImage}
        />
        <Text style={styles.editText}>Change Profile Picture</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, { height: 60 }]}
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <Button title="Save Changes" onPress={handleUpdateProfile} color="#31C99E" />
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#31C99E" },
  title: { fontSize: 28, fontWeight: "bold", color: "#7DFFE3", marginBottom: 10 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, borderColor: "#7DFFE3", borderWidth: 2 },
  editText: { color: "#7DFFE3", marginBottom: 15, fontSize: 14 },
  label: { fontSize: 16, color: "#D9FFF5", marginBottom: 5 },
  input: { width: "80%", borderWidth: 1, padding: 10, borderRadius: 8, backgroundColor: "#FFFFFF", marginBottom: 15 },
});
