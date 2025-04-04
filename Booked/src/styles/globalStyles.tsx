import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
    color: "#D9FFF5",
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
    borderColor: "#7DFFE3",
  },
  uploadText: {
    color: "#7DFFE3",
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
    color: "#7DFFE3",
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
    color: "#7DFFE3",
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
    color: "#D9FFF5",
    marginTop: 5,
  },
  eventAttendees: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#100f0f",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#7DFFE3",
    marginTop: 5,
  },
  modalDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 15,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: "#594DA8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 10,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 5,
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
    color: "#D9FFF5",
    textAlign: "center",
    marginTop: 10,
  },
  groupList: {
    paddingBottom: 20,
  },
});

export const GradientButton = ({ children, onPress, style = {} }) => {
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