//****** OTA *******

#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <WiFiManager.h>  // https://github.com/tzapu/WiFiManager
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <NTPClient.h>  //
#include <PubSubClient.h>
#include <ESP8266WebServer.h>
#include <Adafruit_Sensor.h>
#include <OneWire.h>
#include <ESP_Mail_Client.h>

// Define pins and other constants
#define Relay_Pin D5  // active board
#define LED_Pin 13    // on board LED_Pin
// #define LED_Pin D6//LED_Pin  //change when debuged
OneWire ds(D7);  // active board  // on pin 10 (a 4.7K resistor is necessary)

// Define pins and other constants
byte i;
byte present = 0;
byte type_s;
byte data[12];
byte addr[8];
float celsius;
float s1;
float s2;
float s3;
int adr;
uint_fast8_t amTemperature;  // is set by the sliders
uint_fast8_t pmTemperature;  // is set by the sliders
uint_fast8_t amTemp;         // is set by the sliders
uint_fast8_t pmTemp;         // is set by the sliders
uint_fast8_t AMtime;
uint_fast8_t PMtime;
uint_fast8_t Day;
uint_fast8_t Hours;
uint_fast8_t Minutes;
uint_fast8_t seconds;
uint_fast8_t amHours;
uint_fast8_t amMinutes;
uint_fast8_t pmHours;
uint_fast8_t pmMinutes;
// uint_fast8_t Night_Settngs;
uint_fast8_t Night_seconds;
uint_fast8_t temp;
bool Am;
bool Reset = false;  // set when slider is moved
bool StartUp = 1;
bool Timer = 1;

/********************************************
      settup the time variables start
 * ******************************************/
const long utcOffsetInSeconds = 3600;

char daysOfTheWeek[7][12] = { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };
char DayName[10];
char sensor[50];
char destination[50];
char AmType[2];
// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);

unsigned long currentMillis = millis();
unsigned long lastMillis = 0;
unsigned long previousMillis = 0;
const long interval = 5000;
/********************************************
      settup the time variables end
 * ******************************************/

/********************************************
      wifi and pubSup credentials start
 * ******************************************/

const char *ssid = "Gimp";
const char *password = "FC7KUNPX";
const char *mqtt_server = "public.mqtthq.com";

// the sender email credentials
#define SENDER_EMAIL "esp8266heaterapp@gmail.com";
#define SENDER_PASSWORD "xhjh djyf roxm sxzh";

#define RECIPIENT_EMAIL "mac5y4@talktalk.net"

#define SMTP_HOST "smtp.gmail.com";
#define SMTP_PORT 587;

SMTPSession smtp;

WiFiClient Temp_Control;
PubSubClient client(Temp_Control);
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];
long int value = 0;

/********************************************
      wifi and pubSup credentials end
 * ******************************************/
// Timer-related variables
unsigned long heaterOnTime = 0;
const unsigned long heaterTimeout = 60000;
bool heaterOn = false;

// Function prototypes
void setup_wifi();
void callback(char *topic, byte *payload, unsigned int length);
void reconnect();
void publishTempToMQTT();
void relay_Control();
void sendSensor();
void startHeaterTimer();
void checkHeaterTimeout();


/********************************************
  Static IP address and wifi conection Start
********************************************/

// Set your Static IP address
IPAddress local_IP(192, 168, 1, 184);
// Set your Gateway IP address
IPAddress gateway(192, 168, 1, 1);

IPAddress subnet(255, 255, 0, 0);
IPAddress primaryDNS(8, 8, 8, 8);    // optional
IPAddress secondaryDNS(8, 8, 4, 4);  // optional
/********************************************
     Static IP address and wifi conection end
 ********************************************/





