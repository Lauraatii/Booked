import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Switch,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as CalendarAPI from "expo-calendar";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Predefined event categories with colors
const EVENT_CATEGORIES = [
  { name: "Work", color: "#26A480" },
  { name: "Personal", color: "#FF6B6B" },
  { name: "Meeting", color: "#5967EB" },
  { name: "Travel", color: "#FFA500" },
  { name: "Other", color: "#888" },
];

// Repeat options
const REPEAT_OPTIONS = ["None", "Daily", "Weekly", "Monthly", "Yearly"];

// Reminder options
const REMINDER_OPTIONS = [
  "None",
  "5 minutes before",
  "10 minutes before",
  "15 minutes before",
  "30 minutes before",
  "1 hour before",
  "1 day before",
];

export default function Events() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState({});
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [isAllDay, setIsAllDay] = useState(false); // Toggle for All Day
  const [eventCategory, setEventCategory] = useState("Work");
  const [customCategory, setCustomCategory] = useState("");
  const [repeatOption, setRepeatOption] = useState("None");
  const [reminderOption, setReminderOption] = useState("None");
  const [notes, setNotes] = useState("");
  const [participants, setParticipants] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null); // For editing existing events
  const [isAddingEvent, setIsAddingEvent] = useState(false); // Toggle for adding a new event
  const [isRepeatCollapsed, setIsRepeatCollapsed] = useState(true); // Collapsible repeat dropdown
  const [isReminderCollapsed, setIsReminderCollapsed] = useState(true); // Collapsible reminder dropdown

  useEffect(() => {
    fetchUserAvailability();
  }, []);

  // Requests permission and fetch calendar events
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
      setLoading(true);
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

      // Format events to store in Firestore
      const formattedEvents = events.map((event) => ({
        id: event.id, // Add unique ID for each event
        title: event.title,
        startDate: new Date(event.startDate).toISOString(),
        endDate: new Date(event.endDate).toISOString(),
        description: event.notes || "", // Use 'notes' instead of 'description'
        isBusy: true, // Default to Busy for synced events
        category: "Other", // Default category
      }));

      storeAvailabilityInFirestore(formattedEvents);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch calendar events.");
    } finally {
      setLoading(false);
    }
  };

  // Stores user availability in Firestore
  const storeAvailabilityInFirestore = async (events) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await setDoc(doc(db, "users", user.uid), { availability: events }, { merge: true });
      Alert.alert("Success", "Your availability has been updated.");
      fetchUserAvailability(); // Refresh the list
    } catch (error) {
      Alert.alert("Error", "Failed to sync availability.");
    }
  };

  // Fetch user availability from Firestore
  const fetchUserAvailability = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const availability = docSnap.data().availability || [];
      const formattedEvents = availability.reduce((acc, event) => {
        const date = new Date(event.startDate).toISOString().split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
        return acc;
      }, {});
      setEvents(formattedEvents);
    }
  };

  // Handle date selection in the calendar
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setStartDate(new Date(day.dateString));
    setEndDate(new Date(day.dateString));
    setIsEventModalVisible(true);
    setIsAddingEvent(false); // Reset adding event state
  };

  // Handle date/time selection for event
  const handleDateTimeSelect = (event, selectedDateTime, type) => {
    if (selectedDateTime) {
      if (type === "startDate") {
        setStartDate(selectedDateTime);
      } else if (type === "startTime") {
        setStartTime(selectedDateTime);
      } else if (type === "endDate") {
        setEndDate(selectedDateTime);
      } else if (type === "endTime") {
        setEndTime(selectedDateTime);
      }
    }
    if (type.includes("Date")) {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    } else {
      setShowStartTimePicker(false);
      setShowEndTimePicker(false);
    }
  };

  // Save or update event
  const saveEvent = async () => {
    if (!eventTitle || !selectedDate) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    const newEvent = {
      id: selectedEvent ? selectedEvent.id : Date.now().toString(), // Use existing ID or generate a new one
      title: eventTitle,
      startDate: new Date(`${startDate.toISOString().split("T")[0]}T${startTime.toTimeString().split(" ")[0]}`).toISOString(),
      endDate: new Date(`${endDate.toISOString().split("T")[0]}T${endTime.toTimeString().split(" ")[0]}`).toISOString(),
      description: eventDescription,
      isAllDay: isAllDay,
      category: customCategory || eventCategory,
      repeatOption: repeatOption,
      reminderOption: reminderOption,
      notes: notes,
      participants: participants.split(",").map((email) => email.trim()), // Split participants by comma
    };

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      const existingEvents = docSnap.exists() ? docSnap.data().availability || [] : [];

      // Update or add the event
      const updatedEvents = selectedEvent
        ? existingEvents.map((event) => (event.id === selectedEvent.id ? newEvent : event))
        : [...existingEvents, newEvent];

      await setDoc(docRef, { availability: updatedEvents }, { merge: true });
      Alert.alert("Success", selectedEvent ? "Event updated successfully." : "Event saved successfully.");
      setIsEventModalVisible(false);
      setSelectedEvent(null); // Reset selected event
      setIsAddingEvent(false); // Reset adding event state
      fetchUserAvailability(); // Refresh the list
    } catch (error) {
      Alert.alert("Error", "Failed to save event.");
    }
  };

  // Delete an event
  const deleteEvent = async (eventId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      const existingEvents = docSnap.exists() ? docSnap.data().availability || [] : [];
      const updatedEvents = existingEvents.filter((event) => event.id !== eventId);

      await setDoc(docRef, { availability: updatedEvents }, { merge: true });
      Alert.alert("Success", "Event deleted successfully.");
      fetchUserAvailability(); // Refresh the list
    } catch (error) {
      Alert.alert("Error", "Failed to delete event.");
    }
  };

  // Sort events by start time
  const sortEventsByTime = (events) => {
    return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  // Render event item
  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.eventItem, { backgroundColor: EVENT_CATEGORIES.find((cat) => cat.name === item.category)?.color || "#888" }]}
      onPress={() => {
        setSelectedEvent(item);
        setEventTitle(item.title);
        setEventDescription(item.description);
        setStartDate(new Date(item.startDate));
        setStartTime(new Date(item.startDate));
        setEndDate(new Date(item.endDate));
        setEndTime(new Date(item.endDate));
        setIsAllDay(item.isAllDay || false);
        setEventCategory(item.category);
        setRepeatOption(item.repeatOption || "None");
        setReminderOption(item.reminderOption || "None");
        setNotes(item.notes || "");
        setParticipants(item.participants?.join(", ") || "");
        setIsAddingEvent(true); // Show the form for editing
      }}
    >
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventTime}>
          {new Date(item.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(item.endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteEvent(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Sync your calendar or manually add events.</Text>
      </View>

      <TouchableOpacity onPress={requestCalendarAccess} style={styles.syncButton}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="sync-outline" size={24} color="#fff" />
            <Text style={styles.syncText}>Sync Calendar</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Calendar View */}
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={Object.keys(events).reduce((acc, date) => {
            acc[date] = { marked: true, dotColor: "#26A480" };
            return acc;
          }, {})}
          theme={{
            selectedDayBackgroundColor: "#26A480",
            todayTextColor: "#26A480",
            arrowColor: "#26A480",
          }}
        />
      </View>

      {/* Event List Modal */}
      <Modal visible={isEventModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header with "+" Button */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Events for {selectedDate}
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setSelectedEvent(null); // Reset selected event
                  setEventTitle("");
                  setEventDescription("");
                  setStartDate(new Date(selectedDate));
                  setStartTime(new Date());
                  setEndDate(new Date(selectedDate));
                  setEndTime(new Date());
                  setIsAllDay(false);
                  setEventCategory("Work");
                  setCustomCategory("");
                  setRepeatOption("None");
                  setReminderOption("None");
                  setNotes("");
                  setParticipants("");
                  setIsAddingEvent(true); 
                }}
              >
                <Ionicons name="add-outline" size={24} color="#26A480" />
              </TouchableOpacity>
            </View>

            {/* Event List (Visible only when not adding/editing) */}
            {!isAddingEvent && (
              <FlatList
                data={selectedDate && events[selectedDate] ? sortEventsByTime(events[selectedDate]) : []}
                renderItem={renderEventItem}
                keyExtractor={(item) => item.id}
                style={styles.eventList}
              />
            )}

            {/* Event Form (Visible only when adding/editing) */}
            {isAddingEvent && (
              <ScrollView contentContainerStyle={styles.modalScrollView}>
                <TextInput
                  style={styles.input}
                  placeholder="Event Title"
                  value={eventTitle}
                  onChangeText={setEventTitle}
                />
                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  placeholder="Description"
                  value={eventDescription}
                  onChangeText={setEventDescription}
                  multiline
                />
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>All Day</Text>
                  <Switch
                    value={isAllDay}
                    onValueChange={(value) => setIsAllDay(value)}
                    trackColor={{ false: "#26A480", true: "#FF6B6B" }}
                    thumbColor="#fff"
                  />
                </View>
                <View style={styles.timeButtonContainer}>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={styles.timeButtonText}>
                      Start Date: {startDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  {!isAllDay && (
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => setShowStartTimePicker(true)}
                    >
                      <Text style={styles.timeButtonText}>
                        Start Time: {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.timeButtonContainer}>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={styles.timeButtonText}>
                      End Date: {endDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  {!isAllDay && (
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => setShowEndTimePicker(true)}
                    >
                      <Text style={styles.timeButtonText}>
                        End Time: {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => handleDateTimeSelect(event, selectedDate, "startDate")}
                  />
                )}
                {showStartTimePicker && (
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => handleDateTimeSelect(event, selectedTime, "startTime")}
                  />
                )}
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => handleDateTimeSelect(event, selectedDate, "endDate")}
                  />
                )}
                {showEndTimePicker && (
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => handleDateTimeSelect(event, selectedTime, "endTime")}
                  />
                )}
                <TouchableOpacity
                  style={styles.collapsibleHeader}
                  onPress={() => setIsRepeatCollapsed(!isRepeatCollapsed)}
                >
                  <Text style={styles.collapsibleHeaderText}>Repeat: {repeatOption}</Text>
                  <Ionicons
                    name={isRepeatCollapsed ? "chevron-down-outline" : "chevron-up-outline"}
                    size={20}
                    color="#26A480"
                  />
                </TouchableOpacity>
                {!isRepeatCollapsed && (
                  <Picker
                    selectedValue={repeatOption}
                    onValueChange={(itemValue) => setRepeatOption(itemValue)}
                    style={styles.picker}
                  >
                    {REPEAT_OPTIONS.map((option) => (
                      <Picker.Item key={option} label={option} value={option} />
                    ))}
                  </Picker>
                )}
                <TouchableOpacity
                  style={styles.collapsibleHeader}
                  onPress={() => setIsReminderCollapsed(!isReminderCollapsed)}
                >
                  <Text style={styles.collapsibleHeaderText}>Reminder: {reminderOption}</Text>
                  <Ionicons
                    name={isReminderCollapsed ? "chevron-down-outline" : "chevron-up-outline"}
                    size={20}
                    color="#26A480"
                  />
                </TouchableOpacity>
                {!isReminderCollapsed && (
                  <Picker
                    selectedValue={reminderOption}
                    onValueChange={(itemValue) => setReminderOption(itemValue)}
                    style={styles.picker}
                  >
                    {REMINDER_OPTIONS.map((option) => (
                      <Picker.Item key={option} label={option} value={option} />
                    ))}
                  </Picker>
                )}
                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  placeholder="Notes"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
                <TextInput
                  style={styles.input}
                  placeholder="Participants (comma-separated emails)"
                  value={participants}
                  onChangeText={setParticipants}
                />
                <TouchableOpacity style={styles.saveButton} onPress={saveEvent}>
                  <Text style={styles.saveButtonText}>
                    {selectedEvent ? "Update Event" : "Save Event"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setIsEventModalVisible(false);
                setSelectedEvent(null); // Reset selected event
                setIsAddingEvent(false); // Reset adding event state
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", paddingTop: 20 },
  infoContainer: { padding: 15, alignItems: "center", marginBottom: 10 },
  infoText: { fontSize: 16, textAlign: "center", color: "#666" },
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
  syncText: { color: "#fff", fontSize: 16, marginLeft: 5 },
  calendarContainer: { margin: 10, backgroundColor: "#fff", borderRadius: 10, padding: 10 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    padding: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  timeButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeButton: {
    backgroundColor: "#26A480",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  timeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#333",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#26A480",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#fff", fontSize: 16 },
  closeButton: {
    padding: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#26A480",
    fontSize: 16,
    fontWeight: "bold",
  },
  eventList: {
    marginBottom: 10,
  },
  eventItem: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  eventTime: {
    fontSize: 14,
    color: "#fff",
  },
  deleteButton: {
    padding: 5,
  },
  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 10,
  },
  collapsibleHeaderText: {
    fontSize: 16,
    color: "#333",
  },
  modalScrollView: {
    flexGrow: 1,
  },
});