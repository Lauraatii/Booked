import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth } from '../../../firebaseConfig';

const EditProfile = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: '',
    bio: '',
    profilePicture: '',
    status: 'Available',
  });
  const [imageUri, setImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const db = getFirestore();
      const userRef = doc(db, 'users', auth.currentUser.uid);

      try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const user = userDoc.data();
          setUserData({
            name: user.name || '',
            bio: user.bio || '',
            profilePicture: user.profilePicture || '',
            status: user.status || 'Available',
          });
        } else {
          Alert.alert('No user data found');
        }
      } catch (error) {
        Alert.alert('Error fetching user data:', error.message);
      }
    };

    fetchUserData();
  }, []);

  // Handle image change (ImagePicker)
  const handleImageChange = async () => {
    let result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Corrected deprecated warning
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      setImageUri(selectedImageUri);
      setUserData({ ...userData, profilePicture: selectedImageUri });
    }
  };

  // Save profile changes to Firestore
  const handleSave = async () => {
    setIsLoading(true);

    if (imageUri && imageUri.startsWith('file://')) {
      const imageUrl = await uploadImage(imageUri);
      setUserData((prevData) => ({ ...prevData, profilePicture: imageUrl }));
    }

    const db = getFirestore();
    const userRef = doc(db, 'users', auth.currentUser.uid);

    try {
      await updateDoc(userRef, userData);
      Alert.alert('Profile Updated', 'Your profile has been successfully updated.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (uri: string) => {
    const blob = await (await fetch(uri)).blob();
    const storage = getStorage();
    const imageName = `profile_${auth.currentUser.uid}`;
    const imageRef = ref(storage, `profilePictures/${imageName}`);

    await uploadBytes(imageRef, blob);
    return getDownloadURL(imageRef);
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleImageChange} style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri || userData.profilePicture || require('../../../assets/default-avatar.png') }}
            style={styles.profilePic}
          />
          <View style={styles.iconOverlay}>
            <Icon name="pencil" size={30} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={userData.name}
          onChangeText={(text) => setUserData({ ...userData, name: text })}
        />

        <Text style={styles.label}>About you</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Write a short bio"
          value={userData.bio}
          onChangeText={(text) => setUserData({ ...userData, bio: text })}
          multiline
        />

        <Text style={styles.label}>Status</Text>
        <TextInput
          style={styles.input}
          placeholder="Your status"
          value={userData.status}
          onChangeText={(status) => setUserData({ ...userData, status })}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 120,
    paddingBottom: 200,
    backgroundColor: '#fff',
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#31C99E',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  iconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#31C99E',
    padding: 10,
    borderRadius: 50,
  },
  input: {
    width: '85%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  bioInput: {
    height: 80,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginLeft: '8%',
    marginTop: 10,
    marginBottom: 5,
  },
  saveButton: {
    backgroundColor: '#31C99E',
    padding: 15,
    borderRadius: 25,
    width: '85%',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#31C99E', // Changed the back button to match the design
    borderRadius: 25,
    width: '85%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EditProfile;
