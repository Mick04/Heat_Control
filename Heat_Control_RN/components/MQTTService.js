// MQTTService.js
import Paho from "paho-mqtt";
import { useEffect } from 'react';

const MQTT_BROKER = 'public.mqtthq.com';
const MQTT_PORT = 1883;
const MQTT_TOPICS = ['outSide', 'coolSide', 'heater'];

export const useMQTT = (onMessage) => {
  useEffect(() => {
    const mqttClient = new Paho.Client(
      MQTT_BROKER,
      Number(MQTT_PORT),
      `inTopic-${parseInt(Math.random() * 100)}`
    );

    mqttClient.onMessageArrived = (message) => {
      const topic = message.destinationName;
      const payload = message.payloadString;
      onMessage(topic, payload);
    };

    mqttClient.connect({
      onSuccess: () => {
        console.log('MQTT connected');
        MQTT_TOPICS.forEach(topic => mqttClient.subscribe(topic));
      }
    });

    return () => {
      if (mqttClient.isConnected()) {
        mqttClient.disconnect();
      }
    };
  }, [onMessage]); // Add onMessage as a dependency to avoid re-renders
};