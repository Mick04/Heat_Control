import * as React from 'react';
import {Button,View, Text } from 'react-native';


function GraphScreen({ navigation }) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Graph</Text>
        {/* <Button
          title="Go to Gauges"
          onPress={() => navigation.navigate('Gauges')}
        /> */}
      </View>
    );
  }
  export default GraphScreen;
