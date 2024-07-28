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
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  /*******************************************
   *      Function to retrieve data          *
   *               start                     *
   *******************************************/
  const retrieveData = async (key, setState) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        setState(value);
      }
    } catch (e) {
      console.log("Failed to retrieve data from storage:", e);
    }
  };
  /*******************************************
   *     Function to retrieve data           *
   *                 end                     *
   *******************************************/
  /************************************
   *  Effect hook to retrieve data    *
   *             start                *
   ***********************************/
  useEffect(() => {
    retrieveData("amTemperature", setAmTemperature);
    retrieveData("pmTemperature", setPmTemperature);
    retrieveData("AMtime", setAMTime);
    retrieveData("PMtime", setPMTime);
  }, []);
  /************************************
   *  Effect hook to retrieve data    *
   *               end                *
   ***********************************/

  /*******************************************
   *      Function to store data             *
   *               start                     *
   *******************************************/
  const storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.log("Failed to save the data to the storage:", e);
    }
  };
  /*******************************************
   *      Function to store data             *
   *                 end                     *
   *******************************************/

  /********************************************************************
   *   Effect hook to establish MQTT connection and handle messages   *
   *                          start                                   *
   * ******************************************************************/

  useEffect(() => {
    // Function to handle successful connection
    function onConnect() {
      console.log("Connected!");
      setIsConnected(true);
      client.subscribe("control");
      client.subscribe("amTemperature");
      client.subscribe("pmTemperature");
      client.subscribe("AMtime");
      client.subscribe("PMtime");
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
    // Function to handle incoming messages
    function onMessageReceived(message) {
      const payload = message.payloadString;
      console.log(`message Received on topic ${message.destinationName} - ${payload}`);
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
          case "control":
            if (payload === 'N') {
              setReset(true);
            } else if (payload === 'F') {
              setReset(false);
            }
            break;
            default:
          console.log(`Unhandled topic: ${message.destinationName}`);
      }
    }
    // function onMessageReceived(message) {
    //   if (message.destinationName === "amTemperature") {
    //     setAmTemperature(message.payloadString);
    //   } else if (message.destinationName === "pmTemperature") {
    //     setPmTemperature(message.payloadString);
    //   } else if (message.destinationName === "AMtime") {
    //     setAMTime(message.payloadString);
    //   } else if (message.destinationName === "PMtime") {
    //     setPMTime(message.payloadString);
    //   }
    // }
    /***********************************************
     *    Function to handle incoming messages     *
     *                     end                     *
     * *********************************************/

    /***********************************************
     *          Connect to the MQTT broker         *
     *                   start                     *
     * *********************************************/

    /***********************************************r
     *          Connect to the MQTT broker         *
     *                     end                     *
     * *********************************************/

    /***********************************************
     *           Set the message handler           *
     *                  start                      *
     * *********************************************/

    client.onMessageArrived = onMessageReceived;
    client.connect({ onSuccess: onConnect, onFailure });

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
      const messageN = new Paho.Message("N");
      messageN.destinationName = "control";
      messageN.retained = true; // Set the retain flag
      client.send(messageN);

      const messageAM = new Paho.Message(amTemperature.toString());
      messageAM.destinationName = "amTemperature";
      messageAM.retained = true; // Set the retain flag
      storeData("amTemperature", messageAM.payloadString); // Store updated value
      client.send(messageAM);

      const messagePM = new Paho.Message(pmTemperature.toString());
      messagePM.destinationName = "pmTemperature";
      messagePM.retained = true; // Set the retain flag
      storeData("pmTemperature", messagePM.payloadString); // Store updated value
      client.send(messagePM);

      const messageAMTime = new Paho.Message(AMtime.toString());
      messageAMTime.destinationName = "AMtime";
      messageAMTime.retained = true; // Set the retain flag
      storeData("AMtime", messageAMTime.payloadString); // Store updated value
      client.send(messageAMTime);

      const messagePMTime = new Paho.Message(PMtime.toString());
      messagePMTime.destinationName = "PMtime";
      messagePMTime.retained = true; // Set the retain flag
      storeData("PMtime", messagePMTime.payloadString);
      client.send(messagePMTime);

      setTimeout(() => {
        const messageF = new Paho.Message("F");
        messageF.destinationName = "control";
        messageF.retained = true; // Set the retain flag
        client.send(messageF);
      }, 10000);
    } catch (err) {
      console.log("Failed to send messages:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        {/* Button to toggle the reset state */}

        <TouchableOpacity style={styles.reset} onPress={handleOnPress}>
          <Text style={styles.dataReset}>
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
              label="AM"
              temperature={amTemperature}
              onValueChange={setAmTemperature}
            />
          </View>
          <TemperaturePicker
            label="PM"
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
            {`AM Temperature:     ${
              amTemperature !== null ? `${amTemperature}°C` : "Not selected"
            }`}
          </Text>
          <Text style={styles.temperatureText}>
            {`PM Temperature:    ${
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
        <Text style={{ color: isConnected ? "green" : "red" }}>
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  dataText: {
    backgroundColor: "#fff",
    color: "red",
    margin: 20,
    fontSize: 20,
  },
  dataReset: {
    fontSize: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  reset: {
    justifyContent: "center",
    alignItems: "center",
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
  },
  connectionStatus: {
    marginTop: 20,
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
