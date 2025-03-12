import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "react-native-vector-icons";
import * as Linking from "expo-linking";


import Login from "./src/screens/Login";
import Signup from "./src/screens/Signup";
import ResetPassword from "./src/screens/ResetPassword";
import Home from "./src/screens/Home/Home";
import Profile from "./src/screens/profile/Profile";
import EditProfile from "./src/screens/profile/EditProfile";
import Groups from "./src/screens/Groups/Groups";
import GroupDetails from "./src/screens/Groups/GroupDetails";
import GroupInfo from "./src/screens/Groups/GroupInfo";
import Events from "./src/screens/Calendar/Events";
import Onboarding from "./src/screens/onboarding/Onboarding";

// Deep linking configuration
const linking = {
  prefixes: ['Booked://'],
  config: {
    screens: {
      Home: 'home',
      Groups: 'groups',
      Events: 'events',
      Profile: 'profile',
      GroupDetails: 'groupDetails', 
      EditProfile: 'editProfile',
      GroupInfo: 'groupInfo'
    },
  },
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


// Authentication Stack (for Login, Signup, and ResetPassword)
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Onboarding" component={Onboarding} />
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
          } else if (route.name === "My calendar") {
            iconName = "calendar";
          } else if (route.name === "Profile") {
            iconName = "person";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#31C99E",
        tabBarInactiveTintColor: "000",
        tabBarStyle: { backgroundColor: "#FFFFFF", borderTopWidth: 0 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Groups" component={Groups} />
      <Tab.Screen name="My calendar" component={Events} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

// Root Navigator to Switch Between Authentication and Main App
export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="GroupDetails" component={GroupDetails} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="GroupInfo" component={GroupInfo}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
