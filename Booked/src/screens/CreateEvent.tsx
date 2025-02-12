import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { db } from "../../firebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser } from "../context/UserContext";

export default function CreateEvent({ route, navigation }: any) {
  const { groupId } = route.params;
  const { user } = useUser();
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCreateEvent = async () => {
    if (!eventTitle.trim()) {
      Alert.alert("Error", "Please enter an event title.");
      return;
    }

    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        events: arrayUnion({
          id: Math.random().toString(36).substring(7),
          title: eventTitle,
          date: eventDate.toDateString(),
          createdBy: user?.uid,
        }),
      });

      Alert.alert("Success", "Event created successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to create event.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Event</Text>

      <TextInput
        style={styles.input}
        placeholder="Event Title"
        value={eventTitle}
        onChangeText={setEventTitle}
        placeholderTextColor="#888"
      />

      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.datePickerText}>
          {eventDate.toDateString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={eventDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setEventDate(date);
          }}
        />
      )}

      <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
        <Text style={styles.buttonText}>Create Event</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#31C99E",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7DFFE3",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  datePickerText: {
    fontSize: 16,
    color: "#000",
  },
  createButton: {
    backgroundColor: "#26A480",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});