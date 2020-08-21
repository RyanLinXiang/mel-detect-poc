import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const container = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#FDF7EC",
};

const cards = {
  borderWidth: 0,
  backgroundColor: "transparent",
  alignItems: "center",
  justifyContent: "center",
  width: screenWidth * 0.8,
  height: screenWidth * 0.8,
  shadowOpacity: 0.75,
  shadowRadius: 5,
  shadowColor: "black",
  paddingVertical: 30,
};

export { container, cards, screenWidth, screenHeight };
