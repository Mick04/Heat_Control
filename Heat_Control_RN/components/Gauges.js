// Gauges.js
import * as React from "react";
import Paho from "paho-mqtt";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
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
  const [outSide, setoutSideTemp] = useState(0);
  const [coolSide, setinSideTemp] = useState(0);
  const [heater, setcontrolTemp] = useState(0);
  const [amTemperature, setamTemperature] = useState(0);
  const [pmTemperature, setpmTemperature] = useState(0);
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
    retrieveData("outSide", setoutSideTemp);
    retrieveData("coolSide", setinSideTemp);
    retrieveData("heater", setcontrolTemp);
    retrieveData("amTemperature", setamTemperature);
    retrieveData("pmTemperature", setpmTemperature);
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
      client.subscribe("outSide");
      client.subscribe("coolSide");
      client.subscribe("heater");
      client.subscribe("amTemperature");
      client.subscribe("pmTemperature");
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
      // console.log("Message received:");
      if (message.destinationName === "outSide") {
        setoutSideTemp(parseInt(message.payloadString));
        storeData("outSide", message.payloadString); // Store updated value
      }
      // else if (message.destinationName === "topic3") {
      else if (message.destinationName === "coolSide") {
        setinSideTemp(parseInt(message.payloadString));
        storeData("coolSide", message.payloadString); // Store updated value
      } else if (message.destinationName === "heater") {
        setcontrolTemp(parseInt(message.payloadString));
        storeData("heater", message.payloadString); // Store updated value
      } else if (message.destinationName === "amTemperature") {
        setamTemperature(parseInt(message.payloadString));
      } else if (message.destinationName === "pmTemperature") {
        setpmTemperature(parseInt(message.payloadString));
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
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 24, color: "green", padding: 10 }}>
        {"amTemperature = " + amTemperature}{" "}
      </Text>
      <Text style={{ fontSize: 24, color: "green" }}>
        {"pmTemperature = " + pmTemperature}{" "}
      </Text>
      <Text style={{ fontSize: 24, color: "red", padding: 10 }}>Gauges</Text>
      <View>
        <Text style={{ marginTop: 20, fontSize: 20 }}>
          {"outSide = " + outSide + "\n"}
        </Text>
        <Text style={{ fontSize: 20 }}>{"coolSide = " + coolSide + "\n"}</Text>
        <Text style={{ fontSize: 20 }}>{"heater = " + heater}</Text>
      </View>
    </View>
  );
}

export default GaugeScreen;
