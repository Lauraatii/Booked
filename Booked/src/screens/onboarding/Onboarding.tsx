import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import * as Animatable from "react-native-animatable";

const onboardingData = [
  {
    id: 1,
    title: "Create or Join Groups",
    description: "Easily create groups and invite friends to stay connected.",
    image: require("../../../assets/onboarding1.png"),
  },
  {
    id: 2,
    title: "Share Your Availability",
    description: "Easily update and share your free time with friends.",
    image: require("../../../assets/onboarding2.png"),
  },
  {
    id: 3,
    title: "Plan Trips Together",
    description: "Find the best time and place for your next trip with friends.",
    image: require("../../../assets/onboarding3.png"),
  },
];

export default function Onboarding({ navigation }: any) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < onboardingData.length - 1) {
      setStep(step + 1);
    } else {
      navigation.replace("Main");
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.Image 
        animation="fadeInUp"
        duration={600}
        source={onboardingData[step].image}
        style={styles.image}
        resizeMode="contain"
      />
      
      <Animatable.Text animation="fadeInDown" duration={500} style={styles.title}>
        {onboardingData[step].title}
      </Animatable.Text>

      <Text style={styles.description}>{onboardingData[step].description}</Text>

      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index) => (
          <View key={index} style={[styles.dot, step === index && styles.activeDot]} />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {step > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{step === onboardingData.length - 1 ? "Get Started" : "Next"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.replace("Main")}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#31C99E", padding: 20 },
  image: { width: "80%", height: "50%" },
  title: { fontSize: 24, fontWeight: "bold", color: "#7DFFE3", textAlign: "center", marginBottom: 10 },
  description: { fontSize: 16, color: "#D9FFF5", textAlign: "center", marginBottom: 20 },
  indicatorContainer: { flexDirection: "row", marginBottom: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#D9FFF5", marginHorizontal: 5, opacity: 0.5 },
  activeDot: { backgroundColor: "#7DFFE3", opacity: 1 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", width: "80%" },
  backButton: { backgroundColor: "#D9FFF5", padding: 12, borderRadius: 10, flex: 1, alignItems: "center", marginRight: 10 },
  button: { backgroundColor: "#26A480", padding: 12, borderRadius: 10, flex: 1, alignItems: "center" },
  buttonText: { color: "#7DFFE3", fontSize: 18, fontWeight: "bold" },
  skipText: { color: "#D9FFF5", fontSize: 14, marginTop: 10 },
});