void setup() {
  // Serial port for debugging purposes
  Serial.begin(115200);
  delay(1000);
  String subject = "Email Notification from ESP8266";


  String textMsg = "This is an email sent from ESP8266.\n";
  textMsg += "Sensor value: ";
  textMsg += "15";  // OR replace this value read from a sensor

  gmail_send(subject, textMsg);
  pinMode(Relay_Pin, OUTPUT);
  pinMode(LED_Pin, OUTPUT);      // digitalWrite (LED_Pin, LOW);//LED_Pin off
  pinMode(LED_BUILTIN, OUTPUT);  // Initialize the LED_BUILTIN pin as an output
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  /************************************
          OVER THE AIR START
  *                                  *
  ************************************/

  // ArduinoOTA.setHostname("INSIDE");
  ArduinoOTA.setHostname("TEMPLATE");
  // ArduinoOTA.setHostname("TEST RIG");
  ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH)
      type = "sketch";
    else  // U_SPIFFS
      type = "filesystem";

    // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
    Serial.println("Start updating " + type);
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });
  ArduinoOTA.begin();
  Serial.println("Ready");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}
/************************************
         OVER THE AIR END
 ************************************/
void loop() {
  ArduinoOTA.handle();
  // delay(1000);
  if (!client.connected()) {
    Serial.println("MQTT client not connected. Attempting to reconnect...");
    reconnect();
  }
  sendSensor();
  publishTempToMQTT();
  relay_Control();  // call relay_Control function
  client.loop();
  timeClient.update();
  Day = timeClient.getDay();
  Hours = timeClient.getHours();
  Minutes = timeClient.getMinutes();
  seconds = timeClient.getSeconds();
  Am = true;
  Am = (Hours < 12);
  if (heaterOn) {
    Serial.println("201 checkHeaterTimeout()");
    checkHeaterTimeout();
  }
  Serial.print("Hours = ");
  Serial.println(Hours);
  Serial.print("pmTemperature = ");
  Serial.println(pmTemperature);
  Serial.print("amTemperature = ");
  Serial.println(amTemperature);
}
/********************************************
  *       connect to the internet start.      *
 * ******************************************/
void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
}
/********************************************
  *       connect to the internet end.       *
 * ******************************************/

/********************************************
                Callback start
 * ******************************************/
void callback(char *topic, byte *payload, unsigned int length) {
  // Print the result of strcmp(topic, "control") == 0
  // bool isControl = (strcmp(topic, "control") == 0);
  ;
  // Null-terminate the payload to treat it as a string
  payload[length] = '\0';

  // Handle control signals
  if (strcmp(topic, "control") == 0) {
    if ((char)payload[0] == 'N') {
      Reset = true;
    } else if ((char)payload[0] == 'F') {
      Reset = false;
    }
  }
  // if (Reset == true) {
  if (strstr(topic, "amTemperature")) {
    sscanf((char *)payload, "%d", &amTemperature);
    Serial.print("££££££££££amTemperature££££££££ = ");
    Serial.println(amTemperature);
    //if topic = amTemperature then amTemperature = payload;
  }
  if (strstr(topic, "pmTemperature")) {
    sscanf((char *)payload, "%d", &pmTemperature);
    Serial.print("££££££££££ pmTemperature ££££££££ = ");
    Serial.println(pmTemperature);
    //if topic = pmTemperature then pmTemperature = payload;
  }
  if (strstr(topic, "AMtime")) {
    sscanf((char *)payload, "%d:%d", &amHours, &amMinutes);
    //if topic = AMtime then AMtime = payload;
  }

  if (strstr(topic, "PMtime")) {
    sscanf((char *)payload, "%d:%d", &pmHours, &pmMinutes);
    //if topic = night_h then pmHours = payload Serial.print("AMtime = ");
  }
  
  if (StartUp ==1) {
    amTemp = amTemperature;
    pmTemp = pmTemperature;
    StartUp = 0;
  }
Serial.print("____________StartUp_________ = ");
  Serial.println(StartUp);

  Serial.print("amTemperature; = ");
  Serial.println(amTemperature);

  Serial.print("pmTemperature = ");
  Serial.println(pmTemperature);
  Serial.print("amTemp = ");
  Serial.println(amTemp);
  Serial.print("___________pmTemp____________ = ");
  Serial.println(pmTemp);
  Serial.print("@@£@£@£@£@£@£ pmHours = ");
  Serial.print(pmHours);
  Serial.print(" pmMinutes = ");
  Serial.print(pmMinutes);
  Serial.print("@£@£@£@£@£@£ PMtime = ");
  Serial.println(PMtime);
}
/********************************************
                Callback end
* ******************************************/


