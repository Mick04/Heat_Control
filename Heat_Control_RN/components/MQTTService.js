import Paho from "paho-mqtt";
import { useState, useEffect } from 'react';

const MQTT_TOPICS = ['outSide', 'coolSide', 'heater'];

export const useMQTT = (onMessage) => {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const mqttClient = new Paho.Client(
      "public.mqtthq.com",
      Number(1883),
      `inTopic-${parseInt(Math.random() * 100)}`
    );

    mqttClient.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log("Connection lost:", responseObject.errorMessage);
      }
      setIsConnected(false);
      reconnect(mqttClient); // Attempt to reconnect
    };

    mqttClient.onMessageArrived = (message) => {
      onMessage(message.destinationName, message.payloadString);
    };

    const connectClient = () => {
      mqttClient.connect({
        onSuccess: () => {
          console.log("Connected!");
          setIsConnected(true);
          MQTT_TOPICS.forEach(topic => mqttClient.subscribe(topic));
        },
        onFailure: (err) => {
          console.log("Failed to connect:", err);
          setIsConnected(false);
          setTimeout(connectClient, 5000); // Retry connection after 5 seconds
        },
        keepAliveInterval: 60, // Increase keep-alive interval
      });
    };

    connectClient();
    setClient(mqttClient);

    return () => {
      if (mqttClient.isConnected()) {
        mqttClient.disconnect();
      }
    };
  }, [onMessage]);

  const reconnect = (mqttClient) => {
    if (mqttClient && !mqttClient.isConnected()) {
      console.log("Attempting to reconnect...");
      mqttClient.connect({
        onSuccess: () => {
          console.log("Reconnected successfully.");
          setIsConnected(true);
          MQTT_TOPICS.forEach(topic => mqttClient.subscribe(topic));
        },
        onFailure: (err) => {
          console.log("Failed to reconnect:", err);
          setIsConnected(false);
          setTimeout(() => reconnect(mqttClient), 5000); // Retry reconnection after 5 seconds
        },
      });
    } else if (mqttClient && mqttClient.isConnected()) {
      console.log("Already connected.");
    } else {
      console.log("Client is not initialized.");
    }
  };

  return { client, isConnected, reconnect: () => reconnect(client) };
};