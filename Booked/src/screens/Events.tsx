import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, Modal, TextInput, FlatList, Alert, StyleSheet 
} from "react-native";
import { Calendar } from "react-native-calendars";
import * as CalendarAPI from "expo-calendar";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Events() {
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState<{ 
    [date: string]: { marked: boolean; selected?: boolean; events: { time: string; location: string; description: string }[] } 
  }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [eventText, setEventText] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  
  useEffect(() => {
    requestCalendarAccess();
  }, []);

  // Request access to the user's calendar
  const requestCalendarAccess = async () => {
    const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
    if (status === "granted") {
      const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
      console.log("Calendars:", calendars);
    } else {
      Alert.alert("Permission Denied", "Enable calendar permissions in settings.");
    }
  };

  // Open modal when user selects a date
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setModalVisible(true);

    const updatedEvents = Object.keys(events).reduce((acc, key) => {
      acc[key] = { ...events[key], selected: key === date };
      return acc;
    }, {} as typeof events);

    setEvents(updatedEvents);
  };

  // Save event to selected date
  const handleSaveEvent = () => {
    if (!eventText.trim() || !eventTime.trim()) {
      Alert.alert("Error", "Please enter an event name and time.");
      return;
    }

    setEvents((prevEvents) => ({
      ...prevEvents,
      [selectedDate]: { 
        marked: true, 
        selected: true, 
        events: prevEvents[selectedDate] 
          ? [...prevEvents[selectedDate].events, { time: eventTime, location: eventLocation, description: eventText }]
          : [{ time: eventTime, location: eventLocation, description: eventText }]
      },
    }));

    setModalVisible(false);
    setEventText("");
    setEventTime("");
    setEventLocation("");
    setEventDescription("");
  };

  // Delete an event
  const handleDeleteEvent = (eventToDelete: string) => {
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents[selectedDate].events.filter(event => event.description !== eventToDelete);
      if (updatedEvents.length === 0) {
        const { [selectedDate]: _, ...remainingEvents } = prevEvents;
        return remainingEvents;
      }
      return { ...prevEvents, [selectedDate]: { marked: true, selected: true, events: updatedEvents } };
    });
  };

  return (
    <View style={styles.container}>
      {/* Explanation Text */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Add events manually or sync your schedule with your phone's calendar.
        </Text>
      </Animated.View>

      {/* Sync Button */}
      <TouchableOpacity onPress={requestCalendarAccess} style={styles.syncButton}>
        <Ionicons name="sync-outline" size={24} color="#fff" />
        <Text style={styles.syncText}>Sync Calendar</Text>
      </TouchableOpacity>

      <Animated.View entering={FadeInDown.duration(500)} style={styles.calendarWrapper}>
        <Calendar
          onDayPress={(day) => handleDateSelect(day.dateString)}
          markedDates={Object.fromEntries(
            Object.entries(events).map(([date, value]) => [
              date, { 
                marked: value.marked, 
                selected: value.selected, 
                selectedColor: value.selected ? "#7DFFE3" : undefined, 
              }
            ])
          )}
          theme={{
            todayTextColor: "#31C99E",
            arrowColor: "#26A480",
            calendarBackground: "#ffffff",
            textDayFontSize: 18,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 16,
          }}
          style={styles.calendar}
        />
      </Animated.View>

      {/* Modal for Adding & Viewing Events */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Events on {selectedDate}</Text>
            
            {/* List of events for the selected date */}
            <FlatList
              data={events[selectedDate]?.events || []}
              keyExtractor={(item, index) => `${item.description}-${index}`}
              renderItem={({ item }) => (
                <View style={styles.eventItem}>
                  <View>
                    <Text style={styles.eventText}>{item.description}</Text>
                    <Text style={styles.eventDetails}>{item.time} | {item.location || "No location"}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteEvent(item.description)}>
                    <Ionicons name="trash-outline" size={20} color="#888" />
                  </TouchableOpacity>
                </View>
              )}
            />

            {/* Add new event input */}
            <TextInput style={styles.input} placeholder="Event Name" value={eventText} onChangeText={setEventText} />
            <TextInput style={styles.input} placeholder="Time (e.g., 14:00)" value={eventTime} onChangeText={setEventTime} />
            <TextInput style={styles.input} placeholder="Location (optional)" value={eventLocation} onChangeText={setEventLocation} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveEvent}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#31C99E", paddingTop: 10 },

  infoContainer: { padding: 15, alignItems: "center", marginBottom: 10 },

  infoText: { fontSize: 16, textAlign: "center", color: "#D9FFF5" },

  syncButton: { flexDirection: "row", backgroundColor: "#26A480", padding: 12, borderRadius: 25, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 10 },

  syncText: { color: "#fff", fontSize: 16, marginLeft: 5 },

  calendarWrapper: { flex: 1, alignItems: "center", paddingHorizontal: 15 },

  calendar: { borderRadius: 20, overflow: "hidden", elevation: 4, width: "95%" },

  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  
  modalContent: { width: "85%", backgroundColor: "#fff", padding: 20, borderRadius: 15, alignItems: "center" },

  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },

  input: { width: "100%", padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginBottom: 10, textAlign: "center" },

  modalButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },

  modalButton: { flex: 1, padding: 14, backgroundColor: "#26A480", borderRadius: 10, alignItems: "center", marginHorizontal: 5 },

  cancelButton: { backgroundColor: "#888" },

  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  eventItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },

  eventText: { fontSize: 16, fontWeight: "bold" },

  eventDetails: { fontSize: 14, color: "#555" },
});
