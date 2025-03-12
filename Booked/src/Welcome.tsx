import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import Login from "./screens/Login";


export default function WelcomeScreen ({navigation} :any) {
    const [loading, setLoading ] = useState(false);

    const handleWelcome = async () => {
        setLoading(true);
        navigation.navigate(Login);
        setLoading(false);
        
    }

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Welcome!</Text>
    
    </View>
        );
};

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: "#31C99E",
        padding:20,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
    }
})


