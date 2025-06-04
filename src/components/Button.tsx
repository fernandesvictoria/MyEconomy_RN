import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export default function Button({ title, onPress, disabled = false }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled
      ]}
    >
      <Text style={[
        styles.buttonText,
        disabled && styles.disabledText
      ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: "#cccccc",
  },
  disabledText: {
    color: "#666666",
  },
});