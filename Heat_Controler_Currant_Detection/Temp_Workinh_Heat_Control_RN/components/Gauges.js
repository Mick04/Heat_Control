// Gauges.js
import * as React from "react";
import Paho from "paho-mqtt";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { styles } from "../Styles/styles";

// import AsyncStorage from "@react-native-async-storage/async-storage";

/************************************
 *    Creating a new MQTT client    *
 *              start               *
 * **********************************/

const client = new Paho.Client(
  "wss://c846e85af71b4f65864f7124799cd3bb.s1.eu.hivemq.cloud:8884/mqtt",
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

export function GaugeScreen() {
  /************************************
   *          State variables         *
   *              start               *
   * **********************************/
  const [outSide, setOutSideTemp] = useState(0);
  const [coolSide, setCoolSideTemp] = useState(0);
  const [heater, setControlTemp] = useState(0);
  const [amTemperature, setAmTemperature] = useState(0);
  const [pmTemperature, setPmTemperature] = useState(0);
  const [gaugeHours, setgaugeHours] = useState(0);
  const [gaugeMinutes, setgaugeMinutes] = useState(0);
  const [HeaterStatus, setHeaterStatus] = useState(false);
  const [targetTemperature, settargetTemperature] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  /************************************
   *          State variables         *
   *                end               *
   * **********************************/
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
      client.subscribe("gaugeHours");
      client.subscribe("gaugeMinutes");
      client.subscribe("HeaterStatus");
      client.subscribe("targetTemperature");
    }

    function onFailure(error) {
      console.log("Failed to connect!", error);
      setIsConnected(false);
    }

    function onMessageReceived(message) {
      switch (message.destinationName) {
        case "outSide":
          setOutSideTemp(parseInt(message.payloadString));
          break;
        case "coolSide":
          setCoolSideTemp(parseInt(message.payloadString));
          break;
        case "heater":
          setControlTemp(parseInt(message.payloadString));
          break;
        // case "amTemperature":
        //   setAmTemperature(parseInt(message.payloadString));
        //   break;
        // case "pmTemperature":
        //   setPmTemperature(parseInt(message.payloadString));
        //   break;
        case "gaugeHours":
          setgaugeHours(parseInt(message.payloadString));
          break;
        case "gaugeMinutes":
          setgaugeMinutes(parseInt(message.payloadString));
          break;
        case "HeaterStatus":
          const newStatus = message.payloadString.trim() === "true";
          setHeaterStatus(newStatus);
          break;
        case "targetTemperature":
          settargetTemperature(message.payloadString.trim());
          break;
        default:
          console.log("Unknown topic:", message.destinationName);
      }
      console.log("Guages Received message:", message.payloadString);
    }

    client.connect({
      onSuccess: onConnect,
      onFailure: onFailure,
      userName: "Tortoise",
      password: "Hea1951Ter",
      useSSL: true,
      timeout: 10, // Add a timeout for the connection attempt
      keepAliveInterval: 20, // Add keep-alive interval
      cleanSession: true, // Ensure a clean session
      reconnect: true, // Enable automatic reconnection
      mqttVersion: 4, // Ensure the correct MQTT version is used
    });

    client.onMessageArrived = onMessageReceived;

    return () => {
      client.disconnect();
    };
  }, []);
  /*************************************************************
   *   Cleanup function to disconnect when component unmounts  *
   *                            end                            *
   * ***********************************************************/

  /*******************************************
   *      Function to reconnect              *
   *               start                     *
   *******************************************/
  const reconnect = () => {
    if (!client.isConnected()) {
      console.log("Attempting to reconnect...");
      client.connect({
        onSuccess: () => {
          console.log("Reconnected successfully.");
          setIsConnected(true);
          client.subscribe("outSide");
          client.subscribe("coolSide");
          client.subscribe("heater");
          client.subscribe("amTemperature");
          client.subscribe("pmTemperature");
          client.subscribe("AMtime");
          client.subscribe("PMtime");
          client.subscribe("gaugeHours");
          client.subscribe("gaugeMinutes");
          client.subscribe("HeaterStatus");
          client.subscribe("targetTemperature");
        },

        onFailure: (error) => {
          console.log("Failed to reconnect:", error);
          setIsConnected(false);
        },
        userName: "Tortoise",
        password: "Hea1951Ter",
        useSSL: true,
        timeout: 10, // Add a timeout for the connection attempt
        keepAliveInterval: 20, // Add keep-alive interval
        cleanSession: true, // Ensure a clean session
        reconnect: true, // Enable automatic reconnection
        mqttVersion: 4, // Ensure the correct MQTT version is used
      });
    } else {
      console.log("Already connected.");
    }
  };
  /*******************************************
   *      Function to reconnect              *
   *                 end                     *
   *******************************************/

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Gauges</Text>
        <Text style={styles.timeHeader}>
          If time is incorrect, check housing
        </Text>
        <View>
          {/* <Text style={styles.timeText}>Hours: Minutes</Text> */}
          <Text style={styles.time}>
            {gaugeHours}:{gaugeMinutes.toString().padStart(2, "0")}
          </Text>
          <Text
            style={[
              styles.TargetTempText,
              { color: HeaterStatus ? "red" : "green" },
            ]}
          >
            {"Heater Status = " + (HeaterStatus ? "on" : "off")}
          </Text>
        </View>
        <Text style={styles.TargetTempText}>
          {"Target Temperature = " + targetTemperature}{" "}
        </Text>
        <View style={styles.tempContainer}>
          <Text style={[styles.tempText, { color: "black" }]}>
            {"outSide Temperature = " + outSide + "\n"}
          </Text>
          <Text style={[styles.tempText, { color: "green" }]}>
            {"coolSide Temperature = " + coolSide + "\n"}
          </Text>
          <Text style={[styles.tempText, { color: "red" }]}>
            {"heater Temperature = " + heater}
          </Text>
        </View>
        <View style={styles.connectionStatus}>
          <Text
            style={[
              styles.connectionStatus,
              { color: isConnected ? "green" : "red" },
            ]}
          >
            {isConnected
              ? "Connected to MQTT Broker"
              : "Disconnected from MQTT Broker"}
          </Text>
        </View>
        <TouchableOpacity style={styles.reconnectButton} onPress={reconnect}>
          <Text style={styles.reconnectText}>Reconnect</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     alignItems: "center",
