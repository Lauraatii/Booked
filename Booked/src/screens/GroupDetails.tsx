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
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion, setDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import { Calendar } from "react-native-calendars";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";

const { width, height } = Dimensions.get("window");

export default function GroupDetails({ route, navigation }: any) {
  const { groupId } = route.params;
  const { user } = useUser();
  const [group, setGroup] = useState<any>({ name: "", members: [] });
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [showAvailability, setShowAvailability] = useState(false);
  const [selectedDates, setSelectedDates] = useState({});
  const [groupAvailability, setGroupAvailability] = useState({});
  const [overlappingDates, setOverlappingDates] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);

        if (groupSnap.exists()) {
          setGroup({ id: groupSnap.id, ...groupSnap.data() });
          setMessages(groupSnap.data().messages || []); // Loads chat messages
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

  // Handles sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const groupRef = doc(db, "groups", groupId);
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        sender: user.email,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(groupRef, {
        messages: arrayUnion(newMessage),
      });

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    } catch (error) {
      Alert.alert("Error", "Failed to send message.");
    }
  };

  // Shares availability with the group
  const handleShareAvailability = async () => {
    if (Object.keys(selectedDates).length === 0) {
      Alert.alert("Error", "Please select at least one date.");
      return;
    }

    try {
      const groupRef = doc(db, "groups", groupId);
      const availabilityMessage = {
        id: Date.now().toString(),
        type: "availability",
        sender: user.email,
        dates: selectedDates,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(groupRef, {
        messages: arrayUnion(availabilityMessage),
      });

      setMessages((prev) => [...prev, availabilityMessage]);
      setSelectedDates({});
      setShowAvailability(false);
      Alert.alert("Success", "Availability shared!");
    } catch (error) {
      Alert.alert("Error", "Failed to share availability.");
    }
  };

  // Sync group calendars
  const syncGroupCalendars = async () => {
    try {
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const members = groupSnap.data().members || [];
        const availability: Record<string, any> = {};

        for (const member of members) {
          const userRef = doc(db, "users", member);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists() && userSnap.data().availability) {
            availability[member] = userSnap.data().availability;
          }
        }

        setGroupAvailability(availability);
        setOverlappingDates(findOverlappingDates(availability));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to sync group calendars.");
    }
  };

  // Finds overlapping free dates
  const findOverlappingDates = (availability: Record<string, any>) => {
    const memberAvailabilities = Object.values(availability);
    if (memberAvailabilities.length === 0) return [];

    const dateCounts: Record<string, number> = {};

    memberAvailabilities.forEach((availability) => {
      availability.forEach((event: any) => {
        const date = new Date(event.startDate).toISOString().split("T")[0];
        dateCounts[date] = (dateCounts[date] || 0) + 1;
      });
    });

    const overlappingDates = Object.keys(dateCounts).filter(
      (date) => dateCounts[date] === memberAvailabilities.length
    );

    return overlappingDates;
  };

  // Renders overlapping dates
  const renderOverlappingDates = () => {
    if (overlappingDates.length === 0) {
      return <Text style={styles.noDatesText}>No overlapping dates found.</Text>;
    }

    return (
      <View style={styles.overlappingDatesContainer}>
        <Text style={styles.overlappingDatesTitle}>Overlapping Dates:</Text>
        {overlappingDates.map((date, index) => (
          <Text key={index} style={styles.overlappingDate}>
            {new Date(date).toLocaleDateString()}
          </Text>
        ))}
      </View>
    );
  };

  // Renders chat messages
  const renderMessage = ({ item }: any) => {
    if (item.type === "availability") {
      return (
        <TouchableOpacity
          style={styles.availabilityMessage}
          onPress={() => setShowAvailability(true)}
        >
          <Ionicons name="calendar" size={20} color="#26A480" />
          <Text style={styles.availabilityMessageText}>
            {item.sender} shared their availability.
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.sender === user.email ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  // Invite via Link
  const handleCopyInviteLink = () => {
    const inviteLink = `${Linking.createURL("/groupDetails")}?groupId=${groupId}`;
    Clipboard.setString(inviteLink); 
    Alert.alert("Link copied", "The invite link has been copied to your clipboard!");
  };

  // Invite via Email
  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert("Error", "Please enter an email address.");
      return;
    }

    try {
      const inviteRef = await addDoc(collection(db, "invitations"), {
        groupId,
        invitedUser: inviteEmail,
        inviter: user.email,
        status: "pending",
        message: "Join my group!",
      });

      Alert.alert("Success", "Invitation sent via email!");
    } catch (error) {
      Alert.alert("Error", "Failed to send the invitation.");
    }
  };

  // Edit Group Info
  const handleEditGroupName = async () => {
    if (!newGroupName.trim()) {
      Alert.alert("Error", "Please enter a valid group name.");
      return;
    }

    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        name: newGroupName,
      });
      setGroup({ ...group, name: newGroupName });
      setShowEditModal(false);
      Alert.alert("Success", "Group name updated!");
    } catch (error) {
      Alert.alert("Error", "Failed to update group name.");
    }
  };

  // Search for users to add to the group
  const handleSearchUser = async () => {
    if (!searchQuery.trim()) return;

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", searchQuery));
      const querySnapshot = await getDocs(q);

      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
      }));

      setSearchResults(results);
    } catch (error) {
      Alert.alert("Error", "Failed to search users.");
    }
  };

  // Add selected user to the group
  const handleAddMember = async (userId: string) => {
    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
      });

      setGroup((prevGroup) => ({
        ...prevGroup,
        members: [...prevGroup.members, userId],
      }));

      Alert.alert("Success", "User added to the group!");
    } catch (error) {
      Alert.alert("Error", "Failed to add member.");
    }
  };

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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header with Group Name and Menu */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#26A480" />
          </TouchableOpacity>
          <Text style={styles.groupName} numberOfLines={1} ellipsizeMode="tail">
            {group.name}
          </Text>
          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <Ionicons name="ellipsis-vertical" size={24} color="#26A480" />
          </TouchableOpacity>
        </View>

        {/* Search for Users */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a user"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={handleSearchUser} style={styles.searchButton}>
            <Ionicons name="search" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Display Search Results */}
        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.searchResultItem}>
                <Text style={styles.searchResultText}>{item.email}</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddMember(item.id)}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
            style={styles.searchResultsContainer}
          />
        )}

        {/* Chat Section */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          style={styles.chatList}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Ionicons name="send" size={24} color="#26A480" />
          </TouchableOpacity>
        </View>

        {/* Availability Modal */}
        {showAvailability && renderAvailabilityCalendar()}

        {/* Overlapping Dates Section */}
        {renderOverlappingDates()}

        {/* Settings Menu Modal */}
        <Modal visible={showMenu} transparent animationType="fade">
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          >
            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleCopyInviteLink}
              >
                <Ionicons name="link" size={20} color="#555" />
                <Text style={styles.menuItemText}>Copy Invite Link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowEditModal(true)}
              >
                <Ionicons name="create" size={20} color="#555" />
                <Text style={styles.menuItemText}>Edit Group Name</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleInviteByEmail}
              >
                <Ionicons name="mail" size={20} color="#555" />
                <Text style={styles.menuItemText}>Invite via Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={syncGroupCalendars}
              >
                <Ionicons name="sync" size={20} color="#555" />
                <Text style={styles.menuItemText}>Sync Group Calendars</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowMenu(false)}
              >
                <Ionicons name="close" size={20} color="#555" />
                <Text style={styles.menuItemText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Edit Group Name Modal */}
        {showEditModal && (
          <Modal visible={showEditModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  placeholder="New Group Name"
                  placeholderTextColor="#888"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowEditModal(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleEditGroupName}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#26A480",
    flex: 1,
    marginHorizontal: 10,
    textAlign: "center",
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  chatList: {
    flex: 1,
  },
  messageContainer: {
    maxWidth: width * 0.7,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#26A480",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  messageTime: {
    fontSize: 12,
    color: "#D9FFF5",
    marginTop: 4,
  },
  availabilityMessage: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    marginBottom: 8,
  },
  availabilityMessageText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  sendButton: {
    padding: 8,
  },
  availabilityContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  shareButton: {
    backgroundColor: "#26A480",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  shareButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
  },
  menuOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: width * 0.8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuItemText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 10,
  },
  overlappingDatesContainer: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    margin: 16,
  },
  overlappingDatesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#26A480",
    marginBottom: 10,
  },
  overlappingDate: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  noDatesText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    margin: 16,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  searchButton: {
    padding: 10,
  },
  searchResultsContainer: {
    padding: 10,
  },
  searchResultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
  },
  searchResultText: {
    fontSize: 16,
    color: "#555",
  },
  addButton: {
    backgroundColor: "#26A480",
    padding: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
function renderAvailabilityCalendar(): React.ReactNode {
  throw new Error("Function not implemented.");
}

