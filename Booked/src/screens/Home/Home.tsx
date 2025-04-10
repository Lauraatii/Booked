import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { globalStyles, GradientButton, ModalButton } from "../../styles/globalStyles";

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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Check if there are any events planned for today
  const hasEventToday = myEvents.some(event => event.date === today);

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
    <LinearGradient colors={["#100f0f", "#2a0b4e"]} style={globalStyles.gradient}>
      <View style={globalStyles.container}>
        {/* Banner for today's event */}
        <View style={globalStyles.banner}>
          {hasEventToday ? (
            <View style={globalStyles.eventBanner}>
              <Text style={globalStyles.bannerText}>You have an event today:</Text>
              <Text style={globalStyles.bannerEventTitle}>
                {myEvents.find(event => event.date === today)?.title}
              </Text>
            </View>
          ) : (
            <Text style={globalStyles.bannerText}>Nothing planned today</Text>
          )}
          <GradientButton 
            onPress={() => navigation.navigate("Events")}
            style={{ marginTop: 10 }}
          >
            Create an Event
          </GradientButton>
        </View>

        <View style={globalStyles.sectionSelector}>
          <TouchableOpacity
            style={[
              globalStyles.sectionButton, 
              selectedSection === "My Events" && globalStyles.sectionButtonActive
            ]}
            onPress={() => setSelectedSection("My Events")}
          >
            <Text style={[
              globalStyles.sectionText, 
              selectedSection === "My Events" && globalStyles.sectionTextActive
            ]}>
              My Events
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              globalStyles.sectionButton, 
              selectedSection === "Explore" && globalStyles.sectionButtonActive
            ]}
            onPress={() => setSelectedSection("Explore")}
          >
            <Text style={[
              globalStyles.sectionText, 
              selectedSection === "Explore" && globalStyles.sectionTextActive
            ]}>
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
              <TouchableOpacity 
                style={globalStyles.eventCard} 
                onPress={() => handleEventPress(item)}
              >
                <View style={globalStyles.eventDetails}>
                  <Text style={globalStyles.eventTitle}>{item.title}</Text>
                  <Text style={globalStyles.eventLocation}>{item.location}</Text>
                  <Text style={globalStyles.eventAttendees}>
                    {item.attendees} friends attending
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={globalStyles.categoryList}
            >
              {categories.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    globalStyles.categoryButton, 
                    selectedCategory === item.name && globalStyles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(item.name)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    globalStyles.categoryText, 
                    selectedCategory === item.name && globalStyles.categoryTextActive
                  ]}>
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
                <TouchableOpacity 
                  style={globalStyles.eventCard} 
                  onPress={() => handleEventPress(item)}
                >
                  <View style={globalStyles.eventDetails}>
                    <Text style={globalStyles.eventTitle}>{item.title}</Text>
                    <Text style={globalStyles.eventLocation}>{item.location}</Text>
                    <Text style={globalStyles.eventAttendees}>
                      {item.attendees} friends attending
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity 
            style={globalStyles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <TouchableOpacity 
              style={globalStyles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {selectedEvent && (
                <>
                  <View style={globalStyles.modalHeader}>
                    <Text style={globalStyles.modalTitle}>{selectedEvent.title}</Text>
                    <Text style={globalStyles.modalSubtitle}>
                      {selectedEvent.date} • {selectedEvent.location}
                    </Text>
                  </View>
                  
                  <View style={globalStyles.modalBody}>
                    <Text style={{ 
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: 14,
                      lineHeight: 20,
                    }}>
                      {selectedEvent.description}
                    </Text>
                  </View>
                  
                  <View style={globalStyles.modalFooter}>
                    <ModalButton 
                      type="cancel"
                      onPress={() => handleShareEvent(selectedEvent)}
                    >
                      <View style={globalStyles.modalButtonContent}>
                        <Ionicons name="share-social" size={16} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#fff' }}>Share</Text>
                      </View>
                    </ModalButton>
                    <ModalButton onPress={() => alert("You joined the event!")}>
                      Join Event
                    </ModalButton>
                  </View>

                  <TouchableOpacity
                    style={globalStyles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </LinearGradient>
  );
}