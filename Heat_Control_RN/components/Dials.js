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
import MQTTService from './mqttService';
import NetInfo from "@react-native-community/netinfo";

// const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function DialsScreen({
  radius = 60,
  strokeWidth = 10,
  duration = 500,
  color = "tomato",
  colorCoolSide = "green",
  colorOutSide = "blue",
  colorHeater = "orange",
  delay = 0,
  textColorCoolSide = "green",
  textColor = "black",
  textOutSide = "blue",

  textHeater = "orange",
  max = 100,
}) {
  const [outSide, setOutSideTemp] = useState([]);
  const [coolSide, setCoolSideTemp] = useState([]);
  const [heater, setControlTemp] = useState([]);
  const [heaterStatus, setHeaterStatus] = useState([]);
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

  // const client = new Paho.Client(
  //   "public.mqtthq.com",
  //   Number(1883),
  //   `inTopic-${parseInt(Math.random() * 100)}`
  // );

  // const reconnect = () => {
  //   if (!client.isConnected()) {
  //     console.log("Attempting to reconnect...");
  //     client.connect({
  //       onSuccess: () => {
  //         console.log("Reconnected successfully.");
  //         setIsConnected(true);
  //       },
  //       onFailure: (err) => {
  //         console.log("Failed to reconnect:", err);
  //         setIsConnected(false);
  //         setTimeout(reconnect, 5000); // Retry after 5 seconds
  //       },
  //     });
  //   } else {
  //     console.log("Already connected.");
  //   }
  // };

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);

      if (state.isConnected && !client.isConnected()) {
        reconnect(); // Ensure `reconnect` is within the same scope
      }
    });

    // Connect to MQTT broker
    MQTTService.connect(
      () => {
        console.log('Connected to MQTT broker');
        MQTTService.subscribe('your/topic');
      },
      (error) => {
        console.log('Failed to connect', error);
      }
    );

    // Set up message handling
    MQTTService.onMessageArrived((message) => {
          try {
        const payload = message.payloadString
          ? parseInt(message.payloadString)
          : null;
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
          case "heaterStatus":
            setHeaterStatus(payload);
            break;
          default:
            console.log("Unknown topic:", message.destinationName);
        }
      } catch (error) {
        console.error("Failed to process message:", error);
      }
      console.log('Message received:', message.payloadString);
    });

    // Handle connection loss
    MQTTService.onConnectionLost(() => {
      console.log('Connection lost, attempting to reconnect...');
      MQTTService.connect();
    });

    // Clean up on unmount
    return () => {
      MQTTService.disconnect();
    };
  }, []);
    // function onConnect() {
      // console.log("Connected!");
      // setIsConnected(true);
      // client.subscribe("outSide", { qos: 1 });
      // client.subscribe("coolSide", { qos: 1 });
      // client.subscribe("heater", { qos: 1 });
      // client.subscribe("heaterStatus", { qos: 1 });
    // }

  //   function onMessageReceived(message) {
  //     try {
  //       const payload = message.payloadString
  //         ? parseInt(message.payloadString)
  //         : null;
  //       switch (message.destinationName) {
  //         case "outSide":
  //           setOutSideTemp(payload);
  //           break;
  //         case "coolSide":
  //           setCoolSideTemp(payload);
  //           break;
  //         case "heater":
  //           setControlTemp(payload);
  //           break;
  //         case "heaterStatus":
  //           setHeaterStatus(payload);
  //           break;
  //         default:
  //           console.log("Unknown topic:", message.destinationName);
  //       }
  //     } catch (error) {
  //       console.error("Failed to process message:", error);
  //     }
  //   }

  //   client.onMessageArrived = onMessageReceived;

  //   if (!client.isConnected()) {
  //     client.connect({
  //       onSuccess: onConnect,
  //       onFailure: (error) => {
  //         console.error("Connection failed:", error);
  //         if (error.errorCode === 7) {
  //           setTimeout(reconnect, 5000); // Retry after 5 seconds
  //         }
  //         setIsConnected(false);
  //       },
  //     });
  //   }

  //   return () => {
  //     client.disconnect();
  //   };
  // }, []);

  React.useEffect(() => {
    const maxPerc = (100 * coolSide) / max;
  });
  console.log("coolSide", coolSide);
  return (
    /**********************
     ******* Cool Side ****
     ********* Start ******
     **********************/
    <View style={styles.dialsContainer}>
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
      <View>
        <TextInput
          underlineColorAndroid="transparent"
          editable={false}
          value={String(coolSide)}
          style={[
            StyleSheet.absoluteFillObject,
            styles.CoolSidePercent,
            { fontSize: radius / 2, color: textColor ?? color },
            { fontWeight: "bold", textAlign: "center" },
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
      <View stile={styles.outSideContainer}>
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
      </View>
      <TextInput
        underlineColorAndroid="transparent"
        editable={false}
        value={String(outSide)}
        style={[
          StyleSheet.absoluteFillObject,
          styles.outSidePercent,
          { fontSize: radius / 2, color: textColor ?? color },
          { fontWeight: "bold", justifyContent: "center", textAlign: "center" },
        ]}
      />
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
  dialsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    // paddingTop: 50,
   marginBottom: 250,
  },
  coolSideContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 10,
    // left: 5,
  },
  coolSideText: {
    fontSize: 44,
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
    // left: 5,
  },
  outSideText: {
    fontSize: 24,
    color: "blue",
  },
  outSidePercent: {
    fontSize: 32,
    marginTop: 20,
    textAlign: "center",
    // Left: 5,
    color: "blue",
    textAlign: "center",
  },
  heaterContainer: {
    flex: 1,
    // alignItems: "center",
    // marginTop: 10,
    // left: 5,
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
    textAlign: "center",
  },

  connectionStatusContainer: {
    // position: "absolute",
    flex: 1,
    // alignItems: "center",
    // paddingTop: 350,
     marginyTop: 190,
  },
  connectionStatusText: {
    fontSize: 24,
    margin: 20,
  },
  reconnectButton: {
    position: "absolute",
    backgroundColor: "green",
    // padding: 15,
    // left: 290,
    // top: 350,

    borderRadius: 25,
  },
  reconnectButtonText: {
    color: "white",
    fontSize: 20,
  },
  textContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    justifyContent: "center",
    alignItems: "center",
  },
  connectionStatus: {
    marginTop: 20,
  },
  reconnectButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  reconnectText: {
    color: "white",
  },
});
