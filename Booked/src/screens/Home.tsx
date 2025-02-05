import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

// Categories 
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
  { id: "1", title: "Sunset Rooftop Party 🎉", category: "Parties", location: "Copenhagen, Denmark" },
  { id: "2", title: "Hiking in the Alps 🏔️", category: "Outdoor", location: "Switzerland" },
  { id: "3", title: "Jazz Night 🎷", category: "Concerts", location: "New York, USA" },
  { id: "4", title: "Gourmet Food Festival 🍽️", category: "Dining", location: "Paris, France" },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter events by category
  const filteredEvents = selectedCategory === "All"
    ? events
    : events.filter(event => event.category === selectedCategory);

  return (
    <View style={styles.container}>
      {/* Greeting */}
      <Animated.View style={styles.header} entering={FadeInDown.duration(500)}>
        <Text style={styles.title}>Hey there, ready for an event? 🎉</Text>
      </Animated.View>

      {/* Category Filters */}
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => setSelectedCategory(item.name)}
          >
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoryList}
      />

      {/* Event Feed */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.eventCard}>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventLocation}>{item.location}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: "#31C99E",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  categoryList: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  categoryButton: {
    backgroundColor: "#D9FFF5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  categoryText: {
    fontSize: 14,
    color: "#26A480",
    fontWeight: "bold",
  },
  eventCard: {
    marginVertical: 10,
    marginHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventDetails: {
    padding: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },
});
