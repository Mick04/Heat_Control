// In App.js in a new project

import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import SettingsScreen from "./components/Settings.js";
import GaugeScreen from "./components/Gauges.js";
import GraphScreen from "./components/Graph.js";

// const Stack = createNativeStackNavigator();

// function GaugeStack() {
//   return (
//     <Stack.Navigator initialRouteName="SettingsScreen">
//       <Stack.Screen name="Gauges" component={GaugeScreen} />
//       <Stack.Screen name="Settings" component={SettingsScreen} />
//       <Stack.Screen name="Graph" component={GraphScreen} />
//     </Stack.Navigator>
//   );
// }

const Tab = createMaterialTopTabNavigator();
function App() {
  return (
    <SafeAreaView style={styles.container}>
      <NavigationContainer>
        <Tab.Navigator initialRouteName="Settings">
          <Tab.Screen name="Gauges" component={GaugeScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
          <Tab.Screen name="Graph" component={GraphScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default App;
