import { StyleSheet } from "react-native";
import { CORNER_SIZE, CORNER_THICKNESS } from "../constants/cameraConstants";

export const scanStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraView: {
    borderRadius: 20, // 모서리 둥글게
    marginTop: -90, // 위로 올리기
    position: "relative",
  },
  cameraViewInner: {
    flex: 1,
    borderRadius: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayMiddle: {
    flexDirection: "row",
  },
  overlaySide: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayBottom: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  cropArea: {
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "#fff",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  guideTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  guideText: {
    color: "rgba(255, 255, 255, 0.81)",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(48, 46, 46, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    transform: [{ rotate: "90deg" }],
  },
  errorContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  errorText: {
    marginTop: 6,
    color: "#ffb4b4",
  },
  controls: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctrlLeft: {
    minWidth: 84,
    alignItems: "flex-start",
  },
  ctrlSpacer: {
    minWidth: 84,
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#e6e6e6",
  },
  ctrlButton: {
    paddingVertical: 14,
    paddingHorizontal: 0,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    minWidth: 15,
    minHeight: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  ctrlText: {
    color: "#fff",
    fontWeight: "600",
    transform: [{ rotate: "90deg" }],
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: "#2f6ef6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
