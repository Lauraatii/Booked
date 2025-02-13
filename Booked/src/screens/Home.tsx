import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

// Mock event data
const events = [
  {
    id: "1",
    title: "Sunset Rooftop Party 🎉",
    category: "Parties",
    location: "Copenhagen, Denmark",
    attendees: 5,
    date: "2023-10-25",
    description: "Join us for an unforgettable evening with music, drinks, and a stunning view of the city skyline.",
  },
  {
    id: "2",
    title: "Hiking in the Alps 🏔️",
    category: "Outdoor",
    location: "Switzerland",
    attendees: 8,
    date: "2023-11-05",
    description: "Explore the breathtaking Swiss Alps with a group of adventure enthusiasts.",
  },
  {
    id: "3",
    title: "Jazz Night 🎷",
    category: "Concerts",
    location: "New York, USA",
    attendees: 3,
    date: "2023-10-30",
    description: "Enjoy a night of smooth jazz performances at the iconic Blue Note Jazz Club.",
  },
  {
    id: "4",
    title: "Gourmet Food Festival 🍽️",
    category: "Dining",
    location: "Paris, France",
    attendees: 6,
    date: "2023-11-10",
    description: "Taste the finest cuisines from top chefs around the world.",
  },
];

// Mock My Events data
const myEvents = [
  {
    id: "1",
    title: "Team Dinner 🍽️",
    date: "2023-10-15",
    location: "Berlin, Germany",
    attendees: 10,
    description: "A casual dinner to celebrate the end of a successful project.",
  },
  {
    id: "2",
    title: "Weekend Trip 🏞️",
    date: "2023-10-20",
    location: "Bavaria, Germany",
    attendees: 5,
    description: "A relaxing weekend getaway to the Bavarian countryside.",
  },
];

export default function Home({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSection, setSelectedSection] = useState("My Events");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Filter events by category
  const filteredEvents = selectedCategory === "All"
    ? events
    : events.filter((event) => event.category === selectedCategory);

  // Handle event press
  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  // Share event
  const handleShareEvent = async (event) => {
    try {
      await Share.share({
        message: `Check out this event: ${event.title}\nDate: ${event.date}\nLocation: ${event.location}\nDescription: ${event.description}`,
      });
    } catch (error) {
      console.error("Error sharing event:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hey there, ready to plan something? 🎉</Text>
        <Text style={styles.subtitle}>See what’s happening or create your own event.</Text>
      </View>

      <View style={styles.sectionSelector}>
        <TouchableOpacity
          style={[styles.sectionButton, selectedSection === "My Events" && styles.sectionButtonActive]}
          onPress={() => setSelectedSection("My Events")}
        >
          <Text style={[styles.sectionText, selectedSection === "My Events" && styles.sectionTextActive]}>
            My Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionButton, selectedSection === "Explore" && styles.sectionButtonActive]}
          onPress={() => setSelectedSection("Explore")}
        >
          <Text style={[styles.sectionText, selectedSection === "Explore" && styles.sectionTextActive]}>
            Explore
          </Text>
        </TouchableOpacity>
      </View>

      {selectedSection === "My Events" ? (
        <FlatList
          data={myEvents}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.eventCard} onPress={() => handleEventPress(item)}>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventLocation}>{item.location}</Text>
                <Text style={styles.eventAttendees}>{item.attendees} friends attending</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {categories.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.categoryButton, selectedCategory === item.name && styles.categoryButtonActive]}
                onPress={() => setSelectedCategory(item.name)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryText, selectedCategory === item.name && styles.categoryTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.eventCard} onPress={() => handleEventPress(item)}>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventLocation}>{item.location}</Text>
                  <Text style={styles.eventAttendees}>{item.attendees} friends attending</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <TouchableOpacity style={styles.createEventButton} onPress={() => navigation.navigate("Events")}>
        <Ionicons name="add-circle-outline" size={26} color="#fff" />
        <Text style={styles.createEventText}>Create an Event</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedEvent && (
              <>
                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                <Text style={styles.modalSubtitle}>{selectedEvent.date} • {selectedEvent.location}</Text>
                <Text style={styles.modalDescription}>{selectedEvent.description}</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalButton} onPress={() => handleShareEvent(selectedEvent)}>
                    <Ionicons name="share-social" size={20} color="#fff" />
                    <Text style={styles.modalButtonText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButton} onPress={() => alert("You joined the event!")}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.modalButtonText}>Join</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingBottom: 20 },
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
  sectionSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  sectionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sectionButtonActive: { backgroundColor: "#26A480" },
  sectionText: { fontSize: 16, color: "#26A480", fontWeight: "bold" },
  sectionTextActive: { color: "#fff" },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#333" },
  modalSubtitle: { fontSize: 16, color: "#666", marginTop: 5 },
  modalDescription: { fontSize: 14, color: "#888", marginTop: 10 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: "#26A480",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  modalButtonText: { fontSize: 16, color: "#fff", marginLeft: 10 },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});