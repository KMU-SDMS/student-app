import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { scanStyles } from "../styles/scanStyles";

interface CameraControlsProps {
  torchOn: boolean;
  onTorchToggle: () => void;
  onCapture: () => void;
  isCapturing: boolean;
  bottomOffset: number;
  insetsBottom: number;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  torchOn,
  onTorchToggle,
  onCapture,
  isCapturing,
  bottomOffset,
  insetsBottom,
}) => {
  return (
    <View
      style={[scanStyles.controls, { bottom: bottomOffset + insetsBottom }]}
    >
      <View style={scanStyles.ctrlLeft}>
        <TouchableOpacity onPress={onTorchToggle} style={scanStyles.ctrlButton}>
          <Text style={scanStyles.ctrlText}>
            {torchOn ? "플래시 끔" : "플래시 켬"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={scanStyles.shutter}
        onPress={onCapture}
        disabled={isCapturing}
      >
        <View
          style={[scanStyles.shutterInner, isCapturing && { opacity: 0.6 }]}
        />
      </TouchableOpacity>

      <View style={scanStyles.ctrlSpacer} />
    </View>
  );
};
