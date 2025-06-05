import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from "./src/screens/home/Home";
import Profile from "./src/screens/Profile"; // Importe a tela Profile
import Login from "./src/screens/login/Login";
import Despesa from "./src/screens/Despesa"; 
import SignUp from "./src/screens/login/SignUp";
import { useAuth } from "./src/hooks/useAuth";
import { Text } from 'react-native';

const Stack = createNativeStackNavigator();

export default function Layout() {
  const { authState, onLogout } = useAuth();
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          {!authState.authenticated ? (
            <>
              <Stack.Screen
                name="Login"
                component={Login}
                options={{
                  headerTitle: "Login",
                }}
              />
              <Stack.Screen
                name="SignUp"
                component={SignUp}
                options={{
                  headerTitle: "Nova conta",
                }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Profile"
                component={Profile}
                options={{
                  headerShown: false, 
                }}
              />
              <Stack.Screen
                name="Home"
                component={Home}
                options={{
                  headerShown: false, 
                }}
              />
               <Stack.Screen
                name="Despesa"
                component={Despesa}
                options={{
                  headerShown: false, 
                }}
              
              />
              
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}