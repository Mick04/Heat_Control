//Setting.js
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import Paho from "paho-mqtt";
import { useEffect, useState, useCallback,useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import DatePickerModal from "./DatePickerModal"; // Adjust the path as necessary
import TemperaturePicker from "./TemperaturePicker";
import { styles } from "../Styles/styles";

export function SettingsScreen() {
  /************************************
   *          State variables         *
   *              start               *
   * **********************************/
  const [Reset, setReset] = useState(true);
  const [amTemperature, setAmTemperature] = useState(null);
  const [pmTemperature, setPmTemperature] = useState(null);
  const [isAMDatePickerVisible, setAMDatePickerVisibility] = useState(false);
  const [isPMDatePickerVisible, setPMDatePickerVisibility] = useState(false);
  const [AMtime, setAMTime] = useState("");
  const [PMtime, setPMTime] = useState("");
  const [gaugeHours, setgaugeHours] = useState(0);
  const [gaugeMinutes, setgaugeMinutes] = useState(0);
  const [HeaterStatus, setHeaterStatus] = useState(false);
  const [targetTemperature, settargetTemperature] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const handleOpenAMDatePicker = () => setAMDatePickerVisibility(true);
  const handleOpenPMDatePicker = () => setPMDatePickerVisibility(true);
  const handleCloseAMDatePicker = () => setAMDatePickerVisibility(false);
  const handleClosePMDatePicker = () => setPMDatePickerVisibility(false);

  // Function to handle AM time change
  const handleTimeChangeAM = (AMtime) => {
    setAMTime(AMtime);
    handleCloseAMDatePicker();
  };
  // Function to handle PM time change
  const handleTimeChangePM = (PMtime) => {
    setPMTime(PMtime);
    handleClosePMDatePicker();
  };

  // Toggle the reset state and log current state for debugging
  const handleOnPress = () => {
    setReset(!Reset);
    if (!Reset) {
      publishMessage(); // Invoke the function here
    }
  };
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
    console.log("Settings screen mounted");
    
    
    checkConnection(1);
   
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
      checkConnection(2);
      console.log("Settings Screen Connected!");
      con;
      setIsConnected(true);
      client.subscribe("control");
      client.subscribe("amTemperature");
      client.subscribe("pmTemperature");
      client.subscribe("AMtime");
      client.subscribe("PMtime");
      client.subscribe("gaugeHours");
      client.subscribe("gaugeMinutes");
      client.subscribe("HeaterStatus");
      client.subscribe("targetTemperature");
      checkConnection(2);
      // clearRetainedMessages(); // Clear retained messages
      console.log("gaugeHours = " + gaugeHours);
    }

    function onFailure() {
      checkConnection(3);
      console.log("Settings Screen Failed to connect!");
      setIsConnected(false);
      checkConnection(3 / 2);
    }

    function onMessageReceived(message) {
      checkConnection(4);
      const payload = message.payloadString;
      switch (message.destinationName) {
        case "amTemperature":
          setAmTemperature(payload);
          break;
        case "pmTemperature":
          setPmTemperature(payload);
          break;
        case "AMtime":
          setAMTime(payload);
          break;
        case "PMtime":
          setPMTime(payload);
          break;
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
          console.log("Unhandled topic:", message.destinationName);
      }
      console.log("Settings Received message:", message.payloadString);
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
        console.log("Settings screen Disconnecting from broker...");
        client.disconnect();
        setIsConnected(false);
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Settings screen focused");
      const client = clientRef.current;
      if (client && !client.isConnected()) {
        client.connect({
          onSuccess: () => {
            console.log("Reconnected successfully.");
            setIsConnected(true);
           // Optionally, subscribe to the topics again
          client.subscribe("control");
          client.subscribe("amTemperature");
          client.subscribe("pmTemperature");
          client.subscribe("AMtime");
          client.subscribe("PMtime");
          client.subscribe("gaugeHours");
          client.subscribe("gaugeMinutes");
          client.subscribe("HeaterStatus");
          client.subscribe("targetTemperature");
          },
          onFailure: (err) => {
            console.log("Settings Screen Failed to reconnect:", err);
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
          console.log("Disconnecting from broker...");
          client.disconnect();
          setIsConnected(false);
        }
      };
    }, [])
  );

  /*************************************************************
   *   Cleanup function to disconnect when component unmounts  *
   *                            end                            *
   * ***********************************************************/

  const reconnect = () => {
    checkConnection(6);
    const client = clientRef.current;
    if (client && !client.isConnected()) {
      console.log("Attempting to reconnect...");
      client.connect({
        onSuccess: () => {
          console.log("Settings Screen Reconnected successfully.");
          setIsConnected(true);
          // Optionally, subscribe to the topics again
          client.subscribe("control");
          client.subscribe("amTemperature");
          client.subscribe("pmTemperature");
          client.subscribe("AMtime");
          client.subscribe("PMtime");
          client.subscribe("gaugeHours");
          client.subscribe("gaugeMinutes");
          client.subscribe("HeaterStatus");
          client.subscribe("targetTemperature");
        },
        onFailure: (err) => {
          checkConnection(7);
          console.log("Settigs Screen Failed to reconnect:", err);
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
      console.log("Settings Screen Already connected.");
    }
  };

  const publishMessage = () => {
    checkConnection(8);
    console.log("publishing message");
    const client = clientRef.current;
    if (!client.isConnected()) {
      console.log("Client is not connected. Attempting to reconnect...");
      client.connect({
        onSuccess: () => {
          console.log("Settings Screen Reconnected successfully.");
          sendMessages();
        },
        onFailure: (err) => {
          console.log("Settings Screen Failed to reconnect:", err);
        },
      });
    } else {
      sendMessages();
    }
  };
  const sendMessages = () => {
    checkConnection(9);
    const client = clientRef.current;
    try {
      const messageAM = new Paho.Message(
        amTemperature ? amTemperature.toString() : "0"
      );
      messageAM.destinationName = "amTemperature";
      messageAM.retained = true; // Set the retain flag
      client.send(messageAM);

      const messagePM = new Paho.Message(
        pmTemperature ? pmTemperature.toString() : "0"
      );
      messagePM.destinationName = "pmTemperature";
      messagePM.retained = true; // Set the retain flag
      client.send(messagePM);

      const messageAMTime = new Paho.Message(
        AMtime ? AMtime.toString() : "00:00"
      );
      messageAMTime.destinationName = "AMtime";
      messageAMTime.retained = true; // Set the retain flag
      client.send(messageAMTime);

      const messagePMTime = new Paho.Message(
        PMtime ? PMtime.toString() : "00:00"
      );
      messagePMTime.destinationName = "PMtime";
      messagePMTime.retained = true; // Set the retain flag
      client.send(messagePMTime);
    } catch (err) {
      console.log("Failed to send messages:", err);
    }
  };

  // Assuming isConnected is a boolean variable indicating the connection status

  function checkConnection(N) {
    if (isConnected) {
      console.log("Settings.js is connected to the broker." + N);
    } else {
      console.log("Settings.js is not connected to the broker." + N);
    }
    return isConnected;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Settings</Text>
        <TouchableOpacity style={styles.reset} onPress={handleOnPress}>
          <Text style={styles.header}>
            {Reset ? "Press To Reset" : "PRESS WHEN FINISHED"}
          </Text>
        </TouchableOpacity>

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
          {/* Button to toggle the reset state */}
        </View>

        {!Reset && ( // Add this line to conditionally render the TimePicker components START
          <>
            {/* TimePicker components for AM and PM times */}
            <View style={styles.pickerContainer}>
              {/* TemperaturePicker components for AM temperatures */}
              <TemperaturePicker
                label="Am Target "
                temperature={amTemperature}
                onValueChange={setAmTemperature}
              />
            </View>
            <TemperaturePicker
              label="Target "
              temperature={pmTemperature}
              onValueChange={setPmTemperature}
              // onValueChange={(value) => setPmTemperature(value)}
            />
            <TouchableOpacity
              style={styles.timeReset}
              onPress={handleOpenAMDatePicker}
            >
              <Text style={styles.dataReset}>Select AM Time</Text>
              <DatePickerModal
                isVisible={isAMDatePickerVisible}
                onClose={handleCloseAMDatePicker}
                onTimeChange={handleTimeChangeAM}
              />
              <Text style={styles.dataText}>AM Time {AMtime}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeReset}
              onPress={handleOpenPMDatePicker}
            >
              <Text style={styles.dataReset}>Select PM Time </Text>

              <DatePickerModal
                isVisible={isPMDatePickerVisible}
                onClose={handleClosePMDatePicker}
                onTimeChange={handleTimeChangePM}
              />
              <Text style={styles.dataText}>PM Time {PMtime}</Text>
            </TouchableOpacity>
          </>
        )}
        {/* Add this line to conditionally render the TimePicker components END */}

        {Reset && ( // Add this line to conditionally render the TimePicker components START
          <>
            <Text style={styles.temperatureText}>
              {`AM Target Temperature:     ${
                amTemperature !== null ? `${amTemperature}°C` : "Not selected"
              }`}
            </Text>
            <Text style={styles.temperatureText}>
              {`Pm Target Temperature:    ${
                pmTemperature !== null ? `${pmTemperature}°C` : "Not selected"
              }`}
            </Text>
          </>
        )}
        <View style={styles.pickerContainer}>
          {Reset && ( // Add this line to conditionally render the TimePicker components
            <>
              <Text style={styles.dataReset}>
                {AMtime !== null ? `${AMtime} AM` : "Not selected"}
              </Text>

              <Text style={styles.dataReset}>
                {PMtime !== null ? `${PMtime} PM` : "Not selected"}
              </Text>
            </>
          )}
          <StatusBar style="auto" />
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
export default SettingsScreen;
