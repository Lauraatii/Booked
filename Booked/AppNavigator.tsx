import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";

import SplashScreen from "./SplashScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
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

type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  Auth: undefined;
  Main: undefined;
  GroupDetails: { groupId: string };
  EditProfile: undefined;
  GroupInfo: { groupId: string };
  ResetPassword: undefined;
  Onboarding: undefined;
};

type MainTabParamList = {
  Home: undefined;
  Groups: undefined;
  "My calendar": undefined;
  Profile: undefined;
};


const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();


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
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Groups":
              iconName = "people";
              break;
            case "My calendar":
              iconName = "calendar";
              break;
            case "Profile":
              iconName = "person";
              break;
            default:
              iconName = "help"; // fallback icon
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#31C99Ergba(255, 255, 255, 0.)",
        tabBarInactiveTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#594DA8", paddingTop: 8, borderTopWidth: 0 },
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
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="GroupDetails" component={GroupDetails} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="GroupInfo" component={GroupInfo}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
