import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Switch,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as CalendarAPI from "expo-calendar";
import { auth, db } from "../../../firebaseConfig";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { globalStyles, eventStyles } from "../../styles/globalStyles";

// Type definitions
type EventSource = 'local' | 'cloud';

type Event = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  isBusy: boolean;
  category: string;
  allDay?: boolean;
  repeatOption?: string;
  reminderOption?: string;
  notes?: string;
  participants?: string[];
  source?: EventSource;
};

type EventData = {
  title: string;
  description: string;
  startDate: Date;
  startTime: Date;
  endDate: Date;
  endTime: Date;
  isAllDay: boolean;
  category: string;
  customCategory: string;
  repeatOption: string;
  reminderOption: string;
  notes: string;
  participants: string;
};

type DateTimePickerState = {
  startDate: boolean;
  startTime: boolean;
  endDate: boolean;
  endTime: boolean;
};

type SyncStatus = {
  type: 'error' | 'success' | 'info';
  message: string;
  id: string;
};

const EVENT_CATEGORIES = [
  { name: "Work", color: "#5967EB" },
  { name: "Personal", color: "#FF6B6B" },
  { name: "Meeting", color: "#26A480" },
  { name: "Travel", color: "#FFA500" },
  { name: "Other", color: "#888" },
];

const REPEAT_OPTIONS = ["None", "Daily", "Weekly", "Monthly", "Yearly"];
const REMINDER_OPTIONS = [
  "None",
  "5 minutes before",
  "10 minutes before",
  "15 minutes before",
  "30 minutes before",
  "1 hour before",
  "1 day before",
];