//     marginTop: 2,
//     paddingTop: 50,
//   },
//   heading: {
//     fontSize: 24,
//     color: "red",
//     marginBottom: 15,
//     fontStyle: "italic",
//     fontFamily: "sans-serif",
//     textDecorationLine: "underline",
//   },
//   timeText: {
//     justifyContent: "space-between",
//     alignItems: "center",
//     // padding: 10,
//     marginBottom: 10,
//     fontSize: 20,
//     marginLeft: 15,
//     color: "blue",
//   },
//   time: {
//     justifyContent: "space-between",
//     alignItems: "center",
//     // padding: 10,
//     marginLeft: 20,
//     marginBottom: 10,
//     fontSize: 20,
//     color: "blue",
//   },
//   TargetTempText: {
//     fontSize: 24,
//     color: "blue",
//     padding: 10,
//   },
//   tempContainer: {
//     marginTop: 30,
//     marginBottom: 40,
//   },
//   timeHeader: {
//     fontSize: 20,
//     color: "blue",
//     marginBottom: 10,
//     fontStyle: "italic",
//     fontFamily: "sans-serif",
//   },
//   tempText: {
//     fontWeight: "bold",
//     color: "#008060",
//     fontSize: 20,
//   },
//   reconnectButton: {
//     backgroundColor: "blue",
//     padding: 10,
//     margin: 10,
//     borderRadius: 5,
//   },
//   reconnectText: {
//     color: "white",
//     fontSize: 20,
//   },
//   connectionStatus: {
//     fontSize: 20,
//     margin: 20,
//   },
// });
export default GaugeScreen;
