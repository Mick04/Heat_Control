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

// Import custom components for time and temperature selection
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

//code added from DateTimePicker
// line's 41-53 useState for the time and temperature
const [Reset, setReset] = useState(true);
  const [amTemperature, setAmTemperature] = useState(null);
  const [pmTemperature, setPmTemperature] = useState(null);
  const [isAMDatePickerVisible, setAMDatePickerVisibility] = useState(false);
  const [isPMDatePickerVisible, setPMDatePickerVisibility] = useState(false);
  const [AMtime, setAMTime] = useState("");
  const [PMtime, setPMTime] = useState("");

  const handleOpenAMDatePicker = () => setAMDatePickerVisibility(true);
  const handleOpenPMDatePicker = () => setPMDatePickerVisibility(true);
  const handleCloseAMDatePicker = () => setAMDatePickerVisibility(false);
  const handleClosePMDatePicker = () => setPMDatePickerVisibility(false);

  // Function to handle AM time change
  const handleTimeChangeAM = (AMtime) => {
    setAMTime(AMtime);
    console.log(AMtime);
    handleCloseAMDatePicker();
  };
  // Function to handle PM time change
  const handleTimeChangePM = (PMtime) => {
    setPMTime(PMtime);
    console.log(PMtime);
    handleClosePMDatePicker();
  };

  // Toggle the reset state and log current state for debugging
  const handleOnPress = () => {
    setReset(!Reset);
    if (!Reset){
    publishMessage(); // Invoke the function here
  }
    console.log({ Reset });
  };

  // const [open, setOpen] = useState(false); // opens and closes the modal
  /************************************
   *          State variable          *
   *              start               *
   * **********************************/
  const [value1, setValue1] = React.useState("");
  const [value2, setValue2] = React.useState("");
  const [value3, setValue3] = React.useState("");
  const [value4, setValue4] = React.useState("");
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
      client.subscribe("topic4");
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
      if (message.destinationName === "amTemperature") {
        setValue1(parseInt(message.payloadString));
      } else if (message.destinationName === "pmTemperature") {
        setValue2(parseInt(message.payloadString));
      } else if (message.destinationName === "AMtime") {
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

  const publishMessage = async () => {
    console.log("publishing message");
    if (!client.isConnected()) {
      console.log("Client is not connected. Attempting to reconnect...");
      try {
        await client.connect(); // Assuming client has a reconnect method
        console.log("Reconnected successfully.");
      } catch (err) {
        console.log("Failed to reconnect:", err);
        return;
      }
    }

    const message = new Paho.Message(amTemperature.toString());
    message.destinationName = "topic1";

    const message2 = new Paho.Message(pmTemperature.toString());
    message2.destinationName = "topic2";

    const message3 = new Paho.Message(AMtime.toString());
    message3.destinationName = "topic3";

    const message4 = new Paho.Message(PMtime.toString());
    message4.destinationName = "topic4";
    const sendMessages = async () => {
      try {
        await Promise.all([
          client.send(message),
          client.send(message2),
          client.send(message3),
          client.send(message4),
        ]);
        console.log("messages sent");
      } catch (err) {
        console.log("error code", err);
        console.log(err);
      }
    };

    sendMessages().catch(err => console.error("Failed to send messages:", err));
  };

  // function handleOnPress() {
  //   setOpen(!open);
  // }

  return (
    <SafeAreaView style={styles.container}>
    <View>
      {/* Button to toggle the reset state */}

      <TouchableOpacity style={styles.reset} onPress={handleOnPress}>
        <Text style={styles.dataReset}>
          {Reset ? "Press To Reset The Time" : "PRESS WHEN FINISHED"}
        </Text>
        {/* <Text style={styles.dataReset}>{Reset.toString()}</Text> */}
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
});

export default SettingsScreen;

