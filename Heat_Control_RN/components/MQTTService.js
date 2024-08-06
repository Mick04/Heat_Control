import Paho from "paho-mqtt";

export const connectMQTT = ({ onConnect, onFailure, onMessageReceived }) => {
  const client = new Paho.Client(
    "public.mqtthq.com",
    Number(1883),
    `inTopic-${parseInt(Math.random() * 100)}`
  );

  client.onConnectionLost = onFailure;
  client.onMessageArrived = onMessageReceived;

  client.connect({
    onSuccess: onConnect,
    onFailure: onFailure,
  });

  return client;
};

export const reconnect = (client, onConnect, onFailure) => {
  if (!client.isConnected()) {
    console.log("Attempting to reconnect...");
    client.connect({
      onSuccess: onConnect,
      onFailure: onFailure,
    });
  } else {
    console.log("Already connected.");
  }
};