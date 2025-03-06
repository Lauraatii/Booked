import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Modal,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../../firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUser } from "../../context/UserContext";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get("window");

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

  // Pick group image
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

  // Save group changes
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

  // Update group description
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

  // Render group members
  const renderMember = ({ item }: any) => (
    <View style={styles.memberItem}>
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.memberAvatar} />
      ) : (
        <Ionicons name="person" size={40} color="#26A480" />
      )}
      <Text style={styles.memberName}>{item.name || item.email}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#26A480" />
        <Text style={styles.loadingText}>Loading group details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#26A480" />
        </TouchableOpacity>
        {isEditing ? (
          <View style={styles.editHeader}>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSaveChanges}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Ionicons name="create" size={24} color="#26A480" />
          </TouchableOpacity>
        )}
      </View>

      {/* Group Image and Name */}
      <View style={styles.groupImageContainer}>
        <TouchableOpacity onPress={isEditing ? pickGroupImage : undefined}>
          {newGroupImage ? (
            <Image source={{ uri: newGroupImage }} style={styles.groupImage} />
          ) : (
            <Ionicons name="people" size={100} color="#26A480" />
          )}
        </TouchableOpacity>
        {isEditing ? (
          <TextInput
            style={styles.groupNameInput}
            value={newGroupName}
            onChangeText={setNewGroupName}
            placeholder="Group Name"
            placeholderTextColor="#888"
          />
        ) : (
          <Text style={styles.groupName}>{group.name}</Text>
        )}
        <Text style={styles.memberCount}>{group.members.length} members</Text>
      </View>

      {/* Group Description */}
      <TouchableOpacity
        style={styles.descriptionContainer}
        onPress={() => setShowDescriptionModal(true)}
      >
        <Text style={styles.descriptionText}>
          {group.description || "Add a description..."}
        </Text>
      </TouchableOpacity>

      {/* Members Section */}
      <View style={styles.membersContainer}>
        <Text style={styles.sectionTitle}>Members</Text>
        <FlatList
          data={group.members}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
          contentContainerStyle={styles.membersList}
        />
        <TouchableOpacity style={styles.addMemberButton}>
          <Ionicons name="person-add" size={24} color="#26A480" />
          <Text style={styles.addMemberText}>Add Members</Text>
        </TouchableOpacity>
      </View>

      {/* Group Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="star" size={24} color="#26A480" />
          <Text style={styles.optionText}>Add Chat to Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="trash" size={24} color="#26A480" />
          <Text style={styles.optionText}>Clear Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="exit" size={24} color="#26A480" />
          <Text style={styles.optionText}>Exit Group</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="trash" size={24} color="#FF6B6B" />
          <Text style={[styles.optionText, { color: "#FF6B6B" }]}>Delete Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Description Modal */}
      <Modal visible={showDescriptionModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDescriptionModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Group Description</Text>
            <TextInput
              style={styles.descriptionInput}
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Add a description..."
              placeholderTextColor="#888"
              multiline
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateDescription}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8F9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8F9",
  },
  loadingText: {
    fontSize: 16,
    color: "#26A480",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#555",
  },
  doneButtonText: {
    fontSize: 16,
    color: "#26A480",
    fontWeight: "bold",
  },
  groupImageContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#26A480",
    marginTop: 10,
  },
  groupNameInput: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#26A480",
    marginTop: 10,
    textAlign: "center",
  },
  memberCount: {
    fontSize: 16,
    color: "#777",
    marginTop: 5,
  },
  descriptionContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  descriptionText: {
    fontSize: 16,
    color: "#555",
  },
  membersContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#26A480",
    marginBottom: 10,
  },
  membersList: {
    paddingBottom: 20,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  memberName: {
    fontSize: 16,
    color: "#555",
  },
  addMemberButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  addMemberText: {
    fontSize: 16,
    color: "#26A480",
    marginLeft: 10,
  },
  optionsContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  optionText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#26A480",
    marginBottom: 15,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    minHeight: 100,
    fontSize: 16,
    color: "#555",
  },
  saveButton: {
    backgroundColor: "#26A480",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});