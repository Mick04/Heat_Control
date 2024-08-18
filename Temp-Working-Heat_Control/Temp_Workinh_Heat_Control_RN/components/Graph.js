// import React from "react";
// import {
//   View,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import LineChartComponent from "./LineChartComponent";
// import { useEffect, useState } from "react";
// import Paho from "paho-mqtt";

// /************************************
//  *    Creating a new MQTT client    *
//  *              start               *
//  * **********************************/

// const client = new Paho.Client(
//   "public.mqtthq.com",
//   Number(1883),
//   `inTopic-${parseInt(Math.random() * 100)}`
// );

// /************************************
//  *    Creating a new MQTT client    *
//  *                end               *
//  * **********************************/

// function GraphScreen() {
//   const [coolSide, setCoolSideTemp] = useState([]);
//   const [outSide, setOutSideTemp] = useState([]);
//   const [heater, setControlTemp] = useState([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const [labels, setLabels] = useState([]);
//   console.log("lables = ", labels);
//   const [history, setHistory] = useState({
//     coolSide: [],
//     outSide: [],
//     heater: [],
//     labels: [],
//   });
//   const N = 5; // Number of data points

//   /********************************************************************
//    *   Effect hook to establish MQTT connection and handle messages   *
//    *                          start                                   *
//    * ******************************************************************/

//   useEffect(() => {
//         const clearRetainedMessages = () => {
//           const clearMessage = new Paho.Message("");
//           clearMessage.retained = true;
      
//           ["control"].forEach((topic) => {
//             clearMessage.destinationName = topic;
//             client.send(clearMessage);
//           });
//         };
    
//     function onConnect() {
//       console.log("Connected!");
//       setIsConnected(true);
//       client.subscribe("outSide");
//       client.subscribe("coolSide");
//       client.subscribe("heater");
//       client.subscribe("AMtime");
//       client.subscribe("PMtime");
//       console.log("Subscribed to topics...**************");
//       clearRetainedMessages(); // Clear retained messages
//     }

//     function onFailure() {
//       console.log("Failed to connect!");
//       setIsConnected(false);
//     }
//     let count = 0;
//     function onMessageReceived(message) {
//         console.log("Message received:", message.payloadString);
//         const value = parseFloat(message.payloadString);
//         if (isNaN(value) || !isFinite(value)) {
//           console.log("Received invalid number:", message.payloadString);
//           return;
//         }
      
//         const currentTime = new Date().toLocaleTimeString("en-US", {
//           hour: "numeric",
//           minute: "numeric",
//           hour12: true,
//         });
      
//         setHistory((prevHistory) => {
//           const newHistory = { ...prevHistory };
      
//           switch (message.destinationName) {
//             case "outSide":
//               setOutSideTemp([value]); // Replace the old value
//               break;
//             case "coolSide":
//               setCoolSideTemp([value]); // Replace the old value
//               break;
//             case "heater":
//               setControlTemp([value]); // Replace the old value
//               break;
//             default:
//               console.log("Unknown topic:", message.destinationName);
//               return prevHistory;
//           }
      
//           // Ensure label updates only if the time has changed
//           if (prevHistory.labels[prevHistory.labels.length - 1] !== currentTime) {
//             newHistory.labels = [...prevHistory.labels, currentTime];
//           }
      
//           return newHistory;
//         });
      
//         setLabels((prevLabels) => {
//           if (prevLabels[prevLabels.length - 1] !== currentTime) {
//             const newLabels = [...prevLabels, currentTime];
//             return newLabels.slice(-N); // Keep only the last N labels
//           }
//           return prevLabels;
//         });
//       }

//     client.connect({
//       onSuccess: onConnect,
//       onFailure: onFailure,
//     });

//     client.onMessageArrived = onMessageReceived;

//     console.log("=========Client:", client);

//     const intervalId = setInterval(() => {
//       // Fetch new data or trigger an update
//       console.log("Updating data...");
//       // You can call a function here to fetch new data and update the state
//     }, N * 60 * 1000); // Convert minutes to milliseconds
//     console.log("=========Interval ID:", intervalId);

//     return () => {
//       client.disconnect();
//       clearInterval(intervalId); // Clear the interval when the component unmounts
//       console.log("Clearing interval:", intervalId);
//     };
//   }, []);
//   /*************************************************************
//    *   Cleanup function to disconnect when component unmounts  *
//    *                            end                            *
//    * ***********************************************************/

//   /*******************************************
//    *      Function to reconnect              *
//    *               start                     *
//    *******************************************/
//   const reconnect = () => {
//     if (!client.isConnected()) {
//       console.log("Attempting to reconnect...");
//       client.connect({
//         onSuccess: () => {
//           console.log("Reconnected successfully.");
//           console.log("Subscribing to topics...");
//           setIsConnected(true);
//           client.subscribe("outSide");
//           client.subscribe("coolSide");
//           client.subscribe("heater");
//           client.subscribe("AMtime");
//           client.subscribe("PMtime");
//         },
//         onFailure: (err) => {
//           console.log("Failed to reconnect:", err);
//           setIsConnected(false);
//         },
//       });
//     } else {
//       console.log("Already connected.");
//     }
//   };
//   /*******************************************
//    *      Function to reconnect              *
//    *                 end                     *
//    *******************************************/

//   const validateData = (data) => {
//     console.log("Data before validation:", data);
//     const validatedData = data.filter((value) => !isNaN(value) && isFinite(value));
//     console.log("Validated data:", validatedData);
//     if (validatedData.length !== data.length) {
//       console.log("Filtered out invalid data:", data.filter(value => isNaN(value) || !isFinite(value)));
//     }
//     return validatedData;
//   };

//   return (
//     <ScrollView style={styles.container} horizontal={true}>
//       <ScrollView style={styles.innerContainer}>
//         <View style={styles.chartContainer}>
//           <LineChartComponent
//             style={styles.chart}
//             title="Bezier Line Chart - outSide"
//             data={validateData(outSide)}
//             labels={labels}
//           />
//           <Text>{JSON.stringify(validateData(outSide))}</Text>
//         </View>

//         <View style={styles.chartContainer}>
//           <LineChartComponent
//             style={styles.chart}
//             title="Bezier Line Chart - coolSide"
//             data={validateData(coolSide)}
//             labels={labels}
//           />
//         </View>
//         <View style={styles.chartContainer}>
//           <LineChartComponent
//             style={styles.chart}
//             title="Bezier Line Chart - heater"
//             data={validateData(heater)}
//             labels={labels}
//           />
//         </View>
//         <View style={styles.reconnectContainer}>
//           <Text
//             style={[{ fontSize: 20, color: isConnected ? "green" : "red" }]}
//           >
//             {isConnected
//               ? "Connected to MQTT Broker"
//               : "Disconnected from MQTT Broker"}
//           </Text>

//           <TouchableOpacity onPress={reconnect}>
//             <Text style={styles.reconnect}>Reconnect</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   chart: {
//     width: 200, // Adjust the width as needed
//   },
//   reconnectContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   reconnect: {
//     color: "blue",
//     fontSize: 24,
//   },
//   lineChart: {
//     margin: 10,
//     color: "blue",
//   },
// });

// export default GraphScreen;