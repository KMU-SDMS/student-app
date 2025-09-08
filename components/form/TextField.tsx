import React, { memo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Colors } from "../../constants/Colors";
import type { KeyboardTypeOptions } from "react-native";

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  testID?: string;
}

const TextFieldComponent: React.FC<TextFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const mode: "light" | "dark" = colorScheme === "dark" ? "dark" : "light";
  const styles = React.useMemo(() => createTextFieldStyles(mode), [mode]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors[mode].icon}
        multiline={multiline}
        keyboardType={keyboardType}
        testID={testID}
      />
    </View>
  );
};

TextFieldComponent.displayName = "TextField";

export const TextField = memo(TextFieldComponent);

const createTextFieldStyles = (mode: "light" | "dark") => {
  const palette = Colors[mode];
  return StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: palette.icon,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: mode === "light" ? "#E5E7EB" : "#2A2E33",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: mode === "light" ? "#F6F7F9" : "#1F2123",
      color: palette.text,
    },
    multilineInput: {
      height: 80,
      textAlignVertical: "top",
    },
  });
};

export default TextField;
