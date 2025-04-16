import React, { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles, GradientButton } from '../../styles/globalStyles';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: '',
    bio: '',
    birthday: '',
    interests: [],
    profilePicture: null,
    status: 'Available'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const calculateAge = (birthday) => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    return age;
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUserData);
    fetchUserData();
    return unsubscribe;
  }, [navigation]);

  const fetchUserData = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'No user logged in');
      setIsLoading(false);
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
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: handleSignOut
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  if (isLoading) {
    return (
      <LinearGradient colors={["#100f0f", "#2a0b4e"]} style={globalStyles.gradient}>
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#7DFFE3" />
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
            tintColor="#7DFFE3"
          />
        }
      >
        {/* Header */}
        <View style={[globalStyles.header, { marginBottom: 30 }]}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={[globalStyles.createGroupButton, { padding: 10 }]}
          >
            <Ionicons name="settings" size={20} color="#7DFFE3" />
          </TouchableOpacity>
        </View>

        {/* Profile Picture and Name */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
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

          <Text style={[globalStyles.title, { 
            fontSize: 28,
            marginBottom: 5,
            color: '#7DFFE3'
          }]}>
            {userData.name || 'No name'}
          </Text>

          {userData.birthday && (
            <Text style={[globalStyles.subtitle, { color: '#D9FFF5' }]}>
              {calculateAge(userData.birthday)} years old
            </Text>
          )}
        </View>

        {/* About Me Section */}
        <View style={[globalStyles.eventCard, { marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="information-circle" size={24} color="#7DFFE3" style={{ marginRight: 10 }} />
            <Text style={[globalStyles.eventTitle, { color: '#7DFFE3' }]}>About Me</Text>
          </View>
          <Text style={[globalStyles.text, { lineHeight: 22 }]}>
            {userData.bio || 'No bio available. Tap "Edit Profile" to add one.'}
          </Text>
        </View>

        {/* Status Section */}
        <View style={[globalStyles.eventCard, { marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="ellipse" size={24} color="#7DFFE3" style={{ marginRight: 10 }} />
            <Text style={[globalStyles.eventTitle, { color: '#7DFFE3' }]}>Status</Text>
          </View>
          <Text style={[globalStyles.text, { color: '#D9FFF5' }]}>
            {userData.status || 'No status set'}
          </Text>
        </View>

        {/* Interests Section */}
        {userData.interests && userData.interests.length > 0 ? (
          <View style={[globalStyles.eventCard, { marginBottom: 20 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Ionicons name="heart" size={24} color="#7DFFE3" style={{ marginRight: 10 }} />
              <Text style={[globalStyles.eventTitle, { color: '#7DFFE3' }]}>My Interests</Text>
            </View>
            <View style={[globalStyles.interestsContainer, { justifyContent: 'flex-start' }]}>
              {userData.interests.map((interest, index) => (
                <View 
                  key={index} 
                  style={[
                    globalStyles.interestButton,
                    { 
                      backgroundColor: 'rgba(125, 255, 227, 0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(125, 255, 227, 0.3)',
                      marginRight: 8,
                      marginBottom: 8
                    }
                  ]}
                >
                  <Text style={[globalStyles.interestText, { color: '#7DFFE3' }]}>
                    {interest}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={[globalStyles.eventCard, { marginBottom: 20 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Ionicons name="heart" size={24} color="#7DFFE3" style={{ marginRight: 10 }} />
              <Text style={[globalStyles.eventTitle, { color: '#7DFFE3' }]}>My Interests</Text>
            </View>
            <Text style={[globalStyles.text, { color: '#D9FFF5' }]}>
              No interests added yet. Edit profile to add some!
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <GradientButton 
          onPress={() => navigation.navigate('EditProfile')}
          style={{ marginBottom: 15 }}
        >
          <Ionicons name="pencil" size={18} color="#fff" style={{ marginRight: 10 }} />
          Edit Profile
        </GradientButton>

        <TouchableOpacity 
          onPress={confirmSignOut} 
          style={[
            globalStyles.modalCancelButton, 
            { 
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 30
            }
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out" size={18} color="#FF6B6B" style={{ marginRight: 10 }} />
          <Text style={[globalStyles.modalCancelButtonText, { color: '#FF6B6B' }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileScreen;