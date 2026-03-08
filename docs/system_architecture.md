# SmartNexus-MA System Architecture

## Overview
The SmartNexus-MA is a smart, solar-powered irrigation system designed for efficient water management. It uses an ESP32 microcontroller to collect data from various sensors, make intelligent irrigation decisions, and transmit the data to a web dashboard via WiFi.

## High-Level Architecture

### 1. Power Subsystem
- **Energy Source:** Solar Panel
- **Power Management:** Solar Charge Controller
- **Storage:** 12V Battery
- **Regulation:** A step-down buck converter (LM2596) reduces the 12V battery voltage to a stable 5V to power the ESP32 and 5V sensors.

### 2. Sensing Subsystem
- **Soil Moisture Sensor:** Measures the volumetric water content in the soil.
- **Water Flow Sensor:** Measures the volume of water delivered to the plants.
- **Voltage Sensor:** Monitors the 12V battery level to prevent deep discharge.
- **Current Sensor:** Monitors the power consumption of the water pump to detect faults (e.g., dry run or stall).

### 3. Control Subsystem
- **Microcontroller:** ESP32 acts as the brain of the system.
- **Actuator:** A 12V DC water pump controlled via a Relay Module or Logic-Level MOSFET.

### 4. Communication Subsystem
- **WiFi Module:** Built-in ESP32 WiFi connects to a local network or mobile hotspot.
- **Data Transmission:** Sends telemetry (moisture, flow, voltage, current, pump status) to a cloud dashboard (e.g., ThingSpeak, Blynk, or a custom MQTT broker/web server).

## Control Logic Flow
1. **Data Acquisition:** ESP32 reads analog and digital values from sensors every X seconds.
2. **Condition Evaluation:**
   - **Check Battery:** Is the battery voltage > 11.5V (safe threshold)?
     - *No:* Force Pump OFF (Protect battery). Send low battery alert.
     - *Yes:* Proceed to moisture check.
   - **Check Moisture:** Is soil moisture < Target Threshold?
     - *Yes:* Turn Pump ON.
     - *No:* Turn Pump OFF.
3. **Telemetry:** Send current state and sensor readings to the web dashboard.
