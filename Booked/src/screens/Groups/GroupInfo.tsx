import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../../firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUser } from "../../context/UserContext";
import * as ImagePicker from "expo-image-picker";
import { globalStyles, GroupButton, GroupOptionButton, ModalButton } from "../../styles/globalStyles";

export default function GroupInfo({ route, navigation }: any) {
  const { groupId } = route.params;
  const { user } = useUser();
  const [group, setGroup] = useState<any>({ name: "", members: [], image: null, description: "" });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupImage, setNewGroupImage] = useState<string | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);

        if (groupSnap.exists()) {
          setGroup({ id: groupSnap.id, ...groupSnap.data() });
          setNewGroupName(groupSnap.data().name);
          setNewGroupImage(groupSnap.data().image || null);
          setNewDescription(groupSnap.data().description || "");
        } else {
          Alert.alert("Error", "Group not found.");
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch group details.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const pickGroupImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please grant access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setNewGroupImage(result.assets[0].uri);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        name: newGroupName,
        image: newGroupImage,
      });
      setGroup((prev) => ({ ...prev, name: newGroupName, image: newGroupImage }));
      setIsEditing(false);
      Alert.alert("Success", "Group info updated!");
    } catch (error) {
      Alert.alert("Error", "Failed to update group info.");
    }
  };

  const handleUpdateDescription = async () => {
    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        description: newDescription,
      });
      setGroup((prev) => ({ ...prev, description: newDescription }));
      setShowDescriptionModal(false);
      Alert.alert("Success", "Description updated!");
    } catch (error) {
      Alert.alert("Error", "Failed to update description.");
    }
  };

  const renderMember = ({ item }: any) => (
    <View style={globalStyles.memberItem}>
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={globalStyles.memberAvatar} />
      ) : (
        <Ionicons name="person" size={40} color="#5967EB" />
      )}
      <Text style={globalStyles.memberName}>{item.name || item.email}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#5967EB" />
        <Text style={globalStyles.loadingText}>Loading group details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#100f0f" }}>
      <View style={globalStyles.groupInfoContainer}>
        {/* Header */}
        <View style={globalStyles.groupHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#5967EB" />
          </TouchableOpacity>
          {isEditing ? (
            <View style={globalStyles.editHeader}>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Text style={globalStyles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveChanges}>
                <Text style={globalStyles.modalConfirmButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Ionicons name="create" size={24} color="#5967EB" />
            </TouchableOpacity>
          )}
        </View>

        {/* Group Image and Name */}
        <View style={globalStyles.groupImageContainer}>
          <TouchableOpacity onPress={isEditing ? pickGroupImage : undefined}>
            {newGroupImage ? (
              <Image source={{ uri: newGroupImage }} style={globalStyles.groupImage} />
            ) : (
              <Ionicons name="people" size={100} color="#5967EB" />
            )}
          </TouchableOpacity>
          {isEditing ? (
            <TextInput
              style={globalStyles.groupNameInput}
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Group Name"
              placeholderTextColor="#888"
            />
          ) : (
            <Text style={globalStyles.groupName}>{group.name}</Text>
          )}
          <Text style={globalStyles.memberCount}>{group.members.length} members</Text>
        </View>

        {/* Group Description */}
        <TouchableOpacity
          style={globalStyles.descriptionContainer}
          onPress={() => setShowDescriptionModal(true)}
        >
          <Text style={globalStyles.descriptionText}>
            {group.description || "Add a description..."}
          </Text>
        </TouchableOpacity>

        {/* Members Section */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={globalStyles.sectionTitle}>Members</Text>
          <FlatList
            data={group.members}
            keyExtractor={(item) => item.id}
            renderItem={renderMember}
            contentContainerStyle={globalStyles.membersList}
          />
          <GroupButton 
            onPress={() => Alert.alert("Add Members", "Feature coming soon")} 
            icon="person-add"
          >
            Add Members
          </GroupButton>
        </View>

        {/* Group Options */}
        <View style={globalStyles.optionsContainer}>
          <GroupOptionButton 
            onPress={() => Alert.alert("Favorites", "Feature coming soon")} 
            icon="star"
          >
            Add Chat to Favorites
          </GroupOptionButton>
          <GroupOptionButton 
            onPress={() => Alert.alert("Clear Chat", "Feature coming soon")} 
            icon="trash"
          >
            Clear Chat
          </GroupOptionButton>
          <GroupOptionButton 
            onPress={() => Alert.alert("Exit Group", "Feature coming soon")} 
            icon="exit"
          >
            Exit Group
          </GroupOptionButton>
          <GroupOptionButton 
            onPress={() => Alert.alert("Delete Chat", "Feature coming soon")} 
            icon="trash"
            danger
          >
            Delete Chat
          </GroupOptionButton>
        </View>

        {/* Description Modal */}
        <Modal visible={showDescriptionModal} transparent animationType="slide">
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContent}>
              <Text style={globalStyles.modalTitle}>Edit Group Description</Text>
              <TextInput
                style={[globalStyles.input, { height: 100 }]}
                value={newDescription}
                onChangeText={setNewDescription}
                placeholder="Add a description..."
                placeholderTextColor="#888"
                multiline
              />
              <View style={globalStyles.modalFooter}>
                <ModalButton 
                  type="cancel" 
                  onPress={() => setShowDescriptionModal(false)}
                >
                  Cancel
                </ModalButton>
                <ModalButton 
                  onPress={handleUpdateDescription}
                >
                  Save
                </ModalButton>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}