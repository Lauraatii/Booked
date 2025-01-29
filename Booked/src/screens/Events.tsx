import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Events() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Events Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#31C99E" },
  text: { fontSize: 24, color: "#7DFFE3" },
});
