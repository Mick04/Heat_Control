// src/context/MQTTContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { Client } from "react-native-paho-mqtt";

const MQTTContext = createContext();

export const MQTTProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Define your MQTT broker's URL
    const brokerUrl = "broker.hivemq.com";

    // Create a new client
    const mqttClient = new Client({
      uri: brokerUrl,
      clientId: `clientId-${Date.now()}`,
      storage: {
        setItem: (key, item) => Promise.resolve(),
        getItem: (key) => Promise.resolve(null),
        removeItem: (key) => Promise.resolve(),
      },
    });

    mqttClient.on("connectionLost", (responseObject) => {
      setIsConnected(false);
      console.log("Connection lost: ", responseObject.errorMessage);
    });

    mqttClient.on("messageReceived", (message) => {
      const newMessage = {
        topic: message.destinationName,
        message: message.payloadString,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    mqttClient
      .connect()
      .then(() => {
        setIsConnected(true);
        console.log("Connected to MQTT Broker");
        mqttClient.subscribe("your/topic/here");
      })
      .catch((err) => {
        console.error("MQTT Connection error: ", err);
      });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.disconnect();
      }
    };
  }, []);

  return (
    <MQTTContext.Provider value={{ client, isConnected, messages }}>
      {children}
    </MQTTContext.Provider>
  );
};

export const useMQTT = () => {
  return useContext(MQTTContext);
};
