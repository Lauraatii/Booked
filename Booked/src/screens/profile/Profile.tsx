import React, { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../../../firebaseConfig';
import { signOut } from 'firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const calculateAge = (birthday) => {
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
    const db = getFirestore();
    const userRef = doc(db, 'users', auth.currentUser.uid);

    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        Alert.alert('No user data found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => {
          signOut(auth)
            .then(() => {
              navigation.navigate('FirstScreen');
            })
            .catch((error) => {
              console.error('Sign out error:', error);
            });
        },
      },
    ]);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings'); // Placeholder for now
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#31C99E" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f0f0f0', '#e0e0e0']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Settings Icon in Top-Right Corner */}
        <TouchableOpacity style={styles.settingsIcon} onPress={navigateToSettings}>
          <Icon name="cog" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.container}>
          <TouchableOpacity onPress={toggleModal}>
            <Image
              source={
                userData?.profilePicture
                  ? { uri: userData.profilePicture }
                  : require('../../../assets/default-avatar.png')
              }
              style={styles.profilePic}
              onError={() => setUserData({ ...userData, profilePicture: '' })}
            />
          </TouchableOpacity>

          <Text style={styles.nameAge}>
            {userData?.name} {userData?.birthday && `, ${calculateAge(userData.birthday)}`}
          </Text>

          <View style={styles.aboutMeCard}>
            <Text style={styles.infoTitle}>About Me</Text>
            <Text style={styles.infoText}>{userData?.bio || 'No bio available.'}</Text>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
            <Icon name="pencil" size={20} color="#fff" />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          {/* Simple Sign Out Text Link */}
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal for Full-Screen Profile Picture */}
      <Modal animationType="fade" transparent visible={isModalVisible} onRequestClose={toggleModal}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={
              userData?.profilePicture
                ? { uri: userData.profilePicture }
                : require('../../../assets/default-avatar.png')
            }
            style={styles.modalImage}
            resizeMode="contain"
            onError={() => setUserData({ ...userData, profilePicture: '' })}
          />
        </View>
      </Modal>
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
  nameAge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  aboutMeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#31C99E',
  },
  infoText: {
    fontSize: 16,
    color: '#555',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#31C99E',
    padding: 15,
    borderRadius: 25,
    width: '90%',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  signOutText: {
    color: '#000',
    fontSize: 16,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalImage: {
    width: '90%',
    height: '90%',
    borderRadius: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  settingsIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
});

export default ProfileScreen;