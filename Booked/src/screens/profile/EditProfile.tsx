import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [isFetching, setIsFetching] = useState(true);

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
        Alert.alert('Error', 'Failed to fetch user data: ' + error.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, []);

  const handleImageChange = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const selectedImageUri = result.assets[0].uri;
      setImageUri(selectedImageUri);
      setUserData({ ...userData, profilePicture: selectedImageUri });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      let updatedProfilePicture = userData.profilePicture;

      // Uploads new image 
      if (imageUri && imageUri.startsWith('file://')) {
        updatedProfilePicture = await uploadImage(imageUri);
      }

      // Updates user data in Firestore
      const db = getFirestore();
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        ...userData,
        profilePicture: updatedProfilePicture,
      });

      Alert.alert('Profile Updated', 'Your profile has been successfully updated.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const blob = await (await fetch(uri)).blob();
      const storage = getStorage();
      const imageName = `profile_${auth.currentUser.uid}`;
      const imageRef = ref(storage, `profilePictures/${imageName}`);

      await uploadBytes(imageRef, blob);
      return getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#31C99E" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f0f0f0', '#e0e0e0']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <TouchableOpacity onPress={handleImageChange} style={styles.imageContainer}>
            <Image
              source={
                userData.profilePicture
                  ? { uri: userData.profilePicture }
                  : require('../../../assets/default-avatar.png')
              }
              style={styles.profilePic}
              onError={() => setUserData({ ...userData, profilePicture: '' })}
            />
            <View style={styles.iconOverlay}>
              <Icon name="pencil" size={20} color="#fff" />
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
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
    marginBottom: 20,
    marginTop: 40,
  },
  iconOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 0,
    backgroundColor: '#31C99E',
    padding: 8,
    borderRadius: 20,
  },
  input: {
    width: '85%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
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
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#31C99E',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default EditProfile;