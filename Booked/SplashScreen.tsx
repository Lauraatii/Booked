import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Welcome");
    }, 2000); // 2-second delay
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require("/Users/computer/Desktop/Booked/Booked/src/assets/Logo1.png")} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000", 
  },
  logo: {
    width: 150, 
    height: 150,
    resizeMode: "contain",
  },
});

export default SplashScreen;