const Notification = ({ status, onClose }: { status: SyncStatus, onClose: () => void }) => {
  // Using useRef to maintain consistent animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    // Reset animation values each time the notification appears
    fadeAnim.setValue(0);
    slideAnim.setValue(-50);
    
    // Slide in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [status.id]);

  // Extracted close animation to a separate function
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const getStatusStyle = () => {
    switch (status.type) {
      case 'error':
        return eventStyles.errorStatus;
      case 'success':
        return eventStyles.successStatus;
      case 'info':
        return eventStyles.infoStatus;
      default:
        return eventStyles.infoStatus;
    }
  };

  const getStatusIcon = () => {
    switch (status.type) {
      case 'error':
        return "warning";
      case 'success':
        return "checkmark-circle";
      case 'info':
        return "information-circle";
      default:
        return "information-circle";
    }
  };

  return (
    <Animated.View
      style={[
        eventStyles.syncStatus,
        getStatusStyle(),
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          zIndex: 10,
        },
      ]}
    >
      <Ionicons 
        name={getStatusIcon()} 
        size={24} 
        color="#fff" 
      />
      <Text style={eventStyles.syncStatusText}>{status.message}</Text>
      <TouchableOpacity 
        onPress={handleClose}
        style={eventStyles.closeStatusButton}
      >
        <Ionicons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Events({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [events, setEvents] = useState<{[key: string]: Event[]}>({});
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateTimePickers, setDateTimePickers] = useState<DateTimePickerState>({
    startDate: false,
    startTime: false,
    endDate: false,
    endTime: false,
  });
  const [eventData, setEventData] = useState<EventData>({
    title: "",
    description: "",
    startDate: new Date(),
    startTime: new Date(),
    endDate: new Date(),
    endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
    isAllDay: false,
    category: "Work",
    customCategory: "",
    repeatOption: "None",
    reminderOption: "None",
    notes: "",
    participants: "",
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isRepeatCollapsed, setIsRepeatCollapsed] = useState(true);
  const [isReminderCollapsed, setIsReminderCollapsed] = useState(true);
  const [hasCalendarPermission, setHasCalendarPermission] = useState(false);

  useEffect(() => {
    fetchUserAvailability();
    checkCalendarPermission();
  }, []);

  const checkCalendarPermission = async () => {
    try {
      const { status } = await CalendarAPI.getCalendarPermissionsAsync();
      setHasCalendarPermission(status === 'granted');
    } catch (error) {
      console.error("Error checking calendar permission:", error);
    }
  };

  const requestCalendarPermission = async () => {
    try {
      setLoading(true);
      const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        showSyncStatus("error", "Calendar permission is required to sync events");
        return false;
      }

      setHasCalendarPermission(true);
      return true;
    } catch (error) {
      console.error("Error requesting calendar permission:", error);
      showSyncStatus("error", "Failed to request calendar permission");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const showSyncStatus = (type: 'error' | 'success' | 'info', message: string) => {
    const status: SyncStatus = {
      type,
      message,
      id: Date.now().toString()
    };
    setSyncStatus(status);
  };

  const dismissSyncStatus = () => {
    setSyncStatus(null);
  };

  const showDateTimePicker = (type: keyof DateTimePickerState) => {
    setDateTimePickers(prev => ({ ...prev, [type]: true }));
  };

  const hideDateTimePicker = (type: keyof DateTimePickerState) => {
    setDateTimePickers(prev => ({ ...prev, [type]: false }));
  };

  const handleDateTimeChange = (
    event: DateTimePickerEvent, 
    selectedDateTime: Date | undefined, 
    type: keyof EventData
  ) => {
    if (selectedDateTime) {
      setEventData(prev => ({ ...prev, [type]: selectedDateTime }));
    }
    hideDateTimePicker(type as keyof DateTimePickerState);
  };

  const syncICloudCalendar = async () => {
    try {
      setLoading(true);
      setSyncStatus(null);

      // First request calendar permissions if we don't have them
      if (!hasCalendarPermission) {
        const permissionGranted = await requestCalendarPermission();
        if (!permissionGranted) return;
      }

      // Request calendar sharing permission
      try {
        const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
          showSyncStatus("error", "Calendar sharing permission is required");
          return;
        }
      } catch (error) {
        console.error("Error requesting calendar sharing permission:", error);
        showSyncStatus("error", "Failed to request calendar sharing permission");
        return;
      }

      const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
      const iCloudCalendars = calendars.filter(cal => 
        cal.source && cal.source.name.includes('iCloud')
      );

      if (iCloudCalendars.length === 0) {
        showSyncStatus("error", "No iCloud calendars found. Please make sure you're signed in to iCloud.");
        return;
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      let cloudEvents: Event[] = [];
      
      for (const calendar of iCloudCalendars) {
        try {
          const events = await CalendarAPI.getEventsAsync(
            [calendar.id],
            startDate,
            endDate
          );

          const formattedEvents: Event[] = events.map(event => ({
            id: event.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: event.title || "Untitled Event",
            startDate: event.startDate ? new Date(event.startDate).toISOString() : new Date().toISOString(),
            endDate: event.endDate ? new Date(event.endDate).toISOString() : new Date().toISOString(),
            description: event.notes || "",
            isBusy: true,
            category: "Other",
            allDay: event.allDay || false,
            source: 'cloud'
          }));

          cloudEvents = [...cloudEvents, ...formattedEvents];
        } catch (error) {
          console.error(`Error fetching events from calendar ${calendar.title}:`, error);
        }
      }

      if (cloudEvents.length === 0) {
        showSyncStatus("info", "No events found in your iCloud calendars for the next 30 days.");
        return;
      }

      const currentEvents = Object.values(events).flat();
      const localEvents = currentEvents.filter(e => e.source === 'local');
      const existingCloudEvents = currentEvents.filter(e => e.source === 'cloud');
      
      const mergedEvents = [
        ...localEvents,
        ...cloudEvents.map(cloudEvent => {
          const existingEvent = existingCloudEvents.find(e => e.id === cloudEvent.id);
          return existingEvent ? {...existingEvent, ...cloudEvent} : cloudEvent;
        })
      ];

      await storeAvailabilityInFirestore(mergedEvents);
      showSyncStatus("success", `Success! Synced ${cloudEvents.length} events from ${iCloudCalendars.length} calendars`);
      
    } catch (error) {
      console.error("iCloud calendar sync error:", error);
      showSyncStatus("error", "Failed to sync iCloud calendar. Please check your iCloud settings.");
    } finally {
      setLoading(false);
    }
  };

  const storeAvailabilityInFirestore = async (events: Event[]) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You need to be logged in to sync events.");
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), { availability: events }, { merge: true });
      fetchUserAvailability();
    } catch (error) {
      console.error("Firestore update error:", error);
      throw error;
    }
  };

  const fetchUserAvailability = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const availability = docSnap.data().availability || [];
        const formattedEvents = availability.reduce((acc: {[key: string]: Event[]}, event: Event) => {
          const date = new Date(event.startDate).toISOString().split("T")[0];
          if (!acc[date]) acc[date] = [];
          acc[date].push(event);
          return acc;
        }, {});
        
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      Alert.alert("Error", "Failed to load your events. Please try again.");
    }
  };

  const handleDayPress = (day: {dateString: string}) => {
    setSelectedDate(day.dateString);
    setEventData(prev => ({
      ...prev,
      startDate: new Date(day.dateString),
      endDate: new Date(day.dateString),
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000)
    }));
    setIsEventModalVisible(true);
    setIsAddingEvent(false);
  };

  const saveEvent = async () => {
    if (!eventData.title) {
      Alert.alert("Error", "Event title is required");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You need to be logged in to save events.");
      return;
    }

    try {
      const newEvent: Event = {
        id: selectedEvent?.id || Date.now().toString(),
        title: eventData.title,
        startDate: new Date(
          `${eventData.startDate.toISOString().split("T")[0]}T${eventData.startTime.toTimeString().split(" ")[0]}`
        ).toISOString(),
        endDate: new Date(
          `${eventData.endDate.toISOString().split("T")[0]}T${eventData.endTime.toTimeString().split(" ")[0]}`
        ).toISOString(),
        description: eventData.description,
        isBusy: true,
        category: eventData.customCategory || eventData.category,
        allDay: eventData.isAllDay,
        repeatOption: eventData.repeatOption,
        reminderOption: eventData.reminderOption,
        notes: eventData.notes,
        participants: eventData.participants.split(",").map(email => email.trim()),
        source: 'local'
      };

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      const existingEvents = docSnap.exists() ? docSnap.data().availability || [] : [];

      const updatedEvents = selectedEvent
        ? existingEvents.map((event: Event) => event.id === selectedEvent.id ? newEvent : event)
        : [...existingEvents, newEvent];

      await updateDoc(docRef, { availability: updatedEvents });
      
      Alert.alert(
        "Success",
        selectedEvent ? "Event updated successfully!" : "Event created successfully!",
        [{ text: "OK", onPress: () => {
          setIsEventModalVisible(false);
          fetchUserAvailability();
        }}]
      );
      
    } catch (error) {
      console.error("Error saving event:", error);
      Alert.alert("Error", "Failed to save event. Please try again.");
    }
  };

  const deleteEvent = async (eventId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      const existingEvents = docSnap.exists() ? docSnap.data().availability || [] : [];
      const updatedEvents = existingEvents.filter((event: Event) => event.id !== eventId);

      await updateDoc(docRef, { availability: updatedEvents });
      Alert.alert("Success", "Event deleted successfully!");
      fetchUserAvailability();
    } catch (error) {
      console.error("Error deleting event:", error);
      Alert.alert("Error", "Failed to delete event. Please try again.");
    }
  };

  const renderEventItem = ({ item }: {item: Event}) => (
    <TouchableOpacity
      style={[
        eventStyles.eventItem, 
        { 
          backgroundColor: EVENT_CATEGORIES.find(cat => cat.name === item.category)?.color || "#888",
          borderLeftWidth: 4,
          borderLeftColor: "#2a0b4e",
          opacity: item.source === 'cloud' ? 0.8 : 1
        }
      ]}
      onPress={() => {
        if (item.source === 'cloud') {
          Alert.alert("Info", "This is a cloud-synced event. Please edit it in your calendar app.");
          return;
        }
        
        setSelectedEvent(item);
        setEventData({
          title: item.title,
          description: item.description || "",
          startDate: new Date(item.startDate),
          startTime: new Date(item.startDate),
          endDate: new Date(item.endDate),
          endTime: new Date(item.endDate),
          isAllDay: item.allDay || false,
          category: item.category,
          customCategory: "",
          repeatOption: item.repeatOption || "None",
          reminderOption: item.reminderOption || "None",
          notes: item.notes || "",
          participants: item.participants?.join(", ") || "",
        });
        setIsAddingEvent(true);
      }}
    >
      <View style={eventStyles.eventDetails}>
        <Text style={eventStyles.eventTitle}>{item.title}</Text>
        <Text style={eventStyles.eventTime}>
          {new Date(item.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - 
          {new Date(item.endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
        {item.category && <Text style={eventStyles.eventCategory}>{item.category}</Text>}
        {item.source === 'cloud' && (
          <Ionicons name="cloud" size={16} color="#fff" style={{ marginTop: 4 }} />
        )}
      </View>
      {item.source !== 'cloud' && (
        <TouchableOpacity
          style={eventStyles.deleteButton}
          onPress={() => deleteEvent(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#100f0f", "#2a0b4e"]} style={globalStyles.gradient}>
      <View style={eventStyles.container}>
        {/* Header */}
        <View style={eventStyles.header}>
          <Text style={eventStyles.headerTitle}>My Calendar</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Sync Button */}
        <TouchableOpacity 
          onPress={syncICloudCalendar} 
          style={eventStyles.syncButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="sync-outline" size={20} color="#fff" />
              <Text style={eventStyles.syncText}>Sync iCloud Calendar</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Notification - positioned absolutely to appear over other content */}
        {syncStatus && (
          <View style={{
            position: 'absolute',
            top: 70,
            left: 0,
            right: 0,
            zIndex: 100,
          }}>
            <Notification 
              status={syncStatus} 
              onClose={dismissSyncStatus} 
            />
          </View>
        )}

        {/* Calendar View */}
        <View style={eventStyles.calendarContainer}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={Object.keys(events).reduce((acc, date) => {
              const eventCount = events[date].length;
              return {
                ...acc,
                [date]: {
                  marked: true,
                  dotColor: "#5967EB",
                  activeOpacity: 0.7,
                  ...(eventCount > 0 && {
                    customStyles: {
                      container: {
                        backgroundColor: "rgba(89, 103, 235, 0.2)",
                        borderRadius: 6,
                      },
                      text: {
                        color: "#fff",
                        fontWeight: "bold",
                      }
                    }
                  })
                }
              };
            }, {})}
            theme={{
              backgroundColor: "#100f0f",
              calendarBackground: "#100f0f",
              textSectionTitleColor: "#fff",
              selectedDayBackgroundColor: "#5967EB",
              selectedDayTextColor: "#fff",
              todayTextColor: "#5967EB",
              dayTextColor: "#fff",
              textDisabledColor: "#555",
              dotColor: "#5967EB",
              selectedDotColor: "#fff",
              arrowColor: "#fff",
              monthTextColor: "#fff",
              indicatorColor: "#fff",
              textDayFontWeight: "400",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "500",
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {/* Event Modal */}
        <Modal visible={isEventModalVisible} transparent animationType="fade">
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContent}>
              <View style={globalStyles.modalHeader}>
                <Text style={globalStyles.modalTitle}>
                  {isAddingEvent ? (selectedEvent ? "Edit Event" : "New Event") : `Events for ${selectedDate}`}
                </Text>
                {!isAddingEvent && (
                  <TouchableOpacity
                    style={eventStyles.addButton}
                    onPress={() => {
                      setSelectedEvent(null);
                      setEventData({
                        title: "",
                        description: "",
                        startDate: new Date(selectedDate || new Date()),
                        startTime: new Date(),
                        endDate: new Date(selectedDate || new Date()),
                        endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
                        isAllDay: false,
                        category: "Work",
                        customCategory: "",
                        repeatOption: "None",
                        reminderOption: "None",
                        notes: "",
                        participants: "",
                      });
                      setIsAddingEvent(true);
                    }}
                  >
                    <Ionicons name="add-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>

              {!isAddingEvent ? (
                <FlatList
                  data={selectedDate && events[selectedDate] ? 
                    [...events[selectedDate]].sort((a, b) => 
                      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                    ) : []}
                  renderItem={renderEventItem}
                  keyExtractor={(item) => item.id}
                  style={eventStyles.eventList}
                  ListEmptyComponent={
                    <View style={eventStyles.emptyState}>
                      <Ionicons name="calendar-outline" size={40} color="#fff" />
                      <Text style={eventStyles.emptyText}>No events on this day</Text>
                    </View>
                  }
                />
              ) : (
                <ScrollView contentContainerStyle={eventStyles.modalScrollView}>
                  <TextInput
                    style={globalStyles.input}
                    placeholder="Event Title"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={eventData.title}
                    onChangeText={(text) => setEventData(prev => ({ ...prev, title: text }))}
                  />
                  
                  <TextInput
                    style={[globalStyles.input, eventStyles.descriptionInput]}
                    placeholder="Description"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={eventData.description}
                    onChangeText={(text) => setEventData(prev => ({ ...prev, description: text }))}
                    multiline
                  />
                  
                  <View style={eventStyles.toggleContainer}>
                    <Text style={eventStyles.toggleLabel}>All Day Event</Text>
                    <Switch
                      value={eventData.isAllDay}
                      onValueChange={(value) => setEventData(prev => ({ ...prev, isAllDay: value }))}
                      trackColor={{ false: "#555", true: "#5967EB" }}
                      thumbColor="#fff"
                    />
                  </View>
                  
                  <View style={eventStyles.timeButtonContainer}>
                    <TouchableOpacity
                      style={eventStyles.timeButton}
                      onPress={() => showDateTimePicker("startDate")}
                    >
                      <Ionicons name="calendar-outline" size={18} color="#fff" />
                      <Text style={eventStyles.timeButtonText}>
                        {eventData.startDate.toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                    
                    {!eventData.isAllDay && (
                      <TouchableOpacity
                        style={eventStyles.timeButton}
                        onPress={() => showDateTimePicker("startTime")}
                      >
                        <Ionicons name="time-outline" size={18} color="#fff" />
                        <Text style={eventStyles.timeButtonText}>
                          {eventData.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <View style={eventStyles.timeButtonContainer}>
                    <TouchableOpacity
                      style={eventStyles.timeButton}
                      onPress={() => showDateTimePicker("endDate")}
                    >
                      <Ionicons name="calendar-outline" size={18} color="#fff" />
                      <Text style={eventStyles.timeButtonText}>
                        {eventData.endDate.toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                    
                    {!eventData.isAllDay && (
                      <TouchableOpacity
                        style={eventStyles.timeButton}
                        onPress={() => showDateTimePicker("endTime")}
                      >
                        <Ionicons name="time-outline" size={18} color="#fff" />
                        <Text style={eventStyles.timeButtonText}>
                          {eventData.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* Date/Time Pickers */}
                  {dateTimePickers.startDate && (
                    <DateTimePicker
                      value={eventData.startDate}
                      mode="date"
                      display="default"
                      onChange={(e, date) => handleDateTimeChange(e, date, "startDate")}
                    />
                  )}
                  {dateTimePickers.startTime && (
                    <DateTimePicker
                      value={eventData.startTime}
                      mode="time"
                      display="default"
                      onChange={(e, time) => handleDateTimeChange(e, time, "startTime")}
                    />
                  )}
                  {dateTimePickers.endDate && (
                    <DateTimePicker
                      value={eventData.endDate}
                      mode="date"
                      display="default"
                      onChange={(e, date) => handleDateTimeChange(e, date, "endDate")}
                    />
                  )}
                  {dateTimePickers.endTime && (
                    <DateTimePicker
                      value={eventData.endTime}
                      mode="time"
                      display="default"
                      onChange={(e, time) => handleDateTimeChange(e, time, "endTime")}
                    />
                  )}
                  
                  {/* Category Picker */}
                  <View style={eventStyles.pickerContainer}>
                    <Text style={eventStyles.pickerLabel}>Category</Text>
                    <Picker
                      selectedValue={eventData.category}
                      onValueChange={(value) => setEventData(prev => ({ ...prev, category: value }))}
                      style={eventStyles.picker}
                      dropdownIconColor="#fff"
                    >
                      {EVENT_CATEGORIES.map((category) => (
                        <Picker.Item 
                          key={category.name} 
                          label={category.name} 
                          value={category.name} 
                          color="#fff"
                        />
                      ))}
                    </Picker>
                  </View>
                  
                  {/* Repeat Options */}
                  <TouchableOpacity
                    style={eventStyles.collapsibleHeader}
                    onPress={() => setIsRepeatCollapsed(!isRepeatCollapsed)}
                  >
                    <Text style={eventStyles.collapsibleHeaderText}>
                      Repeat: {eventData.repeatOption}
                    </Text>
                    <Ionicons
                      name={isRepeatCollapsed ? "chevron-down" : "chevron-up"}
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  
                  {!isRepeatCollapsed && (
                    <View style={eventStyles.pickerContainer}>
                      <Picker
                        selectedValue={eventData.repeatOption}
                        onValueChange={(value) => setEventData(prev => ({ ...prev, repeatOption: value }))}
                        style={eventStyles.picker}
                        dropdownIconColor="#fff"
                      >
                        {REPEAT_OPTIONS.map((option) => (
                          <Picker.Item 
                            key={option} 
                            label={option} 
                            value={option} 
                            color="#fff"
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                  
                  {/* Reminder Options */}
                  <TouchableOpacity
                    style={eventStyles.collapsibleHeader}
                    onPress={() => setIsReminderCollapsed(!isReminderCollapsed)}
                  >
                    <Text style={eventStyles.collapsibleHeaderText}>
                      Reminder: {eventData.reminderOption}
                    </Text>
                    <Ionicons
                      name={isReminderCollapsed ? "chevron-down" : "chevron-up"}
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  
                  {!isReminderCollapsed && (
                    <View style={eventStyles.pickerContainer}>
                      <Picker
                        selectedValue={eventData.reminderOption}
                        onValueChange={(value) => setEventData(prev => ({ ...prev, reminderOption: value }))}
                        style={eventStyles.picker}
                        dropdownIconColor="#fff"
                      >
                        {REMINDER_OPTIONS.map((option) => (
                          <Picker.Item 
                            key={option} 
                            label={option} 
                            value={option} 
                            color="#fff"
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                  
                  <TextInput
                    style={[globalStyles.input, eventStyles.descriptionInput]}
                    placeholder="Notes"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={eventData.notes}
                    onChangeText={(text) => setEventData(prev => ({ ...prev, notes: text }))}
                    multiline
                  />
                  
                  <TextInput
                    style={globalStyles.input}
                    placeholder="Participants (comma separated emails)"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={eventData.participants}
                    onChangeText={(text) => setEventData(prev => ({ ...prev, participants: text }))}
                  />
                  
                  <View style={globalStyles.modalFooter}>
                    <TouchableOpacity
                      style={[globalStyles.modalCancelButton, { flex: 1 }]}
                      onPress={() => {
                        if (selectedEvent) {
                          setIsAddingEvent(false);
                        } else {
                          setIsEventModalVisible(false);
                        }
                      }}
                    >
                      <Text style={globalStyles.modalCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[globalStyles.modalConfirmButton, { flex: 1 }]}
                      onPress={saveEvent}
                    >
                      <Text style={globalStyles.modalConfirmButtonText}>
                        {selectedEvent ? "Update" : "Save"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
              
              <TouchableOpacity
                style={globalStyles.modalCloseButton}
                onPress={() => {
                  setIsEventModalVisible(false);
                  setSelectedEvent(null);
                  setIsAddingEvent(false);
                }}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
}