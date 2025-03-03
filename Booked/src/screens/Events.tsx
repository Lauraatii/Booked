import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import * as CalendarAPI from "expo-calendar";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Animated, { FadeInDown } from "react-native-reanimated";

// Status options with colors
const STATUS_OPTIONS = {
  Available: { color: "#26A480", label: "Available" },
  Busy: { color: "#FF6B6B", label: "Busy" },
  Private: { color: "#5967EB", label: "Private" },
  NotAvailable: { color: "#888", label: "Not Available" },
  OnVacation: { color: "#FFA500", label: "On Vacation" },
};

export default function Events() {
  const [loading, setLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

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

      // Ensure startDate and endDate are Date objects
      const formattedEvents = events.map((event) => ({
        title: event.title,
        startDate: new Date(event.startDate).toISOString(), // Convert to Date object
        endDate: new Date(event.endDate).toISOString(), // Convert to Date object
        status: "Busy", // Default status for synced events
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
      const markedDates = availability.reduce((acc, event) => {
        const date = new Date(event.startDate).toISOString().split("T")[0];
        acc[date] = {
          selected: true,
          selectedColor: STATUS_OPTIONS[event.status]?.color || "#26A480",
          customStyles: {
            container: {
              backgroundColor: STATUS_OPTIONS[event.status]?.color || "#26A480",
              borderRadius: 5,
            },
            text: {
              color: "#fff",
              fontWeight: "bold",
            },
          },
        };
        return acc;
      }, {});
      setMarkedDates(markedDates);
    }
  };

  // Handle date selection in the calendar
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setIsStatusModalVisible(true);
  };

  // Handle status selection for a date
  const handleStatusSelect = (status) => {
    const updatedDates = { ...selectedDates };
    updatedDates[selectedDate] = {
      selected: true,
      selectedColor: STATUS_OPTIONS[status].color,
      customStyles: {
        container: {
          backgroundColor: STATUS_OPTIONS[status].color,
          borderRadius: 5,
        },
        text: {
          color: "#fff",
          fontWeight: "bold",
        },
      },
    };
    setSelectedDates(updatedDates);
    setIsStatusModalVisible(false);
  };

  // Save selected dates to Firestore
  const saveSelectedDates = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const formattedEvents = Object.keys(selectedDates).map((date) => ({
      title: "Availability",
      startDate: new Date(date).toISOString(), // Ensure it's a Date object
      endDate: new Date(date).toISOString(), // Ensure it's a Date object
      status: Object.keys(STATUS_OPTIONS).find(
        (key) => STATUS_OPTIONS[key].color === selectedDates[date].selectedColor
      ),
    }));

    try {
      await setDoc(doc(db, "users", user.uid), { availability: formattedEvents }, { merge: true });
      Alert.alert("Success", "Your availability has been updated.");
      fetchUserAvailability(); // Refresh the list
    } catch (error) {
      Alert.alert("Error", "Failed to save availability.");
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.infoContainer}>
        <Text style={styles.infoText}>Sync your calendar or manually mark your availability.</Text>
      </Animated.View>

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
          markedDates={{ ...markedDates, ...selectedDates }}
          theme={{
            selectedDayBackgroundColor: "#26A480",
            todayTextColor: "#26A480",
            arrowColor: "#26A480",
          }}
        />
        <TouchableOpacity onPress={saveSelectedDates} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Availability</Text>
        </TouchableOpacity>
      </View>

      {/* Status Selection Modal */}
      <Modal visible={isStatusModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Status</Text>
            {Object.entries(STATUS_OPTIONS).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[styles.statusButton, { backgroundColor: value.color }]}
                onPress={() => handleStatusSelect(key)}
              >
                <Text style={styles.statusButtonText}>{value.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsStatusModalVisible(false)}
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
  container: { flex: 1, backgroundColor: "#31C99E", paddingTop: 20 },
  infoContainer: { padding: 15, alignItems: "center", marginBottom: 10 },
  infoText: { fontSize: 16, textAlign: "center", color: "#D9FFF5" },
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
  saveButton: {
    backgroundColor: "#26A480",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#fff", fontSize: 16 },
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
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  statusButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  statusButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#26A480",
    fontSize: 16,
    fontWeight: "bold",
  },
});