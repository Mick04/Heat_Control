// Gauges.js
import * as React from "react";
import Paho from "paho-mqtt";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

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
    }

    function onFailure() {
      console.log("Failed to connect!");
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
        case "amTemperature":
          setAmTemperature(parseInt(message.payloadString));
          break;
        case "pmTemperature":
          setPmTemperature(parseInt(message.payloadString));
          break;
        case "gaugeHours":
          setgaugeHours(parseInt(message.payloadString));
          break;
        case "gaugeMinutes":
          setgaugeMinutes(parseInt(message.payloadString));
          break;
        default:
          console.log("Unknown topic:", message.destinationName);
      }
    }

    client.connect({
      onSuccess: onConnect,
      onFailure: onFailure,
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
        },
        onFailure: (err) => {
          console.log("Failed to reconnect:", err);
          setIsConnected(false);
        },
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
    <View style={styles.container}>
      <Text style={styles.heading}>Gauges</Text>
      <Text style={styles.timeText}>Hours: Minutes</Text>
      <Text style={styles.time}>
        {gaugeHours}:{gaugeMinutes}
      </Text>
      <Text style={styles.TargetTempText}>
        {"Am Traget Temperature = " + amTemperature}{" "}
      </Text>
      <Text style={styles.TargetTempText}>
        {"Pm Target Temperature = " + pmTemperature}{" "}
      </Text>
      <View style={styles.tempContainer}>
        <Text style={styles.tempText}>
          {"outSide Temperature = " + outSide + "\n"}
        </Text>
        <Text style={styles.tempText}>
          {"coolSide Temperature = " + coolSide + "\n"}
        </Text>
        <Text style={styles.tempText}>{"heater Temperature = " + heater}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 2,
    paddingTop: 50,
  },
  heading: {
    fontSize: 20,
    color: "red",
    // padding: 10,
    // marginleft: 10,
    marginBottom: 15,
    fontStyle: "italic",
    fontFamily: "sans-serif",
    textDecorationLine: "underline",
  },
  timeText: {
    justifyContent: "space-between",
    alignItems: "center",
    // padding: 10,
    marginBottom: 10,
    fontSize: 20,
    marginLeft: 15,
    color: "blue",
  },
  time: {
    justifyContent: "space-between",
    alignItems: "center",
    // padding: 10,
    marginLeft: 20,
    marginBottom: 10,
    fontSize: 20,
    color: "blue",
  },
  TargetTempText: {
    fontSize: 24,
    color: "blue",
    padding: 10,
  },
  heading: {
    fontSize: 24,
    color: "red",
    padding: 30,
  },
  tempContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  tempText: {
    fontWeight: "bold",
    color: "#008060",
    fontSize: 20,
  },
  reconnectButton: {
    backgroundColor: "blue",
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  reconnectText: {
    color: "white",
    fontSize: 20,
  },
  connectionStatus: {
    fontSize: 20,
    margin: 20,
  },
});
export default GaugeScreen;
