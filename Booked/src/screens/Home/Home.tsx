import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  Share,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { globalStyles, GradientButton, ModalButton } from "../../styles/globalStyles";
import { auth, db } from "../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

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

export default function Home({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSection, setSelectedSection] = useState("My Events");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [exploreEvents, setExploreEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchEvents = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const availability = docSnap.data().availability || [];
          // Format events for display
          const formattedEvents = availability.map(event => ({
            id: event.id,
            title: event.title,
            date: event.startDate.split('T')[0],
            location: event.description || "No location specified",
            attendees: event.participants?.length || 0,
            description: event.notes || "No description provided",
            category: event.category || "Other"
          }));
          
          setMyEvents(formattedEvents);
          // For explore events, we can filter or modify as needed
          setExploreEvents(formattedEvents);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Check if there are any events planned for today
  const hasEventToday = myEvents.some(event => event.date === today);

  // Filter events by category
  const filteredEvents = selectedCategory === "All"
    ? exploreEvents
    : exploreEvents.filter((event) => event.category === selectedCategory);

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

  if (loading) {
    return (
      <LinearGradient colors={["#100f0f", "#2a0b4e"]} style={globalStyles.gradient}>
        <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </LinearGradient>
    );
  }

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
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Ionicons name="calendar-outline" size={40} color="#fff" />
                <Text style={{ color: '#fff', marginTop: 10 }}>No events found</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={globalStyles.eventCard} 
                onPress={() => handleEventPress(item)}
              >
                <View style={globalStyles.eventDetails}>
                  <Text style={globalStyles.eventTitle}>{item.title}</Text>
                  <Text style={globalStyles.eventLocation}>{item.location}</Text>
                  <Text style={globalStyles.eventAttendees}>
                    {item.attendees} {item.attendees === 1 ? 'friend' : 'friends'} attending
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
              ListEmptyComponent={
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                  <Ionicons name="calendar-outline" size={40} color="#fff" />
                  <Text style={{ color: '#fff', marginTop: 10 }}>No events found</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={globalStyles.eventCard} 
                  onPress={() => handleEventPress(item)}
                >
                  <View style={globalStyles.eventDetails}>
                    <Text style={globalStyles.eventTitle}>{item.title}</Text>
                    <Text style={globalStyles.eventLocation}>{item.location}</Text>
                    <Text style={globalStyles.eventAttendees}>
                      {item.attendees} {item.attendees === 1 ? 'friend' : 'friends'} attending
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