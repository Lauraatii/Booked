import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import * as CalendarAPI from "expo-calendar";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

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

      // Formats events to store in Firestore
      const formattedEvents = events.map((event) => ({
        title: event.title,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
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
      setEvents(docSnap.data().availability || []);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.infoContainer}>
        <Text style={styles.infoText}>Sync your calendar to share availability with friends.</Text>
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

      <FlatList
        data={events}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <Text style={styles.eventText}>{item.title}</Text>
            <Text style={styles.eventDetails}>{item.startDate} - {item.endDate}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#31C99E", paddingTop: 10 },
  infoContainer: { padding: 15, alignItems: "center", marginBottom: 10 },
  infoText: { fontSize: 16, textAlign: "center", color: "#D9FFF5" },
  syncButton: { flexDirection: "row", backgroundColor: "#26A480", padding: 12, borderRadius: 25, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 10 },
  syncText: { color: "#fff", fontSize: 16, marginLeft: 5 },
  eventItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  eventText: { fontSize: 16, fontWeight: "bold" },
  eventDetails: { fontSize: 14, color: "#555" },
});