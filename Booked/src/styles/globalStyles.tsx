import { StyleSheet, TouchableOpacity, Text, View, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

export const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#100f0f",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  gradient: {
    flex: 1,
  },

  // Typography
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  subtitle: {
    color: "#5967EB",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  text: {
    color: "#fff",
    fontSize: 14,
  },

  // Inputs
  input: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginLeft: 5,
    marginBottom: 10,
  },

  // Buttons
  buttonContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    padding: 16,
  },

  // Links
  linkText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  // Form footers
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },

  // Profile
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#5967EB",
  },
  uploadText: {
    color: "#5967EB",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },

  // Interests
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  interestButton: {
    padding: 10,
    borderRadius: 20,
    margin: 5,
    backgroundColor: "rgba(89, 77, 168, 0.3)",
  },
  interestText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Home Screen Styles
  banner: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    marginBottom: 15,
    marginTop: 50,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  eventBanner: {
    alignItems: "center",
    marginBottom: 10,
  },
  bannerText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 5,
  },
  bannerEventTitle: {
    fontSize: 18,
    color: "#fff",
    marginTop: 5,
    fontWeight: "bold",
  },
  sectionSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },
  sectionButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  sectionButtonActive: {
    backgroundColor: "#594DA8",
  },
  sectionText: {
    fontSize: 16,
    color: "#5967EB",
    fontWeight: "600",
  },
  sectionTextActive: {
    color: "#fff",
  },
  categoryList: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryButton: {
    backgroundColor: "rgba(89, 77, 168, 0.3)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  categoryButtonActive: {
    backgroundColor: "#594DA8",
  },
  categoryText: {
    fontSize: 14,
    color: "#5967EB",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#fff",
  },
  eventCard: {
    marginHorizontal: 10,
    marginVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  eventDetails: {
    paddingVertical: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  eventLocation: {
    fontSize: 14,
    color: "#5967EB",
    marginTop: 5,
  },
  eventAttendees: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 5,
  },
  modalText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    lineHeight: 20,
  },
  eventText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  // Unified Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', 
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 20,
    marginBottom: 5,
  },
  modalBody: {
    marginBottom: 24,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "center", 
    gap: 12,
    marginTop: 20,
  },
  modalButtonContainer: {
    borderRadius: 10,
    overflow: "hidden",
  },
  modalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modalCancelButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalConfirmButton: {
    backgroundColor: "#594DA8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalConfirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 6,
  },

  // Groups Screen Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  createGroupButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(89, 77, 168, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(89, 77, 168, 0.5)",
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  groupIcon: {
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  groupMembers: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  charLimit: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "right",
    marginBottom: 16,
  },
  modalButtons: {
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },
  groupList: {
    paddingBottom: 20,
  },

  // Group Info Styles
  groupInfoContainer: {
    flex: 1,
    backgroundColor: "#100f0f",
    paddingHorizontal: 16,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  groupImageContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#5967EB",
  },
  // groupName: {
  //   fontSize: 24,
  //   fontWeight: "bold",
  //   color: "#fff",
  //   marginTop: 16,
  //   textAlign: "center",
  // },
  loadingText: {
    fontSize: 16,
    color: "#5967EB",
    marginTop: 10,
  },
  groupNameInput: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  memberCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
  },
  descriptionContainer: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  descriptionText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  membersList: {
    paddingBottom: 20,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#5967EB",
  },
  memberName: {
    fontSize: 16,
    color: "#fff",
  },
  addMemberButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(89, 77, 168, 0.3)",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(89, 77, 168, 0.5)",
  },
  addMemberText: {
    fontSize: 16,
    color: "#5967EB",
    marginLeft: 8,
    fontWeight: "600",
  },
  optionsContainer: {
    marginTop: 24,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  optionText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 12,
  },
  dangerOptionText: {
    color: "#FF6B6B",
  },

  // Group Chat Styles
  groupChatContainer: {
    flex: 1,
    backgroundColor: "#100f0f",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  groupInfoButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 12,
  },
  smallGroupImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#5967EB",
  },
  chatContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    paddingTop: 6,
    paddingBottom: 6,
    borderRadius: 12,
    marginVertical: 3,
    },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#594DA8",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  messageTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 4,
    textAlign: "right",
  },
