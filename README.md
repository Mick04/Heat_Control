<<<<<<< HEAD

=======
Todo list
 move Creating a new MQTT client to 'mqttClient.js
 new code 
 // mqttClient.js
import Paho from 'paho-mqtt';

export const createClient = () => {
  return new Paho.Client(
    "public.mqtthq.com",
    Number(1883),
    `inTopic-${parseInt(Math.random() * 100)}`
  );
}

in the components you want to use mqttClient.js add the following code
import { createClient } from './mqttClient';

const client = createClient();

>>>>>>> 752554e0cd67a53d642d73413303376c6b8eaec1
