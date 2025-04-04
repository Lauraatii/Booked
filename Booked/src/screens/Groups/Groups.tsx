import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../../../firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useUser } from "../../context/UserContext";
import { globalStyles, GradientButton } from "../../styles/globalStyles";

export default function Groups({ navigation }: any) {
  const { user } = useUser();
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGroups = async () => {
    if (!user) return;

    try {
      const groupsRef = collection(db, "groups");
      const q = query(groupsRef, where("members", "array-contains", user.uid));
      const querySnapshot = await getDocs(q);

      const groupsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupsData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch groups.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name.");
      return;
    }

    try {
      const groupRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        members: [user.uid],
        events: [],
        createdAt: new Date(),
      });

      setGroups((prev) => [
        ...prev,
        { id: groupRef.id, name: groupName, members: [user.uid], events: [] },
      ]);
      setGroupName("");
      setIsCreatingGroup(false);
      Alert.alert("Success", "Group created successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to create group.");
    }
  };

  const renderGroupItem = ({ item }: any) => (
    <TouchableOpacity
      style={globalStyles.groupCard}
      onPress={() => navigation.navigate("GroupDetails", { groupId: item.id })}
    >
      <View style={globalStyles.groupIcon}>
        <Ionicons name="people" size={24} color="#D9FFF5" />
      </View>
      <View style={globalStyles.groupInfo}>
        <Text style={globalStyles.groupName}>{item.name}</Text>
        <Text style={globalStyles.groupMembers}>
          {item.members.length} member{item.members.length !== 1 && "s"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#D9FFF5" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={["#100f0f", "#2a0b4e"]} style={globalStyles.gradient}>
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#D9FFF5" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#100f0f", "#2a0b4e"]} style={globalStyles.gradient}>
      <View style={[globalStyles.container, { paddingTop: 50 }]}>
        {/* Header */}
        <View style={globalStyles.header}>
          <Text style={globalStyles.headerTitle}>Groups</Text>
          <View style={globalStyles.headerButtons}>
            <TouchableOpacity 
              onPress={() => setIsCreatingGroup(true)} 
              style={globalStyles.createGroupButton}
            >
              <Ionicons name="add" size={24} color="#D9FFF5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Group Creation Modal */}
        {isCreatingGroup && (
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContent}>
              <Text style={globalStyles.modalTitle}>Create a New Group</Text>
              <Text style={[globalStyles.modalSubtitle, { marginBottom: 15 }]}>
                Enter a name for your new group
              </Text>
              
              <TextInput
                style={globalStyles.input}
                placeholder="Group Name"
                placeholderTextColor="#aaa"
                value={groupName}
                onChangeText={setGroupName}
                maxLength={30}
                autoFocus
              />
              <Text style={globalStyles.charLimit}>{groupName.length}/30</Text>
              
              <View style={globalStyles.modalButtons}>
                <TouchableOpacity
                  style={globalStyles.cancelButton}
                  onPress={() => setIsCreatingGroup(false)}
                >
                  <Text style={globalStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <GradientButton onPress={handleCreateGroup}>
                  Create Group
                </GradientButton>
              </View>
            </View>
          </View>
        )}

        {/* Group List */}
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={renderGroupItem}
          contentContainerStyle={globalStyles.groupList}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#D9FFF5"
            />
          }
          ListEmptyComponent={
            <View style={globalStyles.emptyState}>
              <Ionicons name="people-outline" size={50} color="#D9FFF5" />
              <Text style={globalStyles.emptyText}>No groups yet. Create one!</Text>
            </View>
          }
        />
      </View>
    </LinearGradient>
  );
}