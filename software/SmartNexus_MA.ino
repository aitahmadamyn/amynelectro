/**
 * SmartNexus-MA: Smart Solar Irrigation Prototype
 * 
 * This code reads sensors (moisture, voltage, current, flow),
 * controls a water pump based on logic, and connects to WiFi.
 */

#include <WiFi.h>
#include <HTTPClient.h>

// --- Pin Definitions ---
const int MOISTURE_PIN = 34;
const int VOLTAGE_PIN = 35;
const int CURRENT_PIN = 32;
const int FLOW_PIN = 27;
const int PUMP_RELAY_PIN = 26;

// --- Thresholds & Calibration ---
const int DRY_SOIL_THRESHOLD = 2500; // Adjust based on calibration (higher = drier for capacitive)
const int WET_SOIL_THRESHOLD = 1500;
const float MIN_BATTERY_VOLTAGE = 11.5; // Stop pump if battery is below this

// Voltage divider ratio (R1=30k, R2=7.5k -> Ratio = 5.0)
// ESP32 ADC max is ~3.3V. 3.3V * 5 = 16.5V max measurable.
const float VOLTAGE_DIVIDER_RATIO = 5.0; 

// ACS712 5A sensitivity is 185mV/A. 
const float CURRENT_SENSITIVITY = 0.185; 
int currentZeroPoint = 1860; // ADC value when current is 0 (calibrate this)

// --- Variables ---
volatile int flowPulseCount = 0;
float flowRate = 0.0;
unsigned long oldTime = 0;
bool isPumpRunning = false;

// --- WiFi & Firebase Credentials ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
// Remplacez par l'URL de votre base de données Firebase (SANS le / à la fin)
const char* FIREBASE_URL = "https://YOUR_PROJECT_ID.firebaseio.com";

// Interrupt Service Routine for Flow Sensor
void IRAM_ATTR flowSensorISR() {
  flowPulseCount++;
}

void setup() {
  Serial.begin(115200);
  
  // Initialize Pins
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, LOW); // Ensure pump is OFF initially
  
  pinMode(FLOW_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), flowSensorISR, FALLING);

  // Connect to WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  // 1. Read Sensors
  int moistureRaw = analogRead(MOISTURE_PIN);
  
  int voltageRaw = analogRead(VOLTAGE_PIN);
  float pinVoltage = (voltageRaw / 4095.0) * 3.3;
  float batteryVoltage = pinVoltage * VOLTAGE_DIVIDER_RATIO;
  
  int currentRaw = analogRead(CURRENT_PIN);
  float currentVoltage = (currentRaw / 4095.0) * 3.3;
  // Note: ACS712 outputs VCC/2 (2.5V) at 0A. ESP32 ADC might need voltage divider for ACS712 output.
  float pumpCurrent = (currentVoltage - 2.5) / CURRENT_SENSITIVITY; 
  if(pumpCurrent < 0) pumpCurrent = 0; // Filter noise

  // Calculate Flow Rate
  if ((millis() - oldTime) > 1000) { 
    detachInterrupt(digitalPinToInterrupt(FLOW_PIN));
    // YF-S201: Flow rate (L/min) = Pulse frequency (Hz) / 7.5
    flowRate = ((1000.0 / (millis() - oldTime)) * flowPulseCount) / 7.5;
    oldTime = millis();
    flowPulseCount = 0;
    attachInterrupt(digitalPinToInterrupt(FLOW_PIN), flowSensorISR, FALLING);
  }

  // 2. Control Logic
  if (batteryVoltage > MIN_BATTERY_VOLTAGE) {
    if (moistureRaw > DRY_SOIL_THRESHOLD && !isPumpRunning) {
      Serial.println("Soil is dry. Turning ON pump.");
      digitalWrite(PUMP_RELAY_PIN, HIGH);
      isPumpRunning = true;
    } 
    else if (moistureRaw < WET_SOIL_THRESHOLD && isPumpRunning) {
      Serial.println("Soil is wet enough. Turning OFF pump.");
      digitalWrite(PUMP_RELAY_PIN, LOW);
      isPumpRunning = false;
    }
  } else {
    if (isPumpRunning) {
      Serial.println("WARNING: Low Battery! Turning OFF pump.");
      digitalWrite(PUMP_RELAY_PIN, LOW);
      isPumpRunning = false;
    }
  }

  // 3. Print Telemetry
  Serial.println("----- System Status -----");
  Serial.printf("Battery Voltage: %.2f V\n", batteryVoltage);
  Serial.printf("Soil Moisture (Raw): %d\n", moistureRaw);
  Serial.printf("Pump Current: %.2f A\n", pumpCurrent);
  Serial.printf("Water Flow: %.2f L/min\n", flowRate);
  Serial.printf("Pump Status: %s\n", isPumpRunning ? "ON" : "OFF");
  Serial.println("-------------------------");

  // 4. Send Data to Firebase
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(FIREBASE_URL) + "/SmartNexus/Realtime.json";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    // Construction du payload JSON
    String jsonPayload = "{";
    jsonPayload += "\"battery_v\":" + String(batteryVoltage) + ",";
    jsonPayload += "\"moisture\":" + String(moistureRaw) + ",";
    jsonPayload += "\"pump_current\":" + String(pumpCurrent) + ",";
    jsonPayload += "\"flow_rate\":" + String(flowRate) + ",";
    jsonPayload += "\"pump_status\":\"" + String(isPumpRunning ? "ON" : "OFF") + "\"";
    jsonPayload += "}";

    int httpResponseCode = http.PUT(jsonPayload); // PUT remplace les données existantes

    if (httpResponseCode > 0) {
      Serial.print("Données envoyées à Firebase. Code HTTP: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Erreur d'envoi Firebase: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("Erreur: WiFi déconnecté.");
  }

  delay(5000); // Attendre 5 secondes avant la prochaine lecture
}
