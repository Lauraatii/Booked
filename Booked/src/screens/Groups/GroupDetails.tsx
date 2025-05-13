import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  NativeSyntheticEvent,
  NativeScrollEvent
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../../firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUser } from "../../context/UserContext";
import { globalStyles, ModalButton } from "../../styles/globalStyles";
import DateTimePicker from '@react-native-community/datetimepicker';

// Type definitions
type Group = {
  id: string;
  name: string;
  members: string[];
  image: string | null;
  messages?: Message[];
  availability?: Availability[];
};

type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  type?: "text" | "availability";
};

type Availability = {
  userId: string;
  dates: DateBlock[];
  status: "pending" | "approved";
};

type DateBlock = {
  start: string;
  end: string;
  title?: string;
};

type GroupDetailsProps = {
  route: {
    params: {
      groupId: string;
    };
  };
  navigation: any;
};

type IconName = "calendar" | "image" | "document-text" | "stats-chart" | "pencil" | 
                "add" | "send" | "arrow-back" | "people" | "create";

type FlattenedMessage = {
  id: string;
  type: 'header' | 'message';
  data: string | Message;
};

export default function GroupDetails({ route, navigation }: GroupDetailsProps) {
  const { groupId } = route.params;
  const { user } = useUser();
  
  // State management with proper types
  const [group, setGroup] = useState<Group>({ 
    id: "", 
    name: "", 
    members: [], 
    image: null 
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAvailability, setShowAvailability] = useState<boolean>(false);
  const [showPlusModal, setShowPlusModal] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date>(new Date());
  const [availabilityTitle, setAvailabilityTitle] = useState<string>("");
  const [viewMode, setViewMode] = useState<"view" | "share" | "approve">("view");
  
  // Refs with proper types
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const isScrolling = useRef<boolean>(false);
  const shouldScrollToEnd = useRef<boolean>(true);
  const isInitialLoad = useRef<boolean>(true);
  const keyboardHeight = useRef<number>(0);

  const plusModalOptions: { icon: IconName; text: string }[] = [
    { icon: "calendar", text: "Share Availability" },
    { icon: "image", text: "Share Image" },
    { icon: "document-text", text: "Share Document" },
    { icon: "stats-chart", text: "Create Poll" },
    { icon: "pencil", text: "Create Event" }
  ];

  const formatMessageDate = (timestamp: string): string => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const formatMessageTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const scrollToBottom = useCallback((animated = true) => {
    if (!isScrolling.current && flatListRef.current && messages.length > 0) {
      isScrolling.current = true;
      flatListRef.current.scrollToEnd({ animated });
      setTimeout(() => {
        isScrolling.current = false;
      }, 300);
    }
  }, [messages]);

  const handleScroll = useCallback(({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
    const paddingToBottom = 50;
    shouldScrollToEnd.current = 
      contentOffset.y + layoutMeasurement.height >= 
      contentSize.height - paddingToBottom;
  }, []);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);

        if (groupSnap.exists()) {
          const groupData = groupSnap.data();
          setGroup({ 
            id: groupSnap.id, 
            name: groupData.name || "",
            members: groupData.members || [],
            image: groupData.image || null,
            availability: groupData.availability || []
          });
          const initialMessages = groupData.messages || [];
          setMessages(initialMessages);
          
          setTimeout(() => {
            shouldScrollToEnd.current = true;
            scrollToBottom(false);
          }, 300);
        } else {
          Alert.alert("Error", "Group not found.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
        Alert.alert("Error", "Failed to fetch group details.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId, navigation, scrollToBottom]);

  useEffect(() => {
    if (!isInitialLoad.current && shouldScrollToEnd.current) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
    isInitialLoad.current = false;
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        keyboardHeight.current = e.endCoordinates.height;
        if (shouldScrollToEnd.current) {
          scrollToBottom();
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        keyboardHeight.current = 0;
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [scrollToBottom]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const groupRef = doc(db, "groups", groupId);
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: message,
        sender: user?.email || "unknown",
        timestamp: new Date().toISOString(),
        type: "text"
      };

      await updateDoc(groupRef, {
        messages: arrayUnion(newMessage),
      });

      setMessages(prev => [...prev, newMessage]);
      setMessage("");
      shouldScrollToEnd.current = true;
      
      setTimeout(() => {
        scrollToBottom();
      }, 150);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message.");
    }
  };

  const getFlattenedMessages = useCallback((): FlattenedMessage[] => {
    const flattened: FlattenedMessage[] = [];
    let currentDate = '';

    messages.forEach((message, index) => {
      const messageDate = formatMessageDate(message.timestamp);
      
      if (messageDate !== currentDate) {
        flattened.push({
          id: `header-${messageDate}-${index}`,
          type: 'header',
          data: messageDate
        });
        currentDate = messageDate;
      }
      
      flattened.push({
        id: message.id || `message-${index}-${Date.now()}`,
        type: 'message',
        data: message
      });
    });
    
    return flattened;
  }, [messages]);

  const renderItem = useCallback(({ item }: { item: FlattenedMessage }) => {
    if (item.type === 'header') {
      return (
        <View style={globalStyles.dateHeaderContainer}>
          <View style={globalStyles.dateHeaderBackground}>
            <Text style={globalStyles.dateHeaderText}>{item.data as string}</Text>
          </View>
        </View>
      );
    }

    const message = item.data as Message;
    if (message.type === "availability") {
      return (
        <View style={globalStyles.availabilityContainer}>
          <TouchableOpacity
            style={globalStyles.availabilityMessage}
            onPress={() => {
              setShowAvailability(true);
              setViewMode("view");
            }}
          >
            <Ionicons 
              name="calendar" 
              size={20} 
              color="#5967EB" 
              style={globalStyles.calendarIcon} 
            />
            <Text style={globalStyles.availabilityMessageText}>
              {message.sender} shared their availability
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View
        style={[
          globalStyles.messageContainer, 
          message.sender === user?.email ? globalStyles.myMessage : globalStyles.otherMessage,
        ]}
      >
        <Text style={globalStyles.messageText}>{message.text}</Text>
        <Text style={globalStyles.messageTime}>
          {formatMessageTime(message.timestamp)}
        </Text>
      </View>
    );
  }, [user?.email]);

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#5967EB" />
        <Text style={globalStyles.loadingText}>Loading group details...</Text>
      </View>
    );
  }

  const flattenedMessages = getFlattenedMessages();

  return (
    <SafeAreaView style={globalStyles.groupChatContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header Section */}
        <View style={globalStyles.chatHeader}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={globalStyles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="#5967EB" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate("GroupInfo", { groupId })}
            style={globalStyles.groupInfoButton}
          >
            {group.image ? (
              <Image 
                source={{ uri: group.image }} 
                style={globalStyles.smallGroupImage} 
              />
            ) : (
              <Ionicons 
                name="people" 
                size={24} 
                color="#5967EB" 
                style={globalStyles.groupIcon} 
              />
            )}
            <Text style={globalStyles.groupName} numberOfLines={1}>
              {group.name}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              setShowAvailability(true);
              setViewMode("view");
            }}
            style={globalStyles.headerButton}
          >
            <Ionicons name="calendar" size={24} color="#5967EB" />
          </TouchableOpacity>
        </View>

        {/* Chat Section */}
        <FlatList
          ref={flatListRef}
          data={flattenedMessages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            globalStyles.chatContainer,
            { paddingBottom: 20 }
          ]}
          style={{ flex: 1 }}
          onContentSizeChange={() => {
            if (shouldScrollToEnd.current) {
              scrollToBottom(false);
            }
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 50
          }}
          onScrollToIndexFailed={() => {
            scrollToBottom(false);
          }}
          inverted={false}
          removeClippedSubviews={false}
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={21}
          updateCellsBatchingPeriod={50}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />

        {/* Scroll to bottom button */}
        <TouchableOpacity
          style={globalStyles.scrollToBottomButton}
          onPress={() => scrollToBottom()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-down" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Input Section */}
        <View style={globalStyles.inputContainer}>
          <TouchableOpacity
            style={globalStyles.plusButton}
            onPress={() => setShowPlusModal(true)}
          >
            <Ionicons name="add" size={28} color="#5967EB" />
          </TouchableOpacity>
          
          <TextInput
            ref={inputRef}
            style={globalStyles.chatInput}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            value={message}
            onChangeText={setMessage}
            multiline
            blurOnSubmit={false}
            onSubmitEditing={handleSendMessage}
          />
          
          <TouchableOpacity 
            style={globalStyles.sendButton}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Ionicons 
              name="send" 
              size={28} 
              color={message.trim() ? "#5967EB" : "#888"} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Plus Options Modal */}
      <Modal
        visible={showPlusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPlusModal(false)}
      >
        <TouchableOpacity 
          style={globalStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPlusModal(false)}
        >
          <View style={globalStyles.plusModalContent}>
            {plusModalOptions.map((item, index) => (
              <TouchableOpacity
                key={`option-${index}`}
                style={globalStyles.modalOption}
                onPress={() => {
                  setShowPlusModal(false);
                  if (item.icon === "calendar") {
                    setViewMode("share");
                    setShowDatePicker(true);
                  } else {
                    Alert.alert("Info", `${item.text} functionality to be implemented.`);
                  }
                }}
              >
                <Ionicons name={item.icon} size={24} color="#5967EB" />
                <Text style={globalStyles.modalOptionText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}