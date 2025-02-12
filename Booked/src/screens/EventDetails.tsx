import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EventDetails({ route, navigation }: any) {
  const { event } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>{event.date}</Text>
      <Text style={styles.createdBy}>Created by: {event.createdBy}</Text>

      <TouchableOpacity style={styles.rsvpButton}>
        <Text style={styles.rsvpText}>RSVP</Text>
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
    marginBottom: 10,
  },
  date: {
    fontSize: 18,
    color: "#D9FFF5",
    marginBottom: 10,
  },
  createdBy: {
    fontSize: 16,
    color: "#D9FFF5",
    marginBottom: 20,
  },
  rsvpButton: {
    backgroundColor: "#26A480",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  rsvpText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});