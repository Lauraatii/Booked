import React, { useState } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

// Categories (Filters)
const categories = [
  { id: "1", name: "All" },
  { id: "2", name: "Trips" },
  { id: "3", name: "Parties" },
  { id: "4", name: "Outdoor" },
  { id: "5", name: "Dining" },
  { id: "6", name: "Gaming" },
  { id: "7", name: "Concerts" },
];

// Mock AI-generated event data
const events = [
  { id: "1", title: "Sunset Rooftop Party 🎉", category: "Parties", location: "Copenhagen, Denmark", attendees: 5 },
  { id: "2", title: "Hiking in the Alps 🏔️", category: "Outdoor", location: "Switzerland", attendees: 8 },
  { id: "3", title: "Jazz Night 🎷", category: "Concerts", location: "New York, USA", attendees: 3 },
  { id: "4", title: "Gourmet Food Festival 🍽️", category: "Dining", location: "Paris, France", attendees: 6 },
];

export default function Home({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter events by category
  const filteredEvents = selectedCategory === "All"
    ? events
    : events.filter(event => event.category === selectedCategory);

  return (
    <View style={styles.container}>
      {/* 🔥 Greeting */}
      <Animated.View style={styles.header} entering={FadeInDown.duration(500)}>
        <Text style={styles.title}>Hey there, ready to plan something? 🎉</Text>
        <Text style={styles.subtitle}>See what’s happening or create your own event.</Text>
      </Animated.View>

      {/* 🎯 Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.categoryButton, selectedCategory === item.name && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(item.name)}
            activeOpacity={0.7} // Smooth tap effect
          >
            <Text style={[styles.categoryText, selectedCategory === item.name && styles.categoryTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 📌 Events List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.eventCard} activeOpacity={0.7}>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventLocation}>{item.location}</Text>
              <Text style={styles.eventAttendees}>{item.attendees} friends attending</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ➕ Create Event Button */}
      <TouchableOpacity style={styles.createEventButton} onPress={() => navigation.navigate("Events")}>
        <Ionicons name="add-circle-outline" size={26} color="#fff" />
        <Text style={styles.createEventText}>Create an Event</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingBottom: 20 },

  /* 🎉 Header */
  header: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: "#31C99E",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 16, color: "#D9FFF5", marginTop: 5 },

  /* 🏷️ Category Selection */
  categoryList: { paddingHorizontal: 15, paddingVertical: 10 },
  categoryButton: {
    backgroundColor: "#D9FFF5",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  categoryButtonActive: { backgroundColor: "#26A480" },
  categoryText: { fontSize: 14, color: "#26A480", fontWeight: "bold" },
  categoryTextActive: { color: "#fff" },

  /* 🎭 Event Cards */
  eventCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  eventDetails: { paddingVertical: 5 },
  eventTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  eventLocation: { fontSize: 14, color: "#666", marginTop: 2 },
  eventAttendees: { fontSize: 12, color: "#888", marginTop: 3 },

  /* ➕ Create Event */
  createEventButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#26A480",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createEventText: { fontSize: 16, color: "#fff", marginLeft: 10, fontWeight: "bold" },
});