// message date styles
dateHeaderContainer: {
  alignItems: 'center',
  marginVertical: 16,
},
dateHeaderBackground: {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 20,
  paddingHorizontal: 16,
  paddingVertical: 6,
},
dateHeaderText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '500',
},
dateSection: {
  marginBottom: 16,
},
messagesList: {
  paddingHorizontal: 16,
},
availabilityContainer: {
  alignItems: 'center',
  marginVertical: 8,
},
calendarIcon: {
  marginRight: 8,
},
headerButton: {
  padding: 8,
},
plusButton: {
  padding: 8,
  marginRight: 8,
},
sendButton: {
  padding: 8,
  marginLeft: 8,
},
availabilityMessage: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 10,
  backgroundColor: '#E8EBFF',
  borderRadius: 20,
},
  availabilityMessageText: {
    color: '#5967EB',
    fontWeight: '500',
  },
  availabilityModalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  availabilityTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  availabilityTab: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#594DA8',
  },
  tabText: {
    color: '#fff',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  timelineContainer: {
    marginBottom: 20,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timelineTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timelineSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  timeline: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeSlotUser: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5967EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timeSlotUserText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeSlotInfo: {
    flex: 1,
  },
  timeSlotTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeSlotTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  timeSlotStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 12,
  },
  timeSlotStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  availabilityList: {
    paddingBottom: 20,
  },
  availabilityUser: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  dateBlock: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  dateBlockTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  dateBlockText: {
    color: '#666',
    fontSize: 14,
  },
  statusBadge: {
    marginTop: 5,
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  pendingBadge: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  approvedBadge: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
  },
  approveButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#5967EB',
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  approveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  datePickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    datePickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    datePickerLabel: {
      flex: 1,
      color: '#fff',
      fontWeight: '600',
    },
    datePickerValue: {
      color: '#fff',
      fontWeight: '600',
    },
    datePickerButton: {
      padding: 8,
      backgroundColor: 'rgba(89, 77, 168, 0.3)',
      borderRadius: 8,
      marginLeft: 12,
    },
    availabilityTitleInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: 16,
      color: '#fff',
      fontSize: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    suggestedTimesContainer: {
      marginBottom: 20,
    },
    suggestedTime: {
      backgroundColor: 'rgba(89, 77, 168, 0.3)',
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: 'rgba(89, 77, 168, 0.5)',
    },
    suggestedTimeText: {
      color: '#fff',
      fontSize: 14,
    },
    suggestedTimeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    suggestedTimeTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    suggestedTimeCount: {
      color: '#5967EB',
      fontSize: 14,
      fontWeight: '600',
    },
    emptyStateText: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 16,
      textAlign: 'center',
      marginTop: 10,
    },
  availabilityItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  plusModalContent: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 12,
  },
  scrollToBottomButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "rgba(89, 77, 168, 0.7)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  overlappingDatesContainer: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  overlappingDatesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  overlappingDate: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  noDatesText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },

});

export const eventStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#100f0f",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },
  errorStatus: {
    backgroundColor: '#FF3B30',
  },
  successStatus: {
    backgroundColor: '#34C759',
    borderWidth: 1,
    borderColor: '#2DA44E',
  },
  infoStatus: {
    backgroundColor: '#007AFF',
  },
  syncStatusText: {
    color: '#fff',
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  closeStatusButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  syncButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(89, 77, 168, 0.5)',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(89, 77, 168, 0.8)',
  },
  syncText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  calendarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  eventList: {
    marginBottom: 10,
    maxHeight: 300,
  },
  eventItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 3,
  },
  eventCategory: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  modalScrollView: {
    paddingBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#fff",
  },
  timeButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  timeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(89, 77, 168, 0.3)",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "rgba(89, 77, 168, 0.5)",
  },
  timeButtonText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "rgba(89, 77, 168, 0.5)",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },
  pickerLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
    paddingLeft: 10,
  },
  picker: {
    backgroundColor: "rgba(16, 15, 15, 0.8)",
    color: "#fff",
  },
  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(89, 77, 168, 0.3)",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(89, 77, 168, 0.5)",
  },
  collapsibleHeaderText: {
    color: "#fff",
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  addButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(89, 103, 235, 0.2)",
  },
});


// Type definitions for the components
interface GroupButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

interface GroupOptionButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  style?: StyleProp<ViewStyle>;
}

interface GradientButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

type ModalButtonType = "confirm" | "cancel";

interface ModalButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  type?: ModalButtonType;
  style?: StyleProp<ViewStyle>;
}

interface EditProfileProps {
  navigation: any; // to to be replaced with proper navigation type
}

// components 
export const GroupButton: React.FC<GroupButtonProps> = ({ children, onPress, icon, style = {} }) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[globalStyles.addMemberButton, style]}
    >
      {icon && <Ionicons name={icon} size={24} color="#5967EB" />}
      <Text style={globalStyles.addMemberText}>{children}</Text>
    </TouchableOpacity>
  );
};

export const GroupOptionButton: React.FC<GroupOptionButtonProps> = ({ 
  children, 
  onPress, 
  icon, 
  danger = false, 
  style = {} 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[globalStyles.optionItem, style]}
    >
      <Ionicons 
        name={icon} 
        size={24} 
        color={danger ? "#FF6B6B" : "#5967EB"} 
      />
      <Text style={[
        globalStyles.optionText,
        danger && globalStyles.dangerOptionText
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export const GradientButton: React.FC<GradientButtonProps> = ({ children, onPress, style = {} }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[globalStyles.buttonContainer, style]}>
      <LinearGradient
        colors={["#594DA8", "#574BA6", "#453995", "#2D1C9F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          borderRadius: 12,
        }}
      />
      <Text style={globalStyles.buttonText}>{children}</Text>
    </TouchableOpacity>
  );
};

export const ModalButton: React.FC<ModalButtonProps> = ({ 
  children, 
  onPress, 
  type = "confirm", 
  style = {} 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        type === "cancel" 
          ? globalStyles.modalCancelButton 
          : globalStyles.modalConfirmButton,
        globalStyles.modalButtonContainer,
        style
      ]}
    >
      <Text style={
        type === "cancel" 
          ? globalStyles.modalCancelButtonText 
          : globalStyles.modalConfirmButtonText
      }>
        {children}
      </Text>
    </TouchableOpacity>
  );
};