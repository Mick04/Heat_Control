// In App.js in a new project

import * as React from 'react';
import {Button, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet } from 'react-native';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import SettingsScreen from './components/Settings.js';
import GaugeScreen from './components/Gauges.js';

function Screen3Screen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Screen3</Text>
      <Button
        title="Go to Gauges"
        onPress={() => navigation.navigate('Gauges')}
      />
    </View>
  );
}

const Stack = createNativeStackNavigator();

function GaugeStack() {
  return (
    <Stack.Navigator initialRouteName="Gauges">
      <Stack.Screen name="Gauges" component={GaugeScreen}/>
      <Stack.Screen name="Screen3" component={Screen3Screen} />
    </Stack.Navigator>
  );
}


const Tab = createMaterialTopTabNavigator();

function App() {
  return (
    <SafeAreaView style={styles.container}>
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Screen3">
        <Tab.Screen name="Gauges" component={GaugeStack} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Screen3" component={Screen3Screen} />
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



// function App() {
//   return (
   
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Screen3">
//         <Stack.Screen name="Gauges" component={GaugeScreen}/>
//         <Stack.Screen name="Settings" component={SettingsScreen} />
//         <Stack.Screen name="Screen3" component={Screen3Screen} />
//         <Stack.Screen name="Tabs" component={TabNavigator} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

export default App;
