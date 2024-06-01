// Gauges.js
import * as React from "react";
import Paho from "paho-mqtt";
import { useEffect, useState } from "react";
import { Button, View, Text } from "react-native";

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

/************************************
 *          Main component          *
 *              start               *
 * **********************************/

export function GaugeScreen({ navigation }) {
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
      // client.subscribe("topic3");
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

  /*************************************************************
   *         Function to change the value and send it          *
   *                          start                            *
   * ***********************************************************/

  function changeValue() {
    if (!isConnected) {
      console.log("Client is not connected.");
      return;
    }

    let message = new Paho.Message("1");
    message.destinationName = "inTopic";
    client.send(message);
    console.log("Message sent:", message.payloadString);

    //Reset the value after 5 seconds and set the value back to 0
    setTimeout(() => {
      setValue(0);
      message = new Paho.Message("0");
      message.destinationName = "inTopic";
      client.send(message);
      console.log("Message sent:", message.payloadString);
    }, 5000);
  }

  /**************************************************************
   *         Function to change the value and send it           *
   *                           end                              *
   * ***********************************************************/
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Gauges</Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "10%",
        }}
      >
        <Text>{value1}</Text>
        <Text>{value2}</Text>
        <Text>{value3}</Text>
      </View>
      <Button
        title="Go to Settings"
        onPress={() => {
          navigation.navigate("Settings", {
            itemId: 86,
            otherParam: "anything you want here",
          });
        }}
      />
    </View>
  );
}

export default GaugeScreen;
