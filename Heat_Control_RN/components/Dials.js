//Dials.js
import * as React from "react";
import Paho from "paho-mqtt";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function DialsScreen({ radius = 60, strokeWidth = 10, color = "tomato", textColor = "black", max = 100 }) {
  const [outSide, setOutSideTemp] = useState([]);
  const [coolSide, setCoolSideTemp] = useState([]);
  const [heater, setControlTemp] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const circleRef = React.useRef();
  const halfCircle = radius + strokeWidth;
  const circleCoolSide = 2 * Math.PI * radius;
  const strokeDashoffset = circleCoolSide - (circleCoolSide * coolSide) / max;

  const client = new Paho.Client("public.mqtthq.com", Number(1883), `inTopic-${parseInt(Math.random() * 100)}`);

  const reconnect = () => {
    if (!client.isConnected()) {
      console.log("Attempting to reconnect...");
      client.connect({
        onSuccess: () => {
          console.log("Reconnected successfully.");
          setIsConnected(true);
        },
        onFailure: (err) => {
          console.log("Failed to reconnect:", err);
          setIsConnected(false);
          setTimeout(reconnect, 5000); // Retry after 5 seconds
        },
      });
    } else {
      console.log("Already connected.");
    }
  };

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);

      if (state.isConnected && !client.isConnected()) {
        reconnect(); // Ensure `reconnect` is within the same scope
      }
    });

    function onConnect() {
      console.log("Connected!");
      setIsConnected(true);
      client.subscribe("outSide");
      client.subscribe("coolSide");
      client.subscribe("heater");
    }

    function onMessageReceived(message) {
      try {
        const payload = message.payloadString ? parseInt(message.payloadString) : null;

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
          default:
            console.log("Unknown topic:", message.destinationName);
        }
      } catch (error) {
        console.error("Failed to process message:", error);
      }
    }

    client.onMessageArrived = onMessageReceived;

    if (!client.isConnected()) {
      client.connect({
        onSuccess: onConnect,
        onFailure: (error) => {
          console.error("Connection failed:", error);
          if (error.errorCode === 7) {
            setTimeout(reconnect, 5000); // Retry after 5 seconds
          }
          setIsConnected(false);
        },
      });
    }

    return () => {
      client.disconnect();
    };
  }, []);


  React.useEffect(() => {
    const maxPerc = (100 * coolSide) / max;
  });
  console.log("coolSide", coolSide);
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
            stroke={"blue"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={radius}
            fill="transparent"
            strokeOpacity={0.2}
          />
          <Circle
            cx="50%"
            cy="50%"
            stroke={"green"}
            strokeWidth={strokeWidth}
            r={radius}
            fill="transparent"
            strokeDasharray={circleCoolSide}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.connectionStatus}>
        <TextInput
          underlineColorAndroid="transparent"
          editable={false}
          value={String(outSide)}
          style={[
            StyleSheet.absoluteFillObject,
            { fontSize: radius / 2, color: textColor ?? color },
            { fontWeight: "bold", textAlign: "center" },
          ]}
        />
      </View>
      <Text>outSide</Text>
      <View>
        
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
        value={String(outSide)}
        style={[
          StyleSheet.absoluteFillObject,
          { fontSize: radius / 2, color: textColor ?? color },
          { fontWeight: "bold",justifyContent: "center", textAlign: "center" },
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
