import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
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
import { globalStyles, ModalButton } from "../../styles/globalStyles";

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
      return <Text style={globalStyles.noDatesText}>No overlapping dates found.</Text>;
    }

    return (
      <View style={globalStyles.overlappingDatesContainer}>
        <Text style={globalStyles.overlappingDatesTitle}>Overlapping Dates:</Text>
        {overlappingDates.map((date, index) => (
          <Text key={index} style={globalStyles.overlappingDate}>
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
          style={globalStyles.availabilityMessage}
          onPress={() => setShowAvailability(true)}
        >
          <Ionicons name="calendar" size={20} color="#5967EB" />
          <Text style={globalStyles.availabilityMessageText}>
            {item.sender} shared their availability.
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={[
          globalStyles.messageContainer,
          item.sender === user.email ? globalStyles.myMessage : globalStyles.otherMessage,
        ]}
      >
        <Text style={globalStyles.messageText}>{item.text}</Text>
        <Text style={globalStyles.messageTime}>
          {formatMessageTime(item.timestamp)}
        </Text>
      </View>
    );
  };

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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={globalStyles.groupChatContainer}>
          {/* Header with Group Name, Image, and Icons */}
          <View style={globalStyles.chatHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#5967EB" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("GroupInfo", { groupId })}
              style={globalStyles.groupInfoButton}
            >
              {groupImage ? (
                <Image source={{ uri: groupImage }} style={globalStyles.smallGroupImage} />
              ) : (
                <Ionicons name="people" size={24} color="#5967EB" />
              )}
              <Text style={globalStyles.groupName} numberOfLines={1} ellipsizeMode="tail">
                {group.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAvailability(true)}>
              <Ionicons name="calendar" size={24} color="#5967EB" />
            </TouchableOpacity>
          </View>

          {/* Chat Section */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={globalStyles.chatContainer}
            style={{ flex: 1 }}
            onContentSizeChange={() => scrollToBottom()}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <TouchableOpacity
              style={globalStyles.scrollToBottomButton}
              onPress={scrollToBottom}
            >
              <Ionicons name="arrow-down" size={24} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Message Input */}
          <View style={globalStyles.inputContainer}>
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => setShowPlusModal(true)}
            >
              <Ionicons name="add" size={24} color="#5967EB" />
            </TouchableOpacity>
            <TextInput
              style={globalStyles.chatInput}
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              placeholderTextColor="#888"
            />
            <TouchableOpacity style={{ padding: 8 }} onPress={handleSendMessage}>
              <Ionicons name="send" size={24} color="#5967EB" />
            </TouchableOpacity>
          </View>

          {/* Plus Button Modal */}
          <Modal
            visible={showPlusModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowPlusModal(false)}
          >
            <View style={globalStyles.modalOverlay}>
              <View style={globalStyles.plusModalContent}>
                <TouchableOpacity
                  style={globalStyles.modalOption}
                  onPress={() => {
                    setShowPlusModal(false);
                    setShowAvailability(true);
                  }}
                >
                  <Ionicons name="calendar" size={24} color="#5967EB" />
                  <Text style={globalStyles.modalOptionText}>Share Availability</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={globalStyles.modalOption}
                  onPress={() => {
                    setShowPlusModal(false);
                    Alert.alert("Info", "Share image functionality to be implemented.");
                  }}
                >
                  <Ionicons name="image" size={24} color="#5967EB" />
                  <Text style={globalStyles.modalOptionText}>Share Image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={globalStyles.modalOption}
                  onPress={() => {
                    setShowPlusModal(false);
                    Alert.alert("Info", "Share document functionality to be implemented.");
                  }}
                >
                  <Ionicons name="document" size={24} color="#5967EB" />
                  <Text style={globalStyles.modalOptionText}>Share Document</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={globalStyles.modalOption}
                  onPress={() => {
                    setShowPlusModal(false);
                    Alert.alert("Info", "Create poll functionality to be implemented.");
                  }}
                >
                  <Ionicons name="podium" size={24} color="#5967EB" />
                  <Text style={globalStyles.modalOptionText}>Create Poll</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={globalStyles.modalOption}
                  onPress={() => {
                    setShowPlusModal(false);
                    Alert.alert("Info", "Create event functionality to be implemented.");
                  }}
                >
                  <Ionicons name="create" size={24} color="#5967EB" />
                  <Text style={globalStyles.modalOptionText}>Create Event</Text>
                </TouchableOpacity>
                <View style={globalStyles.modalFooter}>
                  <ModalButton 
                    type="cancel" 
                    onPress={() => setShowPlusModal(false)}
                  >
                    Close
                  </ModalButton>
                </View>
              </View>
            </View>
          </Modal>

          {/* Overlapping Dates Modal */}
          {showAvailability && (
            <View style={globalStyles.modalOverlay}>
              <View style={globalStyles.modalContent}>
                <Text style={globalStyles.modalTitle}>Group Availability</Text>
                {renderOverlappingDates()}
                <View style={globalStyles.modalFooter}>
                  <ModalButton 
                    type="cancel" 
                    onPress={() => setShowAvailability(false)}
                  >
                    Close
                  </ModalButton>
                  <ModalButton 
                    onPress={syncGroupCalendars}
                  >
                    Sync Calendars
                  </ModalButton>
                </View>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}