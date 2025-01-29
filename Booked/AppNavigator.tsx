import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "react-native-vector-icons";


import Login from "./src/screens/Login";
import Signup from "./src/screens/Signup";
import ResetPassword from "./src/screens/ResetPassword";
import Home from "./src/screens/Home";
import Profile from "./src/screens/Profile";
import Groups from "./src/screens/Groups";
import Events from "./src/screens/Events";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


// Authentication Stack (for Login, Signup, and ResetPassword)
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
    </Stack.Navigator>
  );
}

// Main App Navigation with Bottom Tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Groups") {
            iconName = "people";
          } else if (route.name === "Events") {
            iconName = "calendar";
          } else if (route.name === "Profile") {
            iconName = "person";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#31C99E",
        tabBarInactiveTintColor: "#D9FFF5",
        tabBarStyle: { backgroundColor: "#FFFFFF", borderTopWidth: 0 },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Groups" component={Groups} />
      <Tab.Screen name="Events" component={Events} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

// Root Navigator to Switch Between Authentication and Main App
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
