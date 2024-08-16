//Dials.js
import * as React from "react";
import Paho from "paho-mqtt";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useEffect, useState } from "react";
import { useMQTT } from "./MQTTContext.js";

// const widthAndHeight = 150;
// const series = [323, 321, 123, 789, 537];
// const sliceColor = ["#fbd203", "#ffb300", "#ff9100", "#ff6c00", "#ff3c00"];

// const AnimatedCircle = Animated.createAnimatedComponent(Circle);
/************************************
 *    Creating a new MQTT client    *
 *              start               *
 * **********************************/
// const clientId = `inTopic-${parseInt(Math.random() * 100)}-${Date.now()}`;
// const client = new Paho.Client("public.mqtthq.com", Number(1883), clientId);

/************************************
 *    Creating a new MQTT client    *
 *                end               *
 * **********************************/

/************************************
 *          Main component          *
 *              start               *
 * **********************************/

export default function DialsScreen({
  // coolSide = 15,
  // coolSide = 75,
  radius = 60,
  strokeWidth = 10,
  duration = 500,
  color = "tomato",
  colorCoolSide = "green",
  colorOutSide = "blue",
  colorHeater = "orange",
  delay = 0,
  textColorCoolSide = "green",
  textOutSide = "blue",
  textHeater = "orange",
  max = 100,
}) {
  const [outSide, setOutSideTemp] = useState([]);
  const [coolSide, setCoolSideTemp] = useState([]);
  const [heater, setControlTemp] = useState([]);
  const [heaterStatus, setheaterStatus] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const circleRef = React.useRef();
  const halfCircle = radius + strokeWidth;
  const circleCoolSide = 2 * Math.PI * radius;
  const strokeDashoffsetCoolSide =
    circleCoolSide - (circleCoolSide * coolSide) / max;
  const circleHeater = 2 * Math.PI * radius;
  const strokeDashoffsetHeater = circleHeater - (circleHeater * heater) / max;
  const circleoutSide = 2 * Math.PI * radius;
  const strokeDashoffsetoutSide =
    circleoutSide - (circleoutSide * outSide) / max;
  /********************************************************************
   *   Effect hook to establish MQTT connection and handle messages   *
   *                          start                                   *
   * ******************************************************************/
  useEffect(() => {
    if (client && isConnected) {
      client.subscribe("outSide", { qos: 1 });
      client.subscribe("coolSide", { qos: 1 });
      client.subscribe("heater", { qos: 1 });
      client.subscribe("heaterStatus", { qos: 1 });

      client.on("message", (topic, message) => {
        const parsedMessage = parseInt(message.toString(), 10);
        switch (topic) {
          case "outSide":
            setOutSideTemp(parsedMessage);
            break;
          case "coolSide":
            setCoolSideTemp(parsedMessage);
            break;
          case "heater":
            setControlTemp(parsedMessage);
            break;
          case "heaterStatus":
            setHeaterStatus(parsedMessage);
            break;
          default:
            console.log("Unknown topic:", topic);
        }
      });
    }

    return () => {
      if (client) {
        client.unsubscribe("outSide");
        client.unsubscribe("coolSide");
        client.unsubscribe("heater");
        client.unsubscribe("heaterStatus");
      }
    };
  }, [client, isConnected]);

  function Reconnect() {
    if (client && !isConnected) {
      client.reconnect();
    }
  }

  // useEffect(() => {
  //   const clearRetainedMessages = () => {
  //     const clearMessage = new Paho.Message("");
  //     clearMessage.retained = true;

  //     ["control"].forEach((topic) => {
  //       clearMessage.destinationName = topic;
  //       client.send(clearMessage);
  //     });
  //   };

  //   function onConnect() {
  //     console.log("Connected!");
  //     setIsConnected(true);
  //     client.subscribe("outSide", { qos: 1 });
  //     client.subscribe("coolSide", { qos: 1 });
  //     client.subscribe("heater", { qos: 1 });
  //     client.subscribe("heaterStatus", { qos: 1 });
  //     // client.subscribe("amTemperature",{ qos: 1 });
  //     // client.subscribe("pmTemperature",{ qos: 1 });
  //     reconnectTimeout = 1000; // reset timeout on successful connection
  //     clearRetainedMessages(); // Clear retained messages
  //   }
  //   function onFailure() {
  //     console.log("Failed to connect!");
  //     setIsConnected(false);
  //     setTimeout(Reconnect, reconnectTimeout);
  //     reconnectTimeout = Math.min(reconnectTimeout * 2, 60000); // Exponential backoff
  //   }

  //   function onMessageReceived(message) {
  //     // console.log("Message received:", message.destinationName);
  //     switch (message.destinationName) {
  //       case "outSide":
  //         setOutSideTemp(parseInt(message.payloadString));
  //         // console.log("111111111Unknown topic:", message.destinationName);
  //         break;
  //       case "coolSide":
  //         setCoolSideTemp(parseInt(message.payloadString));
  //         // console.log("222222222Unknown topic:", message.destinationName);
  //         // console.log("************setCoolSideTemp|||||||||||||| =", coolSide);
  //         break;
  //       case "heater":
  //         setControlTemp(parseInt(message.payloadString));
  //         // console.log("3333333333333Unknown topic:", message.destinationName);
  //         break;
  //       case "heaterStatus":
  //         console.log("@@@@@@@@@@heaterStatus", heaterStatus);
  //         setheaterStatus(parseInt(message.payloadString));
  //         console.log("heaterStatus", heaterStatus);
  //         if (heaterStatus === 1) {
  //           console.log("heaterStatus", heaterStatus);
  //           colorHeater = "red";
  //         } else if (heaterStatus === 0) {
  //           console.log("****  heaterStatus", heaterStatus);
  //           colorHeater = "green";
  //         }
  //         // console.log("3333333333333Unknown topic:", message.destinationName);
  //         break;
  //       default:
  //         console.log("Unknown topic:", message.destinationName);
  //     }
  //   }
  //   client.onMessageArrived = onMessageReceived;
  //   client.connect({
  //     keepAliveInterval: 60, // in seconds
  //     onSuccess: onConnect,
  //     onFailure: onFailure,
  //   });

  //   let reconnectTimeout = 1000;

  //   // console.log("************coolSide£££££££££££££ =", coolSide);

  //   return () => {
  //     client.disconnect();
  //   };
  // }, []);
  /*************************************************************
   *   Cleanup function to disconnect when component unmounts  *
   *                            end                            *
   * ***********************************************************/
  /*******************************************
   *      Function to reconnect              *
   *               start                     *
   *******************************************/
  // function Reconnect() {
  //   if (!client.isConnected()) {
  //     console.log("Attempting to reconnect...");
  //     client.connect({
  //       onSuccess: onConnect,
  //       onFailure: onFailure,
  //       keepAliveInterval: 60,
  //     });
  //   } else {
  //     console.log("Already connected.");
  //   }
  // }

  /*******************************************
   *      Function to reconnect              *
   *                 end                     *
   *******************************************/

  // React.useEffect(() => {
  //   const maxPerc = (100 * coolSide) / max;
  // });
  // console.log("coolSide", coolSide);
  return (
    /**********************
     ******* Cool Side ****
     ********* Start ******
     **********************/

    <View style={styles.dialsContainer}>
      {/* cool side */}
      <View style={styles.coolSideContainer}>
        <View>
          <Text style={styles.coolSideText}>coolSide</Text>
        </View>
        <Svg
          width={radius * 2}
          height={radius * 2}
          viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
        >
          <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
            <Circle
              ref={circleRef}
              cx="50%"
              cy="50%"
              stroke={"green"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              r={radius}
              fill="transparent"
              strokeOpacity={0.2}
            />
            <Circle
              cx="50%"
              cy="50%"
              stroke={colorCoolSide}
              strokeWidth={strokeWidth}
              r={radius}
              fill="transparent"
              strokeDasharray={circleCoolSide}
              strokeDashoffset={strokeDashoffsetCoolSide}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <TextInput
          underlineColorAndroid="transparent"
          editable={false}
          value={String(coolSide)}
          style={[
            StyleSheet.absoluteFillObject,
            styles.CoolSidePercent,
            { fontSize: radius / 2, color: textColorCoolSide ?? color },
            { fontWeight: "bold" },
          ]}
        />
      </View>
      {/*****************/}
      {/**** CoolSide ***/}
      {/****** end ******/}
      {/*****************/}

      {/*****************/}
      {/***** outSide ****/}
      {/***** start *****/}
      {/*****************/}
      <View style={styles.outSideContainer}>
        <View>
          <Text style={styles.outSideText}>outSide</Text>
        </View>

        <Svg
          width={radius * 2}
          height={radius * 2}
          viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
        >
          <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
            <Circle
              ref={circleRef}
              cx="50%"
              cy="50%"
              stroke={colorOutSide}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              r={radius}
              fill="transparent"
              strokeOpacity={0.2}
            />
            <Circle
              cx="50%"
              cy="50%"
              stroke={colorOutSide}
              strokeWidth={strokeWidth}
              r={radius}
              fill="transparent"
              strokeDasharray={circleoutSide}
              strokeDashoffset={strokeDashoffsetoutSide}
              strokeLinecap="round"
            />
          </G>
        </Svg>

        <TextInput
          underlineColorAndroid="transparent"
          editable={false}
          value={String(outSide)}
          style={[
            StyleSheet.absoluteFillObject,
            styles.outSidePercent,
            { fontSize: radius / 2, color: textOutSide ?? color },
            { fontWeight: "bold", textAlign: "center" },
          ]}
        />
      </View>
      {/*****************/}
      {/***** outSide ****/}
      {/****** end ******/}
      {/*****************/}

      {/*****************/}
      {/***** heater ****/}
      {/***** start *****/}
      {/*****************/}
      <View style={styles.heaterContainer}>
        <View>
          <Text style={styles.heaterText}>Heater</Text>
        </View>

        <Svg
          width={radius * 2}
          height={radius * 2}
          viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
        >
          <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
            <Circle
              ref={circleRef}
              cx="50%"
              cy="50%"
              stroke={colorHeater}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              r={radius}
              fill="transparent"
              strokeOpacity={0.2}
            />
            <Circle
              cx="50%"
              cy="50%"
              stroke={colorHeater}
              strokeWidth={strokeWidth}
              r={radius}
              fill="transparent"
              strokeDasharray={circleHeater}
              strokeDashoffset={strokeDashoffsetHeater}
              strokeLinecap="round"
            />
          </G>
        </Svg>

        <TextInput
          underlineColorAndroid="transparent"
          editable={false}
          value={String(heater)}
          style={[
            StyleSheet.absoluteFillObject,
            styles.HeaterPercent,
            { fontSize: radius / 2, color: textHeater ?? color },
            { fontWeight: "bold", textAlign: "center" },
          ]}
        />
      </View>
      {/*****************/}
      {/***** heater ****/}
      {/****** end ******/}
      {/*****************/}
      <View style={styles.connectionStatusContainer}>
        <Text
          style={[
            styles.connectionStatusText,
            { color: isConnected ? "green" : "red" },
          ]}
        >
          {isConnected
            ? "Connected to MQTT Broker"
            : "Disconnected from MQTT Broker"}
        </Text>
      </View>
      <View style={styles.reconnectButton}>
        <TouchableOpacity onPress={Reconnect}>
          <Text style={styles.reconnectButtonText}>Reconnect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dialsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 50,
    // marginTop: 5,
  },
  coolSideContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    left: 5,
  },
  coolSideText: {
    fontSize: 24,
    color: "green",
  },
  CoolSidePercent: {
    fontSize: 32,
    marginTop: 20,
    marginLeft: 105,
    color: "blue",
  },

  outSideContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 10,
    left: 5,
  },
  outSideText: {
    fontSize: 24,
    color: "blue",
  },
  outSidePercent: {
    fontSize: 32,
    marginTop: 20,
    Left: 5,
    color: "blue",
  },

  heaterContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 10,
    left: 5,
  },
  heaterText: {
    fontSize: 24,
    color: "red",
  },
  HeaterPercent: {
    fontSize: 32,
    marginTop: 20,
    Left: 5,
    color: "blue",
  },

  connectionStatusContainer: {
    position: "absolute",
    flex: 1,
    alignItems: "center",
    paddingTop: 350,
    marginLeft: 190,
  },
  connectionStatusText: {
    fontSize: 24,
    margin: 20,
  },
  reconnectButton: {
    position: "absolute",
    backgroundColor: "green",
    padding: 15,
    left: 290,
    top: 350,

    borderRadius: 25,
  },
  reconnectButtonText: {
    color: "white",
    fontSize: 20,
  },
});
