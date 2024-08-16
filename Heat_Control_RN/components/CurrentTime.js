import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";

// Function to get the current time
const getCurrentTime = () => {
  const date = new Date();
  return date.toLocaleTimeString();
};

// CurrentTime Component
const CurrentTime = () => {
  const [time, setTime] = useState(getCurrentTime());

  useEffect(() => {
    // const intervalId = setInterval(() => {
      setTime(getCurrentTime());
     }, //1000); // Update time every second
     []);
  //   return () => clearInterval(intervalId); // Cleanup interval on component unmount
  //  }, []);

  return (
    <View>
      <Text>Welcome to the Time</Text>
      <Text>Current Time: {time}</Text>
    </View>
  );
};

export default CurrentTime;
