// Updated Groups.js with consistent styling
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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../../../firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { useUser } from "../../context/UserContext";
import { globalStyles, GradientButton, ModalButton } from "../../styles/globalStyles";

export default function Groups({ navigation }: any) {
  const { user } = useUser();
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [membersInput, setMembersInput] = useState("");
  const [members, setMembers] = useState<{email: string, uid: string}[]>([]);
  const [errors, setErrors] = useState({
    groupName: "",
    membersInput: "",
  });
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      groupName: "",
      membersInput: "",
    };

    if (!groupName.trim()) {
      newErrors.groupName = "Group name is required";
      valid = false;
    }

    if (membersInput && !validateEmail(membersInput)) {
      newErrors.membersInput = "Please enter a valid email";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

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

  const findUserByEmail = async (email: string) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("User not found", "No user exists with this email address. Make sure they've signed up for the app.");
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      return {
        uid: userDoc.id,
        email: userDoc.data().email
      };
    } catch (error) {
      console.error("Error finding user:", error);
      Alert.alert("Error", "Failed to find user. Please check your connection and try again.");
      return null;
    }
  };

  const handleAddMember = async () => {
    if (!validateForm()) return;
    
    if (!membersInput.trim()) return;
    
    try {
      setIsAddingMembers(true);
      const userToAdd = await findUserByEmail(membersInput.trim());
      
      if (userToAdd) {
        if (members.some(m => m.uid === userToAdd.uid)) {
          Alert.alert("Already added", "This user is already in the group");
          return;
        }
        
        if (userToAdd.uid === user?.uid) {
          Alert.alert("Notice", "You are automatically added as the group creator");
          return;
        }

        setMembers([...members, userToAdd]);
        setMembersInput("");
        setErrors({...errors, membersInput: ""});
      }
    } finally {
      setIsAddingMembers(false);
    }
  };

  const handleRemoveMember = (uid: string) => {
    setMembers(members.filter(m => m.uid !== uid));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setErrors({...errors, groupName: "Group name is required"});
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to create a group");
      return;
    }

    try {
      const groupRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        members: [user.uid],
        events: [],
        createdAt: new Date(),
        createdBy: user.uid,
      });

      const memberUids = members.map(m => m.uid);
      if (memberUids.length > 0) {
        await updateDoc(groupRef, {
          members: arrayUnion(...memberUids)
        });
      }

      const batchUpdates = memberUids.map(async (uid) => {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
          groups: arrayUnion(groupRef.id)
        });
      });

      await Promise.all(batchUpdates);

      setGroups((prev) => [
        ...prev,
        { 
          id: groupRef.id, 
          name: groupName, 
          members: [user.uid, ...memberUids], 
          events: [] 
        },
      ]);
      
      setGroupName("");
      setMembers([]);
      setIsCreatingGroup(false);
      Alert.alert("Success", "Group created successfully!");
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "Failed to create group. Please try again.");
    }
  };

  const renderGroupItem = ({ item }: any) => (
    <TouchableOpacity
      style={globalStyles.groupCard}
      onPress={() => navigation.navigate("GroupDetails", { groupId: item.id })}
    >
      <View style={globalStyles.groupIcon}>
        <Ionicons name="people" size={24} color="#5967EB" />
      </View>
      <View style={globalStyles.groupInfo}>
        <Text style={globalStyles.groupName}>{item.name}</Text>
        <Text style={globalStyles.groupMembers}>
          {item.members.length} member{item.members.length !== 1 && "s"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#5967EB" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.loadingContainer]}>
        <ActivityIndicator size="large" color="#5967EB" />
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, { paddingTop: 80, backgroundColor: "#100f0f" }]}>
      {/* Header */}
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Your Groups</Text>
        <View style={globalStyles.headerButtons}>
          <TouchableOpacity 
            onPress={() => setIsCreatingGroup(true)} 
            style={globalStyles.createGroupButton}
          >
            <Ionicons name="add" size={24} color="#5967EB" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isCreatingGroup}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreatingGroup(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableOpacity 
            style={[globalStyles.modalOverlay, { justifyContent: 'flex-start', paddingTop: 90 }]}
            activeOpacity={1}
            onPress={() => setIsCreatingGroup(false)}
          >
            <TouchableOpacity 
              style={globalStyles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={globalStyles.modalHeader}>
                <Text style={globalStyles.modalTitle}>Create New Group</Text>
                <Text style={globalStyles.modalSubtitle}>
                  Give your group a name and add members by email
                </Text>
              </View>
              
              <View style={globalStyles.modalBody}>
                <View>
                  <Text style={{ color: '#fff', marginBottom: 8 }}>Group Name</Text>
                  <TextInput
                    style={[
                      globalStyles.input,
                      errors.groupName && globalStyles.inputError
                    ]}
                    placeholder="Enter group name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={groupName}
                    onChangeText={(text) => {
                      setGroupName(text);
                      setErrors({...errors, groupName: ""});
                    }}
                    maxLength={30}
                    autoFocus
                  />
                  {errors.groupName ? (
                    <Text style={globalStyles.errorText}>{errors.groupName}</Text>
                  ) : (
                    <Text style={globalStyles.charLimit}>
                      {groupName.length}/30 characters
                    </Text>
                  )}
                </View>

                <View style={{ marginBottom: 10 }}>
                  <Text style={{ color: '#fff', marginBottom: 8 }}>Add Members</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      style={[
                        globalStyles.input,
                        { flex: 1, marginRight: 10 },
                        errors.membersInput && globalStyles.inputError
                      ]}
                      placeholder="Enter member email"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={membersInput}
                      onChangeText={(text) => {
                        setMembersInput(text);
                        setErrors({...errors, membersInput: ""});
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onSubmitEditing={handleAddMember}
                    />
                    <TouchableOpacity
                      onPress={handleAddMember}
                      disabled={isAddingMembers}
                      style={{
                        backgroundColor: '#594DA8',
                        padding: 12,
                        borderRadius: 12,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 12,
                        height: 50,
                        opacity: isAddingMembers ? 0.7 : 1,
                      }}
                    >
                      {isAddingMembers ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Ionicons name="add" size={20} color="#fff" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.membersInput && (
                    <Text style={globalStyles.errorText}>{errors.membersInput}</Text>
                  )}
                </View>

                {members.length > 0 && (
                  <View>
                    <Text style={{ color: '#fff', marginBottom: 8 }}>
                      Members ({members.length + 1}) - You + {members.length} other(s)
                    </Text>
                    <View style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      padding: 12,
                      maxHeight: 150,
                    }}>
                      <FlatList
                        data={members}
                        keyExtractor={(item) => item.uid}
                        renderItem={({ item }) => (
                          <View style={{ 
                            flexDirection: 'row', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingVertical: 8,
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(255, 255, 255, 0.1)',
                          }}>
                            <Text style={{ color: '#fff', flex: 1 }}>{item.email}</Text>
                            <TouchableOpacity 
                              onPress={() => handleRemoveMember(item.uid)}
                              style={{ padding: 4 }}
                            >
                              <Ionicons name="close" size={18} color="#FF6B6B"/>
                            </TouchableOpacity>
                          </View>
                        )}
                      />
                    </View>
                  </View>
                )}
              </View>
              
              <View style={globalStyles.modalFooter}>
                <ModalButton 
                  type="cancel"
                  onPress={() => setIsCreatingGroup(false)}
                >
                  Cancel
                </ModalButton>
                <ModalButton 
                  onPress={handleCreateGroup}
                >
                  Create Group
                </ModalButton>
              </View>

              <TouchableOpacity
                style={globalStyles.modalCloseButton}
                onPress={() => setIsCreatingGroup(false)}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

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
            tintColor="#5967EB"
          />
        }
        ListEmptyComponent={
          <View style={globalStyles.emptyState}>
            <Ionicons name="people-outline" size={50} color="#5967EB" />
            <Text style={globalStyles.emptyText}>No groups yet. Create one!</Text>
          </View>
        }
      />
    </View>
  );
}