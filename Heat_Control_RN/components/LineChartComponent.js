// LineChartComponent 
import React from "react";
import { Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get('window').width;

const LineChartComponent = ({ title, data, labels }) => {
    console.log("*******LineChartComponent", title, data, labels);
  return (
    <>
      <Text>{title}</Text>
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: data,
              color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Blue
            },
          ],
        }}
        width={screenWidth} // from react-native
        height={180}
        yAxisLabel=""
        yAxisSuffix="°C"
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726",
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </>
  );
};

export default LineChartComponent;