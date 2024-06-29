import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import React, { useState } from "react";
import DatePicker from "react-native-modern-datepicker";
export default function App() {
  const [open, setOpen] = useState(false); //open and closes the modal useState is a hook that allows you to have state variables in functional components
  const [time, settime] = useState(false); //

  function handleOnPress() {
    //function that changes the state of the modal
    setOpen(!open);
  }
  function handleCange(time) {
    settime(time);
    console.log(time);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleOnPress}>
        <Text>Open</Text>
      </TouchableOpacity>
      <Modal animationType="slide" transparent={true} visible={open}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <DatePicker mode="time" seleted="time" onTimeChange={handleCange} />
            <TouchableOpacity onPress={handleOnPress}>
              <Text>close</Text>
            </TouchableOpacity>
          </View>
         
        </View>
        
      </Modal>
      <View>
      <Text>{time}</Text>
    </View>
      <StatusBar style="auto" />
    </View>
   
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 5,
    boderColor: "red",
    width: "90%",
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 10,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
