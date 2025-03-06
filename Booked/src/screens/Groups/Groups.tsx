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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../../firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useUser } from "../../context/UserContext";
import * as Contacts from 'expo-contacts'; // For syncing contacts

export default function Groups({ navigation }: any) {
  const { user } = useUser();
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch groups
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

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
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

  // Sync contacts and invite them to the app
  const syncContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        const contactList = data.map((contact) => ({
          name: contact.name,
          phone: contact.phoneNumbers?.[0]?.number,
          email: contact.emails?.[0]?.email,
        }));

        // Display a list of contacts to invite
        Alert.alert(
          "Invite Friends",
          "Select contacts to invite to the app.",
          contactList.map((contact) => ({
            text: contact.name || contact.phone || contact.email,
            onPress: () => inviteContact(contact),
          }))
        );
      } else {
        Alert.alert("No Contacts", "No contacts found on your device.");
      }
    } else {
      Alert.alert("Permission Denied", "Please grant contact access to sync contacts.");
    }
  };

  const inviteContact = (contact: any) => {
    // Implement your logic to send an invite (e.g., via email or SMS)
    Alert.alert("Invite Sent", `Invite sent to ${contact.name || contact.phone || contact.email}`);
  };

  const renderGroupItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => navigation.navigate("GroupDetails", { groupId: item.id })}
    >
      <View style={styles.groupIcon}>
        <Ionicons name="people" size={24} color="#26A480" />
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupMembers}>
          {item.members.length} member{item.members.length !== 1 && "s"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
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
      {/* Header with Sync Contacts and Create Group Buttons */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Groups</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={syncContacts} style={styles.syncButton}>
            <Ionicons name="person-add" size={24} color="#26A480" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsCreatingGroup(true)} style={styles.createGroupButton}>
            <Ionicons name="add" size={24} color="#26A480" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Group Creation Modal */}
      {isCreatingGroup && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create a New Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Group Name"
              value={groupName}
              onChangeText={setGroupName}
              placeholderTextColor="#888"
              maxLength={30}
            />
            <Text style={styles.charLimit}>{groupName.length}/30</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsCreatingGroup(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateGroup}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
            <Ionicons name="people-outline" size={50} color="#26A480" />
            <Text style={styles.emptyText}>No groups yet. Create one!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8F9",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8F9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  syncButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
  },
  createGroupButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  groupIcon: {
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
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
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    color: "#333",
  },
  charLimit: {
    fontSize: 12,
    color: "#888",
    textAlign: "right",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  createButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#26A480",
    alignItems: "center",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#26A480",
    textAlign: "center",
    marginTop: 10,
  },
  groupList: {
    paddingBottom: 20,
  },
});