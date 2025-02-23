import React, { useState, useEffect } from 'react';
import { Alert, View, Text, StyleSheet, Button, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../../../firebaseConfig';
import { signOut } from 'firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  return (
    <ScrollView style={styles.scrollView}>
      <Modal animationType="fade" transparent visible={isModalVisible} onRequestClose={toggleModal}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: userData?.profilePicture || require('../../../assets/default-avatar.png') }} style={styles.modalImage} resizeMode="contain" />
        </View>
      </Modal>

      <View style={styles.container}>
        <TouchableOpacity onPress={toggleModal}>
          <Image source={{ uri: userData?.profilePicture || require('../../../assets/default-avatar.png') }} style={styles.profilePic} />
        </TouchableOpacity>
        <Text style={styles.nameAge}>{userData?.name} {userData?.birthday && `, ${calculateAge(userData.birthday)}`}</Text>

        <View style={styles.aboutMeCard}>
          <Text style={styles.infoTitle}>About</Text>
          <Text style={styles.infoText}>{userData?.bio}</Text>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <Button title="Sign Out" onPress={handleSignOut} color="#d9534f" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#31C99E',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 250,
    backgroundColor: '#fff',
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#31C99E',
    marginBottom: 15,
  },
  nameAge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  subText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: '#31C99E',
    padding: 12,
    borderRadius: 25,
    width: '90%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  categoryBubble: {
    backgroundColor: '#5967EB',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 5,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    padding: 5,
  },
  aboutMeCard: {
    backgroundColor: 'lightgrey',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalImage: {
    width: '80%',
    height: '80%',
    borderRadius: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 30,
  },
});

export default ProfileScreen;
