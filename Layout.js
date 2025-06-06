import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from "./src/hooks/useAuth";
import Despesa from "./src/screens/Despesa";
import Limite from "./src/screens/Limite";
import Home from "./src/screens/home/Home";
import Login from "./src/screens/login/Login";
import SignUp from "./src/screens/login/SignUp";
import Profile from "./src/screens/Profile"; // Importe a tela Profile

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
              <Stack.Screen
                name="Limite"
                component={Limite}
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
