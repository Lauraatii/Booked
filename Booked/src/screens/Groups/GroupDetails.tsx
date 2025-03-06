import React, { useState, useEffect, useRef } from "react";
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
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../../firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUser } from "../../context/UserContext";

const { width, height } = Dimensions.get("window");

export default function GroupDetails({ route, navigation }: any) {
  const { groupId } = route.params;
  const { user } = useUser();
  const [group, setGroup] = useState<any>({ name: "", members: [], image: null });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [showAvailability, setShowAvailability] = useState(false);
  const [selectedDates, setSelectedDates] = useState({});
  const [groupAvailability, setGroupAvailability] = useState({});
  const [overlappingDates, setOverlappingDates] = useState<string[]>([]);
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showPlusModal, setShowPlusModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);

        if (groupSnap.exists()) {
          setGroup({ id: groupSnap.id, ...groupSnap.data() });
          setMessages(groupSnap.data().messages || []);
          setGroupImage(groupSnap.data().image || null);
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
      scrollToBottom();
    } catch (error) {
      Alert.alert("Error", "Failed to send message.");
    }
  };

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

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    if (offsetY + layoutHeight < contentHeight - 50) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return `Today, ${messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return `${messageDate.toLocaleDateString()}, ${messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
  };

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
          {formatMessageTime(item.timestamp)}
        </Text>
      </View>
    );
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
        {/* Header with Group Name, Image, and Icons */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#26A480" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("GroupInfo", { groupId })}
            style={styles.groupInfoContainer}
          >
            {groupImage ? (
              <Image source={{ uri: groupImage }} style={styles.groupImage} />
            ) : (
              <Ionicons name="people" size={32} color="#26A480" />
            )}
            <Text style={styles.groupName} numberOfLines={1} ellipsizeMode="tail">
              {group.name}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAvailability(true)}>
            <Ionicons name="calendar" size={24} color="#26A480" />
          </TouchableOpacity>
        </View>

        {/* Chat Section */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          style={styles.chatList}
          onContentSizeChange={() => scrollToBottom()}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <TouchableOpacity
            style={styles.scrollToBottomButton}
            onPress={scrollToBottom}
          >
            <Ionicons name="arrow-down" size={24} color="#26A480" />
          </TouchableOpacity>
        )}

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => setShowPlusModal(true)}
          >
            <Ionicons name="add" size={24} color="#26A480" />
          </TouchableOpacity>
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

        {/* Plus Button Modal */}
        <Modal
          visible={showPlusModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPlusModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.plusModalContent}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowPlusModal(false);
                  setShowAvailability(true);
                }}
              >
                <Ionicons name="calendar" size={24} color="#26A480" />
                <Text style={styles.modalOptionText}>Share Availability</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowPlusModal(false);
                  Alert.alert("Info", "Share image functionality to be implemented.");
                }}
              >
                <Ionicons name="image" size={24} color="#26A480" />
                <Text style={styles.modalOptionText}>Share Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowPlusModal(false);
                  Alert.alert("Info", "Share document functionality to be implemented.");
                }}
              >
                <Ionicons name="document" size={24} color="#26A480" />
                <Text style={styles.modalOptionText}>Share Document</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowPlusModal(false);
                  Alert.alert("Info", "Create poll functionality to be implemented.");
                }}
              >
                <Ionicons name="podium" size={24} color="#26A480" />
                <Text style={styles.modalOptionText}>Create Poll</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowPlusModal(false);
                  Alert.alert("Info", "Create event functionality to be implemented.");
                }}
              >
                <Ionicons name="create" size={24} color="#26A480" />
                <Text style={styles.modalOptionText}>Create Event</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPlusModal(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Overlapping Dates Modal */}
        {showAvailability && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Group Availability</Text>
              {renderOverlappingDates()}
              <TouchableOpacity
                style={styles.syncButton}
                onPress={syncGroupCalendars}
              >
                <Text style={styles.buttonText}>Sync Calendars</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAvailability(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8F9",
  },
  container: {
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  groupInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 10,
  },
  groupImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#26A480",
    flex: 1,
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
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  plusButton: {
    padding: 8,
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
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  plusModalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#26A480",
    marginLeft: 10,
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
    marginBottom: 15,
    textAlign: "center",
  },
  syncButton: {
    backgroundColor: "#26A480",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: "#26A480",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  overlappingDatesContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  scrollToBottomButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});