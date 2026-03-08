# SmartNexus-MA

Smart Solar Irrigation Prototype - Electronic System Design

This repository contains the hardware design, software, and documentation for the SmartNexus-MA project.

## Directory Structure

- `/docs` - System architecture, circuit explanations, and power protection guidelines.
- `/hardware` - Bill of Materials (BOM) and wiring diagrams.
- `/software` - ESP32 Arduino source code.

## Project Overview

The goal is to control a solar-powered irrigation system with sensors and an ESP32 microcontroller. 

### Control Logic
- If soil moisture is low AND battery level is sufficient: **Activate the pump**.
- If battery level is low: **Stop the pump to protect the battery**.

### Data Collected
- Soil moisture
- Water flow
- Battery voltage
- Pump current
- Pump status
