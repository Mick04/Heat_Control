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
//#define builtInLED_Pin 13    // on board LED_Pin
#define LED_Pin D6    //LED_Pin  //change when debuged
OneWire ds(D7);       // active board  // on pin 10 (a 4.7K resistor is necessary)

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
uint_fast8_t amTemp = 0;     // is set by the sliders
uint_fast8_t pmTemp = 0;     // is set by the sliders
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
bool Am;
bool AmFlag;
bool heaterStatus = false;
// bool Reset = false;  // set when slider is moved
bool StartUp = 1;
// Timer-related variables
unsigned long heaterOnTime = 0;
const unsigned long heaterTimeout = 3600000;
//const unsigned long heaterTimeout = 1800000;
//const unsigned long heaterTimeout = 60000; //for debuging
bool heaterOn = false;

/********************************************
      settup the time variables start
 * ******************************************/
const long utcOffsetInSeconds = 3600;

char daysOfTheWeek[7][12] = { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };
char sensor[50];
// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);
/********************************************
      settup the time variables end
 * ******************************************/

/********************************************
      wifi and pubSup credentials start
 * ******************************************/

const char *ssid = "Gimp_EXT";
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
  ArduinoOTA.setHostname("TORTOISE_HOSING");
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
    reconnect();
  }

  client.loop();
  sendSensor();
  publishTempToMQTT();
  relay_Control();  // call relay_Control function
  timeClient.update();
  Day = timeClient.getDay();
  Hours = timeClient.getHours();
  Minutes = timeClient.getMinutes();
  seconds = timeClient.getSeconds();
  Am = true;
  Am = (Hours < 12);
  if (heaterOn) {
    checkHeaterTimeout();
  }
}
/********************************************
  *       connect to the internet start.      *
 * ******************************************/
void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
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

  // Null-terminate the payload to treat it as a string
  payload[length] = '\0';

  if (strstr(topic, "amTemperature")) {
    sscanf((char *)payload, "%d", &amTemperature);
    if (StartUp == 1) {
      amTemp = amTemperature;
    }
  }
  if (strstr(topic, "pmTemperature")) {
    sscanf((char *)payload, "%d", &pmTemperature);
    if (StartUp == 1) {
      pmTemp = pmTemperature;
    }
  }

  if (strstr(topic, "AMtime")) {
    sscanf((char *)payload, "%d:%d", &amHours, &amMinutes);
  }

  if (strstr(topic, "PMtime")) {
    sscanf((char *)payload, "%d:%d", &pmHours, &pmMinutes);
  }
  if (amTemp != 0 && pmTemp != 0) {
    StartUp = 0;
  }
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
    if (client.connect(clientId.c_str())) {
      // if (client.connect("ESP8266Client")) {
      Serial.println("connected");
      // // Once connected,
      // ... subscribe to topics
      client.subscribe("Temp_Control/sub");
      client.subscribe("control");
      client.subscribe("amTemperature");
      client.subscribe("pmTemperature");
      client.subscribe("AMtime");
      client.subscribe("PMtime");
      client.subscribe("HeaterStatus");

    } else {
      Serial.print("failed, reconnect = ");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
/*************************************************************
                            Relay Control
                                 start
*************************************************************/

void relay_Control() {
  int targetTemp = AmFlag ? amTemp : pmTemp;
  if (s3 < targetTemp) {
    digitalWrite(Relay_Pin, HIGH);
    digitalWrite(LED_Pin, HIGH);  // LED_Pin on
    digitalWrite(LED_BUILTIN, LOW);  // LED_Pin on
    heaterStatus = true;
    if (!heaterOn) {
      startHeaterTimer();
    }
  } else if (s3 > targetTemp) {
    digitalWrite(Relay_Pin, LOW);
    digitalWrite(LED_Pin, LOW);  // LED_Pin off
    digitalWrite(LED_BUILTIN, HIGH);  // LED_Pin off
    heaterStatus = false;
    heaterOn = false;
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

  int myHours = Hours;
  sprintf(sensVal, "%d", myHours);
  client.publish("gaugeHours", sensVal, true);

  int myMinutes = Minutes;
  sprintf(sensVal, "%d", myMinutes);
  client.publish("gaugeMinutes", sensVal, true);

  const char *heaterStatusStr = heaterStatus ? "true" : "false";
  client.publish("HeaterStatus", heaterStatusStr, true);
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
  char sensVal[50];  // Declare sensVal here

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
  if (Am) {
    if (amHours == Hours && amMinutes == Minutes) {  // set amTemp for the Night time setting
      AmFlag = true;
      amTemp = amTemperature;
      int myTemp = amTemp;
      sprintf(sensVal, "%d", myTemp);
      client.publish("targetTemperature", sensVal, true);
    }
  } else {
    if (pmHours == Hours && pmMinutes == Minutes) {  // set pmTemp for the Night time setting
      AmFlag = false;
      pmTemp = pmTemperature;
      int myTemp = pmTemp;
      sprintf(sensVal, "%d", myTemp);
      client.publish("targetTemperature", sensVal, true);
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
  heaterOnTime = millis();
  heaterOn = true;
}
/********************************************
                Check Heater Timeout start
 ******************************************/

void checkHeaterTimeout() {
  if (heaterOn && (millis() - heaterOnTime > heaterTimeout)) {
    if (s3 < amTemp || s3 < pmTemp)  // Check if the temperature is still below the threshold
    {
      client.publish("HeaterStatus", "Temperature did not rise within the expected time.");

      // Prepare the email subject and message
      String subject = "Heater Alert";
      String message = "Temperature did not rise within the expected time. The heater has been turned off.";

      // Send the email
      gmail_send(subject, message);
    }
    heaterOn = false;
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
  if (status.success()) {
    for (size_t i = 0; i < smtp.sendingResult.size(); i++) {
      // get the result item
      SMTP_Result result = smtp.sendingResult.getItem(i);
    }
    // free the memory
    smtp.sendingResult.clear();
  }
}