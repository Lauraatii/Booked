import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, Image, Alert, TouchableOpacity, StyleSheet, ActivityIndicator 
} from "react-native";
import { useUser } from "../context/UserContext";
import { auth, db, storage } from "../../firebaseConfig";
import { signOut, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";

export default function Profile({ navigation }: any) {
  const { user } = useUser();
  const [name, setName] = useState(user?.displayName || "");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(user?.photoURL || "");
  const [loading, setLoading] = useState(false);

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

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setLoading(true);
      const selectedImage = result.assets[0];

      try {
        if (!user) return;

        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        const responseBlob = await fetch(selectedImage.uri);
        const blob = await responseBlob.blob();

        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);

        setProfileImage(downloadUrl);
        await updateProfile(auth.currentUser!, { photoURL: downloadUrl });

        await setDoc(doc(db, "users", user.uid), { profileImage: downloadUrl }, { merge: true });

        Alert.alert("Upload Successful", "Your profile picture has been updated.");
      } catch (error) {
        Alert.alert("Error", "Failed to upload image.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Update profile information
  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      await setDoc(doc(db, "users", user.uid), { name, bio, profileImage }, { merge: true });
      await updateProfile(auth.currentUser!, { displayName: name });

      Alert.alert("Profile Updated", "Your profile has been successfully updated.");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: "Auth" }], 
      });
    } catch (error) {
      Alert.alert("Error", "Logout failed.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <TouchableOpacity onPress={handlePickImage} style={styles.imageContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#31C99E" />
        ) : (
          <Image
            source={profileImage ? { uri: profileImage } : require("../../assets/default-avatar.png")}
            style={styles.profileImage}
          />
        )}
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

      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20, 
    backgroundColor: "#F8F9FA" 
  },

  imageContainer: { 
    alignItems: "center", 
    marginBottom: 20 
  },

  profileImage: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    borderWidth: 2, 
    borderColor: "#31C99E" 
  },

  editText: { 
    marginTop: 8, 
    color: "#31C99E", 
    fontSize: 14 
  },

  label: { 
    fontSize: 16, 
    color: "#333", 
    alignSelf: "flex-start", 
    marginLeft: "10%", 
    marginBottom: 5 
  },

  input: { 
    width: "80%", 
    padding: 12, 
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 8, 
    backgroundColor: "#fff", 
    marginBottom: 15 
  },

  button: { 
    backgroundColor: "#31C99E", 
    padding: 12, 
    borderRadius: 8, 
    alignItems: "center", 
    width: "80%", 
    marginBottom: 15 
  },

  buttonText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold" 
  },

  logoutText: { 
    color: "#333", 
    fontSize: 16, 
    marginTop: 10 
  }
});