void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect("ESP8266Client")) {
      Serial.println("connected");
      // // Once connected,
      // ... subscribe to topics
      client.subscribe("Temp_Control/sub");
      client.subscribe("control");
      client.subscribe("amTemperature");
      client.subscribe("pmTemperature");
      client.subscribe("AMtime");
      client.subscribe("PMtime");
      Serial.print("*****************pmTemperature***************= ");
      Serial.print(pmTemperature);
      client.subscribe("heaterStatus");
      if (StartUp) {
        // Publish initial values
        // client.publish("amTemperature", String(amTemperature).c_str());
        // client.publish("pmTemperature", String(pmTemperature).c_str());
        // client.publish("AMtime", String(AMtime).c_str());
        // client.publish("PMtime", String(PMtime).c_str());
        // StartUp = false;
      }

    } else {
      Serial.print("failed, reconnect = ");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

// void publishTempToMQTT() {
//   // Prepare temperature data
//   String tempData = String("Current Temperature: ") + String(amTemperature);
//   // Publish temperature data to the MQTT topic
//   client.publish("sensor/temperature", tempData.c_str());
// }

/*************************************************************
                            Relay Control
                                 start
*************************************************************/

void relay_Control() {
  currentMillis = millis();
  if (Am == true) {
    if (s3 < amTemp) {
      digitalWrite(Relay_Pin, HIGH);
      digitalWrite(LED_Pin, HIGH);  // LED_Pin on
      if (!heaterOn) {
        startHeaterTimer();
      }
    } else if (s3 > amTemp) {
      digitalWrite(Relay_Pin, LOW);
      digitalWrite(LED_Pin, LOW);  // LED_Pin off
      heaterOn = false;
    }
  }

  if (Am == false) {
    Serial.println("if (Am == false");
    Serial.print("pmTemp = ");
    Serial.println(pmTemp);
    Serial.print("s3 = ");
    Serial.println(s3);
    if (s3 < pmTemp) {
      digitalWrite(Relay_Pin, HIGH);
      digitalWrite(LED_Pin, LOW);  // builtin LED_Pin on
      if (!heaterOn) {
        startHeaterTimer();
      }
    } else if (s3 > pmTemp) {
      digitalWrite(Relay_Pin, LOW);
      digitalWrite(LED_Pin, LOW);  // LED_Pin off
      heaterOn = false;
    }
  }
}
/*************************************************************
                            Relay Control
                                 End
*************************************************************/

/********************************************
         send temperature value
             to server for
          temperature monitor
                to receive
                  start
* ******************************************/
void publishTempToMQTT(void) {
  if (!client.connected()) {
    // Reconnect to MQTT broker if necessary
    reconnect();
  }
  // Serial.println("publishTempToMQTT");
  char sensVal[50];
  float myFloat1 = s1;
  sprintf(sensVal, "%f", myFloat1);
  client.publish("outSide", sensVal, true);

  float myFloat2 = s2;
  sprintf(sensVal, "%f", myFloat2);
  client.publish("coolSide", sensVal, true);

  float myFloat3 = s3;
  sprintf(sensVal, "%f", myFloat3);
  client.publish("heater", sensVal, true);

  // float myFloat4 = amTemp;
  // sprintf(sensVal, "%f", myFloat4);
  // client.publish("amTemp", sensVal,true);

  // float myFloat5 = pmTemp;
  // sprintf(sensVal, "%f", myFloat5);
  // client.publish("pmTemp", sensVal,true);
}

/********************************************
         send temperature value
             to server for
          temperature monitor
                to receive
                   end
* ******************************************/

/*************************************************************
                            Sensor reading
                                 Start
*************************************************************/

void sendSensor() {
  /**************************
       DS18B20 Sensor
         Starts Here
  **************************/

  if (!ds.search(addr)) {
    ds.reset_search();
    delay(250);
    return;
  }
  for (i = 0; i < 8; i++) {  // we need to drop 8 bytes of data
  }
  adr = (addr[7]);

  if (OneWire::crc8(addr, 7) != addr[7]) {
    Serial.println("CRC is not valid!");
    return;
  }
  ds.reset();
  ds.select(addr);
  ds.write(0x44, 1);  // start conversion, with parasite power on at the end

  delay(1000);  // maybe 750ms is enough, maybe not
  // we might do a ds.depower() here, but the reset will take care of it.

  present = ds.reset();
  ds.select(addr);
  ds.write(0xBE);  // Read Scratchpad

  for (i = 0; i < 9; i++) {  // we need 9 bytes to drop off
    data[i] = ds.read();
  }

  // Convert the data to actual temperature
  // because the result is a 16 bit signed integer, it should
  // be stored to an "int16_t" type, which is always 16 bits
  // even when compiled on a 32 bit processor.
  int16_t raw = (data[1] << 8) | data[0];
  if (type_s) {
    raw = raw << 3;  // 9 bit resolution default
    if (data[7] == 0x10) {
      // "count remain" gives full 12 bit resolution
      raw = (raw & 0xFFF0) + 12 - data[6];
    }
  } else {
    byte cfg = (data[4] & 0x60);
    // at lower res, the low bits are undefined, so let's zero them
    if (cfg == 0x00)
      raw = raw & ~7;  // 9 bit resolution, 93.75 ms
    else if (cfg == 0x20)
      raw = raw & ~3;  // 10 bit res, 187.5 ms
    else if (cfg == 0x40)
      raw = raw & ~1;  // 11 bit res, 375 ms
    //// default is 12 bit resolution, 750 ms conversion time
  }
  /**************************
       DS18B20 Sensor
         Ends Here
  **************************/

  /*************************************************************
                              Heater Control
                                   start
  ************************************************************/

  celsius = (float)raw / 16.0;
  if (adr == 181) {  //tortoise encloseure
                     // if(adr == 89)  {        //outside board out side dial
                     //if (adr == 49) {
    // test rig board out side dial
    // change celsius to fahrenheit if you prefer output in Fahrenheit;
    s1 = (celsius);  // Black outside
  }

  // if(adr == 96)  {
  //if (adr == 59) {
  if (adr == 197) {  //tortoise encloseure
                     // change celsius to fahrenheit if you prefer output in Fahrenheit;
    s2 = (celsius);  //GREEN coolSide (adr == 59)
  }
  //if (adr == 92) {   //inside board inSide dial
  // if(adr == 116)  {    // outside board inSide dial
  if (adr == 228) {  //tortoise encloseure
                     // change celsius to fahrenheit if you prefer output in Fahrenheit;
    s3 = (celsius);  //Heater RED heater
  }
  if (Am == true) {
    if (amHours == Hours) {  // set amTemp for the Night time setting
      if (amMinutes >= Minutes && amMinutes <= Minutes) {
        amTemp = amTemperature;
      }
    }
  }
  if (Am == false) {
    if (pmHours == Hours) {  // set pmTemp for the Night time setting
      if (pmMinutes >= Minutes && pmMinutes <= Minutes)
      // Serial.println("????????????????????????? 440");
      {
        pmTemp = pmTemperature;
        Serial.print("pmTemp & pmTemperature = ");
        Serial.println(pmTemp);
      }
    }
  }
}
/*************************************************************
                             Heater Control
                                    End
 *************************************************************/

/*************************************************************
                            Sensor reading
                                 End
*************************************************************/

void startHeaterTimer() {
  Serial.println("514 void startHeaterTimer");
  heaterOnTime = millis();
  heaterOn = true;
}
/********************************************
                Check Heater Timeout start
 ******************************************/

void checkHeaterTimeout() {
  Serial.println("XXXXXXXXXXXXXXXXXX void checkHeaterTimeout");
  if (heaterOn && (millis() - heaterOnTime > heaterTimeout)) {
    Serial.println("QQQQQQQQQQQQQQQQQQ line 516");
    if (s3 < amTemp || s3 < pmTemp)  // Check if the temperature is still below the threshold
    {
      client.publish("heaterStatus", "Temperature did not rise within the expected time.");
      Serial.println("WWWWWWWWWWWWWWWW line 518");
      // Optionally, you could send an email or other notification here
    }
    heaterOn = false;
    // Publish the status to the MQTT topic
    client.publish("heaterStatus", "Temperature did not rise within the expected time.");

    // Prepare the email subject and message
    String subject = "Heater Alert";
    String message = "Temperature did not rise within the expected time. The heater has been turned off.";

    // Send the email
    gmail_send(subject, message);
  }
}

/********************************************
                Check Heater Timeout end
 ******************************************/

/********************************************
                Email send start
 ******************************************/

void gmail_send(String subject, String message) {
  // set the network reconnection option
  MailClient.networkReconnect(true);

  smtp.debug(1);

  smtp.callback(smtpCallback);

  // set the session config
  Session_Config config;
  config.server.host_name = SMTP_HOST;
  config.server.port = SMTP_PORT;
  config.login.email = SENDER_EMAIL;
  config.login.password = "xhjh djyf roxm sxzh";
  config.login.user_domain = F("127.0.0.1");
  config.time.ntp_server = F("pool.ntp.org,time.nist.gov");
  config.time.gmt_offset = 3;
  config.time.day_light_offset = 0;

  // declare the message class
  SMTP_Message emailMessage;

  // set the message headers
  emailMessage.sender.name = "ESP8266 Heater App";
  emailMessage.sender.email = SENDER_EMAIL;
  emailMessage.subject = subject;
  emailMessage.addRecipient(F("To Whom It May Concern"), RECIPIENT_EMAIL);

  emailMessage.text.content = message;
  emailMessage.text.charSet = "utf-8";
  emailMessage.priority = esp_mail_smtp_priority::esp_mail_smtp_priority_low;

  // set the custom message header
  emailMessage.addHeader(F("Message-ID: <abcde.fghij@gmail.com>"));

  // connect to the server
  if (!smtp.connect(&config)) {
    Serial.printf("Connection error, Status Code: %d, Error Code: %d, Reason: %s\n", smtp.statusCode(), smtp.errorCode(), smtp.errorReason().c_str());
    return;
  }

  if (!smtp.isLoggedIn()) {
    Serial.println("Not yet logged in.");
  } else {
    if (smtp.isAuthenticated())
      Serial.println("Successfully logged in.");
    else
      Serial.println("Connected with no Auth.");
  }

  // start sending Email and close the session
  if (!MailClient.sendMail(&smtp, &emailMessage))
    Serial.printf("Error, Status Code: %d, Error Code: %d, Reason: %s\n", smtp.statusCode(), smtp.errorCode(), smtp.errorReason().c_str());
}

// callback function to get the Email sending status
void smtpCallback(SMTP_Status status) {
  // print the current status
  Serial.println(status.info());

  // print the sending result
  if (status.success()) {
    Serial.println("----------------");
    Serial.printf("Message sent success: %d\n", status.completedCount());
    Serial.printf("Message sent failed: %d\n", status.failedCount());
    Serial.println("----------------\n");

    for (size_t i = 0; i < smtp.sendingResult.size(); i++) {
      // get the result item
      SMTP_Result result = smtp.sendingResult.getItem(i);

      Serial.printf("Message No: %d\n", i + 1);
      Serial.printf("Status: %s\n", result.completed ? "success" : "failed");
      Serial.printf("Date/Time: %s\n", MailClient.Time.getDateTimeString(result.timestamp, "%B %d, %Y %H:%M:%S").c_str());
      Serial.printf("Recipient: %s\n", result.recipients.c_str());
      Serial.printf("Subject: %s\n", result.subject.c_str());
    }
    Serial.println("----------------\n");

    // free the memory
    smtp.sendingResult.clear();
  }
}
