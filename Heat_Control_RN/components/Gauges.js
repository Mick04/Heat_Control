import * as React from 'react';
import {Button, View, Text } from 'react-native';

// import SettingsScreen from './Settings.js';

export function GaugeScreen({ navigation }) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Gauges</Text>
        <Button
          title="Go to Setting"
          onPress={() => navigation.navigate('Settings', {
              itemId: 86,
              otherParam: 'anything you want here',
            })}
        />
      </View>
    );
  }

  export default GaugeScreen;