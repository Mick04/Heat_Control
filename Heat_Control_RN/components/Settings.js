import * as React from 'react';
import {Button,View, Text } from 'react-native';

export  function SettingsScreen({ navigation }) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Settings Screen</Text>
            <Button
          title="Go to Graphs"
          onPress={() => navigation.navigate('Graph')}
        />
          </View>
        );
      }

      export default SettingsScreen;