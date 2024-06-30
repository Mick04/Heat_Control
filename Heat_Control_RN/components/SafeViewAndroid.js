import { StyleSheet, Platform} from "react-native";

export default StyleSheet.create({
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? 250 : 0
  }
}); 
