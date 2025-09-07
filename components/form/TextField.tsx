import React, { memo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
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
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        keyboardType={keyboardType}
        testID={testID}
      />
    </View>
  );
};

TextFieldComponent.displayName = "TextField";

export const TextField = memo(TextFieldComponent);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
    color: "#333",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
});

export default TextField;
