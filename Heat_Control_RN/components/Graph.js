import React from "react";
import { View, Text } from "react-native";
import CurrentTime from "./CurrentTime";
import LineChartComponent from "./LineChartComponent";

function GraphScreen({ navigation }) {
  const labels = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00"];
  const coolSide = [20, 25, 30, 35, 40, 45]; // Example values for coolSide
  const outSide = [15, 20, 25, 30, 35, 40]; // Example values for outSide
  const heater = [10, 15, 20, 25, 30, 35]; // Example values for heater

  const data1 = coolSide;
  const data2 = outSide;
  const data3 = heater;

  return (
    <View>
      <View>
        <Text>Welcome to the Time</Text>
        <CurrentTime />
      </View>
      
      <LineChartComponent title="Bezier Line Chart - coolSide" data={data1} labels={labels} />
      <LineChartComponent title="Bezier Line Chart - outSide" data={data2} labels={labels} />
      <LineChartComponent title="Bezier Line Chart - heater" data={data3} labels={labels} />
    </View>
  );
}

export default GraphScreen;