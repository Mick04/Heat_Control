// Gauges.js
import * as React from "react";
import Paho from "paho-mqtt";
import { useEffect, useState } from "react";
import { View, Text} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [outSideTemp, setoutSideTemp] = useState(0);
  const [inSideTemp, setinSideTemp] = useState(0);
  const [controlTemp, setcontrolTemp] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  /************************************
   *          State variable          *
   *                end               *
   * **********************************/

  /************************************
   *  Effect hook to retrieve data    *
   *             start                *
   ***********************************/
  useEffect(() => {
    retrieveData("outSideTemp", setoutSideTemp);
    retrieveData("inSideTemp", setinSideTemp);
    retrieveData("controlTemp", setcontrolTemp);
  }, []);
  /************************************
   *  Effect hook to retrieve data    *
   *               end                *
   ***********************************/

  /********************************************************************
   *   Effect hook to establish MQTT connection and handle messages   *
   *                          start                                   *
   * ******************************************************************/

  useEffect(() => {
    function onConnect() {
      console.log("Connected!");
      setIsConnected(true);
      client.subscribe("topic4");
      client.subscribe("topic5");
      client.subscribe("topic6");
    }
    /************************************
     *  Function to handle failure      *
     *             start                *
     ***********************************/ 
    function onFailure() {
      console.log("Failed to connect!");
      setIsConnected(false);
    }
    /************************************
     * Function to handle failure       *
     *              end                 *
     ***********************************/

    /***********************************************
     *    Function to handle incoming messages     *
     *                   start                     *
     * *********************************************/
    function onMessageReceived(message) {
      console.log("Message received:");
      if (message.destinationName === "topic4") {
        setoutSideTemp(parseInt(message.payloadString));
        storeData("outSideTemp", message.payloadString); // Store updated value
      }
      // else if (message.destinationName === "topic3") {
      else if (message.destinationName === "topic5") {
        setinSideTemp(parseInt(message.payloadString));
        storeData("inSideTemp", message.payloadString); // Store updated value
      } else if (message.destinationName === "topic6") {
        setcontrolTemp(parseInt(message.payloadString));
        storeData("controlTemp", message.payloadString); // Store updated value
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

   /******************************************
    *       Function to store data           *
    *                start                   *
    ******************************************/
  const storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.log(e);
    }
  };
   /******************************************
    *       Function to store data           *
    *                  End                   *
    ******************************************/

   /*******************************************
    *      Function to retrieve data          *
    *               start                     *
    * *****************************************/

  const retrieveData = async (key, setState) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        setState(parseInt(value)); // Update state with retrieved value
      }
    } catch (e) {
      console.log(e);
    }
  };
    /*******************************************
     *     Function to retrieve data           *
     *                 End                     *
     * *****************************************/


  return (
    (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 24,color:"red"}}>Gauges</Text>
        <View>
          <Text style={{ marginTop: 20, fontSize: 20 }}>{"outSideTemp = " + outSideTemp + "\n"}</Text>
          <Text style={{ fontSize: 20}}>{"inSideTemp = " + inSideTemp + "\n"}</Text>
          <Text style={{ fontSize: 20}}>{"controlTemp = " + controlTemp}</Text>
        </View>
      </View>
    )
  );
}

export default GaugeScreen;
