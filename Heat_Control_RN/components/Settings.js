import * as React from "react";
import Paho from "paho-mqtt";
import { useEffect, useState } from "react";
import {
  Button,
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from "react-native";

/************************************
 *    Creating a new MQTT client    *
 *              start               *
 * **********************************/

const client = new Paho.Client(
  "public.mqtthq.com",
  Number(1883),
  `inTopic-${parseInt(Math.random() * 100)}`
);

/************************************
 *    Creating a new MQTT client    *
 *                end               *
 * **********************************/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export function SettingsScreen({ navigation }) {
  /************************************
   *          State variable          *
   *              start               *
   * **********************************/
  const [value1, setValue1] = React.useState("");
  const [value2, setValue2] = React.useState("");
  const [value3, setValue3] = React.useState("");
  const [isConnected, setIsConnected] = useState(false);
  /************************************
   *          State variable          *
   *                end               *
   * **********************************/

  /********************************************************************
   *   Effect hook to establish MQTT connection and handle messages   *
   *                          start                                   *
   * ******************************************************************/

  useEffect(() => {
    // Function to handle successful connection
    function onConnect() {
      console.log("Connected!");
      setIsConnected(true);
      client.subscribe("topic1");
      client.subscribe("topic2");
      client.subscribe("topic3");
    }

    // Function to handle connection failure
    function onFailure() {
      console.log("Failed to connect!");
      setIsConnected(false);
    }

    /***********************************************
     *    Function to handle incoming messages     *
     *                   start                     *
     * *********************************************/
    function onMessageReceived(message) {
      console.log("Message received:", message.payloadString);
      if (message.destinationName === "topic1") {
        setValue1(parseInt(message.payloadString));
      } else if (message.destinationName === "topic2") {
        setValue2(parseInt(message.payloadString));
      } else if (message.destinationName === "topic3") {
        setValue3(parseInt(message.payloadString));
      }
    }
    /***********************************************
     *    Function to handle incoming messages     *
     *                     end                     *
     * *********************************************/

    /***********************************************
     *          Connect to the MQTT broker         *
     *                   start                     *
     * *********************************************/
    client.connect({
      onSuccess: onConnect,
      onFailure: onFailure,
    });

    /***********************************************r
     *          Connect to the MQTT broker         *
     *                     end                     *
     * *********************************************/

    /***********************************************
     *           Set the message handler           *
     *                  start                      *
     * *********************************************/

    client.onMessageArrived = onMessageReceived;

    /***********************************************
     *           Set the message handler            *
     *                      end                     *
     * *********************************************/
    /*************************************************************
     *   Cleanup function to disconnect when component unmounts  *
     *                         start                             *
     * ***********************************************************/

    return () => {
      client.disconnect();
    };
  }, []);
  /*************************************************************
   *   Cleanup function to disconnect when component unmounts  *
   *                            end                            *
   * ***********************************************************/

  const publishMessage = async () => {
    console.log("publishing message");
    if (!client.isConnected()) {
      console.log("Client is not connected. Attempting to reconnect...");
      try {
        await client.connect(); // Assuming client has a reconnect method
        console.log("Reconnected successfully.");
      } catch (err) {
        console.log("Failed to reconnect:", err);
        return;
      }
    }
 
    const message = new Paho.Message(value1.toString());
    message.destinationName = "topic1";
   

    const message2 = new Paho.Message(value2.toString());
message2.destinationName = "topic2";
    const message3 = new Paho.Message(value3.toString());
    message3.destinationName = "topic3";
    const sendMessages = async () => {
      try {
        await Promise.all([
          client.send(message),
          client.send(message2),
          client.send(message3),
        ]);
        console.log("messages sent");
      } catch (err) {
        console.log("error code", err);
        console.log(err);
      }
    };

    sendMessages();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>Settings Screen</Text>
          <TextInput
            value={value1}
            onChangeText={setValue1}
            style={{
              borderWidth: 1,
              borderColor: "black",
              margin: 10,
              padding: 10,
            }}
          />
          <TextInput
            value={value2}
            onChangeText={setValue2}
            style={{
              borderWidth: 1,
              borderColor: "black",
              margin: 10,
              padding: 10,
            }}
          />
          <TextInput
            value={value3}
            onChangeText={setValue3}
            style={{
              borderWidth: 1,
              borderColor: "black",
              margin: 10,
              padding: 10,
            }}
          />
        </View>
        <View>
          <Button title="Publish" onPress={publishMessage} />
          <Button
            title="Go to Graphs"
            onPress={() => navigation.navigate("Graph")}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

export default SettingsScreen;
