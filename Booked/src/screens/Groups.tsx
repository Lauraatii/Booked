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
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../firebaseConfig";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Groups({ navigation }: any) {
  const { user } = useUser();
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSection, setSelectedSection] = useState("My Groups");

  // Fetch groups and invitations
  const fetchGroups = async () => {
    if (!user) return;

    try {
      const groupsRef = collection(db, "groups");
      const q = query(groupsRef, where("members", "array-contains", user.uid));
      const querySnapshot = await getDocs(q);

      const groupsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupsData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch groups.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchInvitations = async () => {
    if (!user) return;

    try {
      const invitationsRef = collection(db, "invitations");
      const q = query(invitationsRef, where("invitedUser", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const invitationsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInvitations(invitationsData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch invitations.");
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchInvitations();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
    fetchInvitations();
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name.");
      return;
    }

    try {
      const groupRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        members: [user.uid],
        events: [],
        createdAt: new Date(),
      });

      setGroups((prev) => [
        ...prev,
        { id: groupRef.id, name: groupName, members: [user.uid], events: [] },
      ]);
      setGroupName("");
      setIsCreatingGroup(false);
      Alert.alert("Success", "Group created successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to create group.");
    }
  };

  // invitation acceptance or decline
  const handleInvitationResponse = async (invitationId: string, accept: boolean) => {
    try {
      const invitationRef = doc(db, "invitations", invitationId);
      const invitationData = (await getDoc(invitationRef)).data();

      if (accept) {
        await updateDoc(doc(db, "groups", invitationData.groupId), {
          members: arrayUnion(user.uid),
        });
        Alert.alert("Success", "Invitation accepted!");
      }

      await updateDoc(invitationRef, { status: accept ? "accepted" : "declined" });
      fetchInvitations();
    } catch (error) {
      Alert.alert("Error", "Failed to respond to invitation.");
    }
  };

  // Render each group item
  const renderGroupItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => navigation.navigate("GroupDetails", { groupId: item.id })}
    >
      <Text style={styles.groupName}>{item.name}</Text>
      <Text style={styles.groupMembers}>
        {item.members.length} member{item.members.length !== 1 && "s"}
      </Text>
    </TouchableOpacity>
  );

  // Renders each invitation item
  const renderInvitationItem = ({ item }: any) => (
    <View style={styles.invitationCard}>
      <Text style={styles.invitationText}>{item.groupName}</Text>
      <Text style={styles.invitationDetails}>
        Invited by: {item.inviter} | {item.message}
      </Text>
      <View style={styles.invitationButtons}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleInvitationResponse(item.id, true)}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleInvitationResponse(item.id, false)}
        >
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#26A480" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Selection */}
      <View style={styles.sectionSelector}>
        <TouchableOpacity
          style={[
            styles.sectionButton,
            selectedSection === "My Groups" && styles.sectionButtonActive,
          ]}
          onPress={() => setSelectedSection("My Groups")}
        >
          <Text
            style={[
              styles.sectionText,
              selectedSection === "My Groups" && styles.sectionTextActive,
            ]}
          >
            My Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sectionButton,
            selectedSection === "Invitations" && styles.sectionButtonActive,
          ]}
          onPress={() => setSelectedSection("Invitations")}
        >
          <Text
            style={[
              styles.sectionText,
              selectedSection === "Invitations" && styles.sectionTextActive,
            ]}
          >
            Invitations
          </Text>
        </TouchableOpacity>
      </View>

      {/* "Create Group" Button */}
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={() => setIsCreatingGroup(true)}
      >
        <Ionicons name="add-circle" size={32} color="#fff" />
        <Text style={styles.createGroupText}>Create a Group</Text>
      </TouchableOpacity>

      {/* Group Creation Modal */}
      {isCreatingGroup && (
        <Animated.View
          style={styles.modalOverlay}
          entering={FadeInDown.duration(300)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create a New Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Group Name"
              value={groupName}
              onChangeText={setGroupName}
              placeholderTextColor="#888"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsCreatingGroup(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateGroup}
              >
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Render selected section content */}
      {selectedSection === "My Groups" ? (
        <>
          {/* Group List */}
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={renderGroupItem}
            contentContainerStyle={styles.groupList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No groups yet. Create one!</Text>
              </View>
            }
          />
        </>
      ) : (
        <>
          {/* Invitations Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Group Invitations</Text>
          </View>
          <FlatList
            data={invitations}
            keyExtractor={(item) => item.id}
            renderItem={renderInvitationItem}
            contentContainerStyle={styles.invitationList}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8F9",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8F9",
  },
  sectionSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  sectionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  sectionButtonActive: { backgroundColor: "#26A480" },
  sectionText: { fontSize: 16, color: "#26A480", fontWeight: "bold" },
  sectionTextActive: { color: "#fff" },
  createGroupButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#26A480",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: "center",
  },
  createGroupText: {
    fontSize: 18,
    color: "#fff",
    marginLeft: 10,
  },
  groupCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  groupMembers: {
    fontSize: 14,
    color: "#777",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  createButton: {
    backgroundColor: "#26A480",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#26A480",
    textAlign: "center",
  },
  invitationList: {
    paddingBottom: 20,
  },
  invitationCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  invitationText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  invitationDetails: {
    fontSize: 14,
    color: "#777",
  },
  invitationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: "#26A480",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: "#FF6B6B",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  groupList: {
    marginTop: 20,
  },
  sectionHeader: {
    marginBottom: 10,
    paddingLeft: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
