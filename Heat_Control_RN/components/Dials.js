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

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
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

export default function DialsScreen({
  // coolSide = 15,
  // coolSide = 75,
  radius = 60,
  strokeWidth = 10,
  duration = 500,
  color = "tomato",
  delay = 0,
  textColor,
  max = 100,
}) {
  const [outSide, setOutSideTemp] = useState([]);
  const [coolSide, setCoolSideTemp] = useState([]);
  const [heater, setControlTemp] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const circleRef = React.useRef();
  const halfCircle = radius + strokeWidth;
  const circleCoolSide = 2 * Math.PI * radius;
  const strokeDashoffset = circleCoolSide - (circleCoolSide * coolSide) / max;
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

    function onFailure() {
      console.log("Failed to connect!");
      setIsConnected(false);
    }
    function onMessageReceived(message) {
      console.log("Message received:", message.destinationName);
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

  React.useEffect(() => {
    const maxPerc = (100 * coolSide) / max;
  });
  return (
    <View style={styles.container}>
      <View>
        <Text>coolSide</Text>
      </View>
      <Svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
      >
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          <AnimatedCircle
            ref={circleRef}
            cx="50%"
            cy="50%"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={radius}
            fill="transparent"
            strokeOpacity={0.2}
          />
          <Circle
            cx="50%"
            cy="50%"
            stroke={color}
            strokeWidth={strokeWidth}
            r={radius}
            fill="transparent"
            strokeDasharray={circleCoolSide}
            strokeDashoffset={strokeDashoffset}
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
          { fontSize: radius / 2, color: textColor ?? color },
          { fontWeight: "bold", textAlign: "center" },
        ]}
      />
      <Svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
      >
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          <AnimatedCircle
            ref={circleRef}
            cx="50%"
            cy="50%"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={radius}
            fill="transparent"
            strokeOpacity={0.2}
          />
          <Circle
            cx="50%"
            cy="50%"
            stroke={color}
            strokeWidth={strokeWidth}
            r={radius}
            fill="transparent"
            strokeDasharray={circleCoolSide}
            strokeDashoffset={strokeDashoffset}
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
          { fontSize: radius / 2, color: textColor ?? color },
          { fontWeight: "bold", textAlign: "center" },
        ]}
      />
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
    justifyContent: "center",
    alignItems: "center",
  },
});
