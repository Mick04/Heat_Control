//Setting.js
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import Paho from "paho-mqtt";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

import DatePickerModal from "./DatePickerModal"; // Adjust the path as necessary
import TemperaturePicker from "./TemperaturePicker";

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

export function SettingsScreen() {
  const [Reset, setReset] = useState(true);
  const [amTemperature, setAmTemperature] = useState(null);
  const [pmTemperature, setPmTemperature] = useState(null);
  const [isAMDatePickerVisible, setAMDatePickerVisibility] = useState(false);
  const [isPMDatePickerVisible, setPMDatePickerVisibility] = useState(false);
  const [AMtime, setAMTime] = useState("");
  const [PMtime, setPMTime] = useState("");
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

  /********************************************************************
   *   Effect hook to establish MQTT connection and handle messages   *
   *                          start                                   *
   * ******************************************************************/

  useEffect(() => {
    const clearRetainedMessages = () => {
      const clearMessage = new Paho.Message("");
      clearMessage.retained = true;
  
      ["control"].forEach((topic) => {
        clearMessage.destinationName = topic;
        client.send(clearMessage);
      });
    };
  
    function onConnect() {
      console.log("Connected!");
      setIsConnected(true);
      client.subscribe("control");
      client.subscribe("amTemperature");
      client.subscribe("pmTemperature");
      client.subscribe("AMtime");
      client.subscribe("PMtime");
      clearRetainedMessages(); // Clear retained messages
    }
  
    function onFailure() {
      console.log("Failed to connect!");
      setIsConnected(false);
    }
  
    function onMessageReceived(message) {
      const payload = message.payloadString;
      console.log(`Message received on topic ${message.destinationName} - ${payload}`);
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
        default:
          console.log(`Unhandled topic: ${message.destinationName}`);
      }
    }
  
    client.onMessageArrived = onMessageReceived;
    client.connect({ onSuccess: onConnect, onFailure });
  
    return () => {
      client.disconnect();
    };
  }, []);
  
  /*************************************************************
   *   Cleanup function to disconnect when component unmounts  *
   *                            end                            *
   * ***********************************************************/

  const reconnect = () => {
    if (!client.isConnected()) {
      console.log("Attempting to reconnect...");
      client.connect({
        onSuccess: () => {
          console.log("Reconnected successfully.");
          setIsConnected(true);

          // Clear previous data
          setAmTemperature(null);
          setPmTemperature(null);
          setAMTime("");
          setPMTime("");

          // Optionally, subscribe to the topics again
          client.subscribe("control");
          client.subscribe("amTemperature");
          client.subscribe("pmTemperature");
          client.subscribe("AMtime");
          client.subscribe("PMtime");
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

  const publishMessage = () => {
    console.log("publishing message");
    if (!client.isConnected()) {
      console.log("Client is not connected. Attempting to reconnect...");
      client.connect({
        onSuccess: () => {
          console.log("Reconnected successfully.");
          sendMessages();
        },
        onFailure: (err) => {
          console.log("Failed to reconnect:", err);
        },
      });
    } else {
      sendMessages();
    }
  };
  const sendMessages = () => {
    try {
      const messageAM = new Paho.Message(amTemperature ? amTemperature.toString() : "0");
      messageAM.destinationName = "amTemperature";
      messageAM.retained = false; // Set the retain flag
      client.send(messageAM);

      const messagePM = new Paho.Message(pmTemperature ? pmTemperature.toString(): "0");
      messagePM.destinationName = "pmTemperature";
      messagePM.retained = true; // Set the retain flag
      client.send(messagePM);

      const messageAMTime = new Paho.Message(AMtime ? AMtime.toString(): "00:00");
      messageAMTime.destinationName = "AMtime";
      messageAMTime.retained = true; // Set the retain flag
      client.send(messageAMTime);

      const messagePMTime = new Paho.Message(PMtime ? PMtime.toString(): "00:00");
      messagePMTime.destinationName = "PMtime";
      messagePMTime.retained = true; // Set the retain flag
      client.send(messagePMTime);

    } catch (err) {
      console.log("Failed to send messages:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        {/* Button to toggle the reset state */}

        <TouchableOpacity style={styles.reset} onPress={handleOnPress}>
          <Text style={styles.header}>
            {Reset ? "Press To Reset The Time" : "PRESS WHEN FINISHED"}
          </Text>
        </TouchableOpacity>
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
            label="Pm Target "
            temperature={pmTemperature}
            onValueChange={setPmTemperature}
            // onValueChange={(value) => setPmTemperature(value)}
          />
          <TouchableOpacity
            style={styles.reset}
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

          <TouchableOpacity onPress={handleOpenPMDatePicker}>
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
            {`Am Target Temperature:     ${
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
        <Text style={[styles.connectionStatus,{ color: isConnected ? "green" : "red" }]}>
          {isConnected
            ? "Connected to MQTT Broker"
            : "Disconnected from MQTT Broker"}
        </Text>
      </View>
      <TouchableOpacity style={styles.reconnectButton} onPress={reconnect}>
        <Text style={styles.reconnectText}>Reconnect</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 50,
    marginBottom: 150,
    // justifyContent: "center",
  },
  header: {
    fontSize: 20,
    color: "red",
    // padding: 10,
    fontStyle: "italic",
    fontFamily: "sans-serif",
    textDecorationLine: 'underline',
  },

  dataText: {
    // backgroundColor: "#fff",
    color: "blue",
    margintop: 20,
    fontSize: 20,
  },
  dataReset: {
    fontSize: 20,
    // backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    color: "green",
    
  },
  reset: {
    // justifyContent: "center",
    alignItems: "center",
    // padding: 30,
    color: "blue",
    // Add any additional styling you need for the TouchableOpacity here
  },
  pickerContainer: {
    marginBottom: 20,
  },
  temperatureDisplay: {
    marginTop: 30,
    alignItems: "center",
  },
  temperatureText: {
    padding: 10,
    fontSize: 20,
    color: "blue",
  },
  connectionStatus: {
    marginTop: 10,
    fontSize: 20,
  },
  reconnectButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  reconnectText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default SettingsScreen;
