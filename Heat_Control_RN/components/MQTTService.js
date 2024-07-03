import { createContext, useContext, useEffect, useState } from 'react';
import Paho from 'paho-mqtt';

// Create a context for the MQTT service
const MQTTContext = createContext();

// MQTT Provider component
export const MQTTProvider = ({ children }) => {
  const [client, setClient] = useState(null);

  useEffect(() => {
    const mqttClient = new Paho.Client("public.mqtthq.com", Number(1883), `inTopic-${parseInt(Math.random() * 100)}`);
    mqttClient.connect({
      onSuccess: () => {
        console.log("Connected to MQTT broker");
        // Subscribe to topics or perform other actions on connect
      },
      onFailure: (error) => {
        console.log("Failed to connect to MQTT broker:", error);
      },
    });
    mqttClient.onMessageArrived = (message) => {
      console.log("Message received:", message.payloadString);
      // Handle incoming messages
    };
    setClient(mqttClient);

    return () => {
      mqttClient.disconnect();
      console.log("Disconnected from MQTT broker");
    };
  }, []);

  const publishMessage = (topic, message) => {
    if (client && client.isConnected()) {
      const mqttMessage = new Paho.Message(message);
      mqttMessage.destinationName = topic;
      client.send(mqttMessage);
    } else {
      console.log("Client is not connected to MQTT broker.");
    }
  };

  return (
    <MQTTContext.Provider value={{ publishMessage }}>
      {children}
    </MQTTContext.Provider>
  );
};

// Custom hook to use MQTT service
export const useMQTT = () => useContext(MQTTContext);