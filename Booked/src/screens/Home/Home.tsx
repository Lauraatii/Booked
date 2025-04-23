import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { globalStyles, GradientButton, ModalButton } from "../../styles/globalStyles";
import { auth, db } from "../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// Categories for filtering events in Explore section
const categories = [
  { id: "1", name: "All" },
  { id: "2", name: "Trips" },
  { id: "3", name: "Parties" },
  { id: "4", name: "Outdoor" },
  { id: "5", name: "Dining" },
  { id: "6", name: "Gaming" },
  { id: "7", name: "Concerts" },
];

// Helper function to generate unique IDs for events
const generateUniqueId = (event, index) => {
  return event.id ? `${event.id}-${index}` : `event-${index}-${Date.now()}`;
};

// Custom styles specific to the Home component
const homeStyles = StyleSheet.create({
  contentContainer: {
    paddingTop: 20, 
    flex: 1,
  },
  
  // Category filter buttons in Explore section
  categoryButtonContainer: {
    justifyContent: 'center', 
    paddingHorizontal: 16, 
    borderRadius: 21, 
    marginHorizontal: 6, 
    backgroundColor: "rgba(89, 77, 168, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(89, 77, 168, 0.5)",
    height: 42, 
  },
  categoryButtonContainerActive: {
    backgroundColor: "#594DA8",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5967EB",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },

  // Event card styling
  eventCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  // Public event tag styling
  publicEventTag: {
    color: '#5967EB',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600'
  },

  // Modal footer buttons container
  modalFooterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonHalf: {
    width: '48%', 
  },
});

export default function Home({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSection, setSelectedSection] = useState("My Events");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [exploreEvents, setExploreEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetches events from Firestore and iCloud calendar
   * Handles both personal and public events
   */
  const fetchEvents = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const availability = docSnap.data().availability || [];
        const now = new Date();
        
        // Process personal events - filter out past events and add metadata
        const personalEvents = availability
          .filter(event => {
            const eventDate = event.startDate ? new Date(event.startDate) : null;
            return eventDate && eventDate >= now;
          })
          .map((event, index) => ({
            id: generateUniqueId(event, index),
            originalId: event.id,
            title: event.title || "Untitled Event",
            date: event.startDate ? event.startDate.split('T')[0] : now.toISOString().split('T')[0],
            datetime: event.startDate ? new Date(event.startDate) : new Date(),
            location: event.description || "No location specified",
            attendees: event.participants?.length || 0,
            description: event.notes || "No description provided",
            category: event.category || "Other",
            source: event.source || 'local'
          }));

        // Sort events by date (soonest first)
        personalEvents.sort((a, b) => a.datetime - b.datetime);

        // Remove potential duplicates
        const uniqueEventsMap = new Map();
        personalEvents.forEach(event => uniqueEventsMap.set(event.id, event));
        
        setMyEvents(Array.from(uniqueEventsMap.values()));
        
        // Public events data - in a real app, this would come from a public events collection
        const publicEvents = [
          {
            id: "public-1",
            title: "Community Meetup 🎉",
            date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            datetime: new Date(Date.now() + 86400000 * 2),
            location: "City Park",
            attendees: 15,
            description: "Join our community meetup for fun activities and networking",
            category: "Parties",
            isPublic: true
          },
          {
            id: "public-2",
            title: "Tech Conference 💻",
            date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
            datetime: new Date(Date.now() + 86400000 * 5),
            location: "Convention Center",
            attendees: 120,
            description: "Annual tech conference with industry leaders",
            category: "Meeting",
            isPublic: true
          },
          {
            id: "public-3",
            title: "Beach Volleyball 🏐",
            date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            datetime: new Date(Date.now() + 86400000 * 3),
            location: "Sunset Beach",
            attendees: 8,
            description: "Casual beach volleyball game - all skill levels welcome!",
            category: "Outdoor",
            isPublic: true
          }
        ];
        
        setExploreEvents([...publicEvents]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  // Current date helpers
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const hasEventToday = myEvents.some(event => event.date === today);
  const hasEvents = myEvents.length > 0;

  // Filter events by selected category in Explore section
  const filteredEvents = selectedCategory === "All"
    ? exploreEvents
    : exploreEvents.filter((event) => event.category === selectedCategory);

  /**
   * Handles sharing an event
   */
  const handleShareEvent = () => {
    if (!selectedEvent) return;
    Alert.alert(
      "Share Event",
      `Would you like to share "${selectedEvent.title}" with others?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Share", onPress: () => {
          // use the Share API
          Alert.alert("Shared", "Event shared successfully!");
        }}
      ]
    );
  };

  /**
   * Handles event card press - opens modal with event details
   */
  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  /**
   * Handles edit event action
   * For cloud-synced events, shows alert to edit in calendar app
   */
  const handleEditEvent = (event) => {
    if (event.source === 'cloud') {
      Alert.alert("Info", "Cloud-synced events must be edited in your calendar app");
      return;
    }
    navigation.navigate("Events", { eventToEdit: event });
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
      <View style={[globalStyles.container, { paddingTop: 0 }]}>

        {/* Section selector tabs (My Events / Explore) */}
        <View style={[globalStyles.sectionSelector, { paddingTop: 50}]}>
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

        {/* My Events section */}
        {selectedSection === "My Events" ? (
          <FlatList
            data={myEvents}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#fff"]}
                tintColor="#fff"
              />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Ionicons name="calendar-outline" size={40} color="#fff" />
                <Text style={{ color: '#fff', marginTop: 10 }}>No upcoming events</Text>
                <GradientButton 
                  onPress={() => navigation.navigate("Events")}
                  style={{ marginTop: 20 }}
                >
                  Create Your First Event
                </GradientButton>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={homeStyles.eventCard} 
                onPress={() => handleEventPress(item)}
              >
                <View style={globalStyles.eventDetails}>
                  <Text style={globalStyles.eventTitle}>{item.title}</Text>
                  <Text style={globalStyles.eventLocation}>{item.location}</Text>
                  <Text style={[globalStyles.eventText, { marginTop: 4 }]}>
                    {item.datetime.toLocaleDateString()} • {item.datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={globalStyles.eventText}>
                    {item.attendees} {item.attendees === 1 ? 'friend' : 'friends'} attending
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          /* Explore section */
          <>
            {/* Category filter scroll view */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[globalStyles.categoryList, { paddingVertical: 8, marginTop: 10 }]}
            >
              {categories.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    homeStyles.categoryButtonContainer,
                    selectedCategory === item.name && homeStyles.categoryButtonContainerActive
                  ]}
                  onPress={() => setSelectedCategory(item.name)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    homeStyles.categoryButtonText,
                    selectedCategory === item.name && homeStyles.categoryButtonTextActive
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Filtered events list */}
            <FlatList
              data={filteredEvents}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#fff"]}
                  tintColor="#fff"
                />
              }
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                  <Ionicons name="calendar-outline" size={40} color="#fff" />
                  <Text style={{ color: '#fff', marginTop: 10 }}>No events found for this category</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={homeStyles.eventCard}
                  onPress={() => handleEventPress(item)}
                >
                  <View style={globalStyles.eventDetails}>
                    <Text style={globalStyles.eventTitle}>{item.title}</Text>
                    <Text style={globalStyles.eventLocation}>{item.location}</Text>
                    <Text style={[globalStyles.eventText, { marginTop: 4 }]}>
                      {item.datetime.toLocaleDateString()} • {item.datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={globalStyles.eventText}>
                      {item.attendees} people going
                    </Text>
                    {item.isPublic && (
                      <Text style={homeStyles.publicEventTag}>
                        Public Event - Tap to learn more
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* Event details modal */}
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
            <View style={globalStyles.modalContent}>
              {selectedEvent && (
                <>
                  <View style={globalStyles.modalHeader}>
                    <Text style={globalStyles.modalTitle}>{selectedEvent.title}</Text>
                    <Text style={globalStyles.modalSubtitle}>
                      {selectedEvent.datetime.toLocaleDateString()} • {selectedEvent.datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={globalStyles.modalSubtitle}>
                      {selectedEvent.location}
                    </Text>
                    {selectedEvent.source === 'cloud' && (
                      <Text style={[globalStyles.modalSubtitle, { color: '#5967EB' }]}>
                        (Synced from your calendar)
                      </Text>
                    )}
                    {selectedEvent.isPublic && (
                      <Text style={[globalStyles.modalSubtitle, { color: '#5967EB' }]}>
                        Public Event
                      </Text>
                    )}
                  </View>
                  
                  <View style={globalStyles.modalBody}>
                    <Text style={globalStyles.modalText}>
                      {selectedEvent.description}
                    </Text>
                  </View>
                  
                  {/* Action buttons based on context */}
                  {selectedSection === "My Events" && (
                    <View style={globalStyles.modalFooter}>
                      <ModalButton 
                        type="cancel"
                        onPress={() => {
                          setModalVisible(false);
                          handleEditEvent(selectedEvent);
                        }}
                      >
                        <View style={globalStyles.modalButtonContent}>
                          <Ionicons name="create-outline" size={16} color="#fff" style={{ marginRight: 8 }} />
                          <Text style={{ color: '#fff' }}>Edit</Text>
                        </View>
                      </ModalButton>
                    </View>
                  )}
                  
                  {selectedSection === "Explore" && selectedEvent.isPublic && (
                    <View style={[globalStyles.modalFooter, homeStyles.modalFooterButtons]}>
                      <ModalButton 
                        type="cancel"
                        onPress={() => {
                          Alert.alert("Event Joined", "You've joined this public event!");
                          setModalVisible(false);
                        }}
                        style={homeStyles.modalButtonHalf}
                      >
                        <View style={globalStyles.modalButtonContent}>
                          <Ionicons name="add-outline" size={16} color="#fff" style={{ marginRight: 8 }} />
                          <Text style={{ color: '#fff' }}>Join Event</Text>
                        </View>
                      </ModalButton>
                      <ModalButton 
                        type="primary"
                        onPress={handleShareEvent}
                        style={homeStyles.modalButtonHalf}
                      >
                        <View style={globalStyles.modalButtonContent}>
                          <Ionicons name="share-outline" size={16} color="#fff" style={{ marginRight: 8 }} />
                          <Text style={{ color: '#fff' }}>Share</Text>
                        </View>
                      </ModalButton>
                    </View>
                  )}

                  <TouchableOpacity
                    style={globalStyles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </LinearGradient>
  );
}