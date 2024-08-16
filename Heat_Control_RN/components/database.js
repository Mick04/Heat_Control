// database.js
import SQLite from 'react-native-sqlite-storage';

// Initialize the database
const db = SQLite.openDatabase({ name: 'sensorData.db', location: 'default' });

// Create a table to store sensor data
export const createTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS SensorData (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor TEXT,
        temperature REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      [],
      () => { console.log('Table created successfully'); },
      error => { console.log('Error creating table: ', error); }
    );
  });
};

// Insert data into the database
export const insertData = (sensor, temperature) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO SensorData (sensor, temperature) VALUES (?, ?)',
      [sensor, temperature],
      () => { console.log('Data inserted successfully'); },
      error => { console.log('Error inserting data: ', error); }
    );
  });
};

// Retrieve data from the database
export const getData = (sensor, fromTimestamp, toTimestamp, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM SensorData WHERE sensor = ? AND timestamp BETWEEN ? AND ?`,
      [sensor, fromTimestamp, toTimestamp],
      (_, { rows: { _array } }) => {
        callback(_array);
      },
      error => { console.log('Error retrieving data: ', error); }
    );
  });
};

// Call this to create the table when the app initializes
createTable();