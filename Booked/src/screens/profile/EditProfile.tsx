import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../../../firebaseConfig';
import { globalStyles, GradientButton } from '../../styles/globalStyles';

const EditProfile = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: '',
    bio: '',
    birthday: '',
    interests: [],
    profilePicture: null,
    status: 'Available'
  });
  const [imageUri, setImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUserData);
    fetchUserData();
    return unsubscribe;
  }, [navigation]);

  const fetchUserData = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'No user logged in');
      setIsFetching(false);
      return;
    }

    const db = getFirestore();
    const userRef = doc(db, 'users', auth.currentUser.uid);

    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          name: data.name || '',
          bio: data.bio || '',
          birthday: data.birthday || '',
          interests: data.interests || [],
          profilePicture: data.profilePicture || null,
          status: data.status || 'Available'
        });
      } else {
        Alert.alert('No user data found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user data');
    } finally {
      setIsFetching(false);
      setRefreshing(false);
    }
  };

  const handleImageChange = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
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

      if (imageUri && imageUri.startsWith('file://')) {
        updatedProfilePicture = await uploadImage(imageUri);
      }

      const db = getFirestore();
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name: userData.name,
        bio: userData.bio,
        profilePicture: updatedProfilePicture,
        status: userData.status,
        birthday: userData.birthday,
        interests: userData.interests
      });

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const blob = await (await fetch(uri)).blob();
      const storage = getStorage();
      const imageName = `profile_${auth.currentUser.uid}_${Date.now()}`;
      const imageRef = ref(storage, `profilePictures/${imageName}`);

      await uploadBytes(imageRef, blob);
      return getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  if (isFetching) {
    return (
      <LinearGradient colors={["#100f0f", "#2a0b4e"]} style={globalStyles.gradient}>
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#100f0f", "#2a0b4e"]} style={globalStyles.gradient}>
      <ScrollView 
        contentContainerStyle={[globalStyles.scrollContainer, { paddingTop: 50, paddingHorizontal: 20 }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        {/* Header */}
        <View style={[globalStyles.header, { marginBottom: 30 }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={[globalStyles.createGroupButton, { padding: 10 }]}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={globalStyles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} /> {/* Spacer for alignment */}
        </View>

        {/* Profile Picture */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <TouchableOpacity onPress={handleImageChange} activeOpacity={0.8}>
            <Image
              source={
                userData.profilePicture
                  ? { uri: userData.profilePicture }
                  : require('../../../assets/default-avatar.png')
              }
              style={[globalStyles.profileImage, { 
                width: 140, 
                height: 140,
                marginBottom: 15
              }]}
              onError={() => setUserData({...userData, profilePicture: null})}
            />
            <View style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 8,
            }}>
              <Ionicons name="camera" size={20} color="#100f0f" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Name Field */}
        <View style={[globalStyles.eventCard, { marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="person" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text style={[globalStyles.eventTitle, { color: '#fff' }]}>Name</Text>
          </View>
          <TextInput
            style={[globalStyles.input, { color: '#fff' }]}
            placeholder="Your name"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={userData.name}
            onChangeText={(text) => setUserData({ ...userData, name: text })}
          />
        </View>

        {/* Bio Field */}
        <View style={[globalStyles.eventCard, { marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="document-text" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text style={[globalStyles.eventTitle, { color: '#fff' }]}>About Me</Text>
          </View>
          <TextInput
            style={[globalStyles.input, { 
              color: '#fff',
              height: 100,
              textAlignVertical: 'top'
            }]}
            placeholder="Tell us about yourself"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={userData.bio}
            onChangeText={(text) => setUserData({ ...userData, bio: text })}
            multiline
          />
        </View>

        {/* Status Field */}
        <View style={[globalStyles.eventCard, { marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="ellipse" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text style={[globalStyles.eventTitle, { color: '#fff' }]}>Status</Text>
          </View>
          <TextInput
            style={[globalStyles.input, { color: '#fff' }]}
            placeholder="Your status"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={userData.status}
            onChangeText={(text) => setUserData({ ...userData, status: text })}
          />
        </View>

        {/* Save Button */}
        <GradientButton 
          onPress={handleSave}
          style={{ marginBottom: 60 }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={18} color="#fff" style={{ marginRight: 10 }} />
              <Text style={globalStyles.buttonText}>Save Changes</Text>
            </>
          )}
        </GradientButton>
      </ScrollView>
    </LinearGradient>
  );
};

export default EditProfile;