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
  const [value4, setValue4] = React.useState("");
  const [value5, setValue5] = React.useState("");
  const [value6, setValue6] = React.useState("");
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
      client.subscribe("topic4");
      client.subscribe("topic5");
      client.subscribe("topic6");
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
      if (message.destinationName === "topic4") {
        setValue4(parseInt(message.payloadString));
      }
       else if (message.destinationName === "topic5") {
        setValue5(parseInt(message.payloadString));
      }
       else if (message.destinationName === "topic6") {
        setValue6(parseInt(message.payloadString));
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
    console.log("Client is connected:", isConnected);
    if (!isConnected) {
      console.log("Client is not connected.");
      return;
    }

    // let message = new Paho.Message("1");
    // message.destinationName = "inTopic";
    // client.send(message);
    // console.log("Message sent:", message.payloadString);

    //Reset the value after 5 seconds and set the value back to 0
    // setTimeout(() => {
    //   setValue(0);
    //   message = new Paho.Message("0");
    //   message.destinationName = "inTopic";
    //   client.send(message);
    //   console.log("Message sent:", message.payloadString);
    // }, 5000);
  }

  /**************************************************************
   *         Function to change the value and send it           *
   *                           end                              *
   * ***********************************************************/
  return (
    console.log("value4", value4),
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Gauges</Text>
      <View
      >
        <Text>{"value 4 = " + value4 + "\n"}</Text>
        <Text>{"value 5 = " + value5 + "\n"}</Text>
        <Text>{"value 6 = " + value6}</Text>
      </View>
      {/* <Button
        title="Go to Settings"
        onPress={() => {
          navigation.navigate("Settings", {
            itemId: 86,
            otherParam: "anything you want here",
          });
        }}
      /> */}
    </View>
  );
}

export default GaugeScreen;
