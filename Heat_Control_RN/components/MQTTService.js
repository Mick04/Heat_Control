// import { Paho } from "paho-mqtt";
import { Client as PahoClient, Message as PahoMessage } from 'paho-mqtt';

class MQTTService {
  constructor() {
    this.client = new PahoClient(
      "public.mqtthq.com",
      1883,
      "inTopic-${parseInt(Math.random() * 100)}"
    );
    this.isConnected = false;
  }

  connect(onSuccess, onFailure) {
    if (this.isConnected) {
      console.log("Already connected");
      return;
    }

    this.client.connect({
      onSuccess: () => {
        this.isConnected = true;
        console.log("Connected!");
        setIsConnected(true);
        client.subscribe("outSide", { qos: 1 });
        client.subscribe("coolSide", { qos: 1 });
        client.subscribe("heater", { qos: 1 });
        client.subscribe("heaterStatus", { qos: 1 });
        if (onSuccess) {
          onSuccess();
        }
      },
      onFailure: (error) => {
        console.log("Connection failed", error);
        if (onFailure) {
          onFailure(error);
        }
      },
    });
  }

  disconnect() {
    if (this.isConnected) {
      this.client.disconnect();
      this.isConnected = false;
    }
  }

  publish(topic, message) {
    if (this.isConnected) {
      const mqttMessage = new Paho.Message(message);
      mqttMessage.destinationName = topic;
      this.client.send(mqttMessage);
    } else {
      console.log("Not connected to MQTT broker");
    }
  }

  subscribe(topic) {
    if (this.isConnected) {
      this.client.subscribe(topic);
    } else {
      console.log("Not connected to MQTT broker");
    }
  }

  onMessageArrived(callback) {
    this.client.onMessageArrived = callback;
  }

  onConnectionLost(callback) {
    this.client.onConnectionLost = callback;
  }
}

export default new MQTTService();
