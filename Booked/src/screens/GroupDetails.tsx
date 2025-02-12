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
import { db, auth } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import { Calendar } from "react-native-calendars";
import * as CalendarAPI from "expo-calendar";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function GroupDetails({ route, navigation }: any) {
  const { groupId } = route.params;
  const { user } = useUser();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [showAvailability, setShowAvailability] = useState(false);
  const [selectedDates, setSelectedDates] = useState({});
  const [events, setEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

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

  // Requests calendar access and fetch events
  const requestCalendarAccess = async () => {
    const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Enable calendar access in settings.");
      return;
    }
    fetchCalendarEvents();
  };

  // Fetches calendar events from the device
  const fetchCalendarEvents = async () => {
    try {
      setCalendarLoading(true);
      const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
      const defaultCalendar = calendars.find((cal) => cal.allowsModifications);
      if (!defaultCalendar) {
        Alert.alert("No Editable Calendar Found");
        return;
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const events = await CalendarAPI.getEventsAsync([defaultCalendar.id], startDate, endDate);

      // Formats events to store in Firestore
      const formattedEvents = events.map((event) => ({
        title: event.title,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
      }));

      // Stores events in Firestore
      await setDoc(doc(db, "users", auth.currentUser.uid), { availability: formattedEvents }, { merge: true });
      setEvents(formattedEvents);
      Alert.alert("Success", "Calendar events synced!");
    } catch (error) {
      Alert.alert("Error", "Failed to fetch calendar events.");
    } finally {
      setCalendarLoading(false);
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

  // Renders availability calendar
  const renderAvailabilityCalendar = () => (
    <View style={styles.availabilityContainer}>
      <Calendar
        onDayPress={(day) => {
          const updatedDates = { ...selectedDates };
          if (updatedDates[day.dateString]) {
            delete updatedDates[day.dateString];
          } else {
            updatedDates[day.dateString] = { selected: true, selectedColor: "#26A480" };
          }
          setSelectedDates(updatedDates);
        }}
        markedDates={selectedDates}
        theme={{
          backgroundColor: "#fff",
          calendarBackground: "#fff",
          textSectionTitleColor: "#555",
          selectedDayBackgroundColor: "#26A480",
          selectedDayTextColor: "#fff",
          todayTextColor: "#26A480",
          dayTextColor: "#555",
          textDisabledColor: "#ccc",
          arrowColor: "#26A480",
        }}
      />
      <TouchableOpacity
        style={styles.shareButton}
        onPress={handleShareAvailability}
      >
        <Text style={styles.shareButtonText}>Share Availability</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setShowAvailability(false)}
      >
        <Ionicons name="close" size={24} color="#555" />
      </TouchableOpacity>
    </View>
  );

  // Renders settings menu
  const renderMenu = () => (
    <Modal visible={showMenu} transparent animationType="fade">
      <TouchableOpacity
        style={styles.menuOverlay}
        activeOpacity={1}
        onPress={() => setShowMenu(false)}
      >
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              Alert.alert("Info", "Invite members feature coming soon!");
            }}
          >
            <Ionicons name="person-add" size={20} color="#555" />
            <Text style={styles.menuItemText}>Invite Members</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              Alert.alert("Info", "Edit group name feature coming soon!");
            }}
          >
            <Ionicons name="create" size={20} color="#555" />
            <Text style={styles.menuItemText}>Edit Group Name</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              setShowAvailability(true);
            }}
          >
            <Ionicons name="calendar" size={20} color="#555" />
            <Text style={styles.menuItemText}>View Availability</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              Alert.alert("Info", "Delete group feature coming soon!");
            }}
          >
            <Ionicons name="trash" size={20} color="#FF6B6B" />
            <Text style={[styles.menuItemText, { color: "#FF6B6B" }]}>
              Delete Group
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
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

        {/* Sync Calendar Button */}
        <TouchableOpacity onPress={requestCalendarAccess} style={styles.syncButton}>
          {calendarLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="sync-outline" size={24} color="#fff" />
              <Text style={styles.syncText}>Sync Calendar</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Availability Modal */}
        {showAvailability && renderAvailabilityCalendar()}

        {/* Settings Menu Modal */}
        {renderMenu()}
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
  syncButton: {
    flexDirection: "row",
    backgroundColor: "#26A480",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 10,
  },
  syncText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 5,
  },
});