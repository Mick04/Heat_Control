// Gauges.js
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import Paho from "paho-mqtt";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { styles } from "../Styles/styles";

// import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [amTemperature, setAmTemperature] = useState(0); // don't think i need this
  const [pmTemperature, setPmTemperature] = useState(0); // don't think i need this
  const [gaugeHours, setgaugeHours] = useState(0);
  const [gaugeMinutes, setgaugeMinutes] = useState(0);
  const [HeaterStatus, setHeaterStatus] = useState(false);
  const [targetTemperature, settargetTemperature] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const clientRef = useRef(null);
  /************************************
   *          State variables         *
   *                end               *
   * **********************************/

  /********************************************************************
   *   Effect hook to establish MQTT connection and handle messages   *
   *                          start                                   *
   * ******************************************************************/

  useEffect(() => {
    console.log("Guags Screen Component mounted");

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

    clientRef.current = client;

    function onConnect() {
      console.log("Guags Screen Connected!");
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

    function onFailure() {
      console.log("Guags Screen Failed to connect!");
      setIsConnected(false);
    }

    function onMessageReceived(message) {
      const payload = message.payloadString;
      switch (message.destinationName) {
        case "outSide":
          setOutSideTemp(payload);
          break;
        case "coolSide":
          setCoolSideTemp(payload);
          break;
        case "heater":
          setControlTemp(payload);
          break;
        case "amTemperature":
          setAmTemperature(payload);
          break;
        case "pmTemperature":
          setPmTemperature(payload);
          break;
        case "gaugeHours":
          setgaugeHours(payload);
          break;
        case "gaugeMinutes":
          setgaugeMinutes(payload);
          break;
        case "HeaterStatus":
          const newStatus = message.payloadString.trim() === "true";
          setHeaterStatus(newStatus);
          break;
        case "targetTemperature":
          settargetTemperature(payload.trim());
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
      const client = clientRef.current;
      if (client && client.isConnected()) {
        console.log("Gauges Screen Disconnecting from broker...");
        client.disconnect();
        setIsConnected(false);
      }
    };
  }, []);

  /*************************************************************
   *   Cleanup function to disconnect when component unmounts  *
   *                            end                            *
   * ***********************************************************/

  useFocusEffect(
    useCallback(() => {
      console.log("Guages screen focused");
      const client = clientRef.current;
      if (client && !client.isConnected()) {
        client.connect({
          onSuccess: () => {
            console.log("Guags Screen Reconnected successfully.");
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
          },
          onFailure: (err) => {
            console.log("Failed to reconnect:", err);
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
      }

      return () => {
        const client = clientRef.current;
        if (client && client.isConnected()) {
          console.log("Guags Screen Disconnecting from broker...");
          client.disconnect();
          setIsConnected(false);
        }
      };
    }, [])
  );

  /*******************************************
   *      Function to reconnect              *
   *               start                     *
   *******************************************/
  const reconnect = () => {
    const client = clientRef.current;
    if (client && !client.isConnected()) {
      console.log("Guags Screen Attempting to reconnect...");
      client.connect({
        onSuccess: () => {
          console.log("Guages Screen Reconnected successfully.");
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
        },
        onFailure: (err) => {
          console.log("Failed to reconnect:", err);
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
      console.log("Guages Screen Already connected.");
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

export default GaugeScreen;