// DatePickerModal.js
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import DatePicker from "react-native-modern-datepicker";
import PropTypes from 'prop-types';

export default function DatePickerModal({ 
  isVisible = false,  
  onTimeChange = () => {} 
}) {
  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text>Choose a time:</Text>
          <DatePicker
            mode="time"
            selected="time"
            onTimeChange={onTimeChange}
            minuteInterval={15}
          />
        </View>
      </View>
    </Modal>
  );
}

DatePickerModal.propTypes = {
  isVisible: PropTypes.bool,
  onTimeChange: PropTypes.func,
};
const styles = StyleSheet.create({
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
    borderColor: "red", // Fixed typo from 'boderColor' to 'borderColor'
    width: "90%",
    padding: 25,
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