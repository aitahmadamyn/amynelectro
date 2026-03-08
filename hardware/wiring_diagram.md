# Wiring Diagram & Connections

## Power Routing
1. **Solar Panel** -> Connects to the `Solar Input` terminals on the Solar Charge Controller.
2. **12V Battery** -> Connects to the `Battery` terminals on the Solar Charge Controller. *(Always connect the battery to the controller BEFORE connecting the solar panel).*
3. **Charge Controller Load Output** -> Connects to the `IN+` and `IN-` of the **LM2596 Buck Converter** AND to the power input of the **Relay Module / Pump circuit**.
4. **LM2596 Buck Converter** -> Adjust the potentiometer until the output is exactly **5.0V**. Connect `OUT+` to ESP32 `VIN` (or `5V` pin) and `OUT-` to ESP32 `GND`.

## Actuator (Pump & Relay)
1. **Relay Module VCC** -> 5V from Buck Converter.
2. **Relay Module GND** -> Common GND.
3. **Relay Module IN** -> ESP32 GPIO 26.
4. **Pump Power** -> Connect the Pump's Negative (-) wire to the Battery/Load Negative (-). Connect the Pump's Positive (+) wire to the Relay's `Normally Open (NO)` terminal. Connect the Relay's `Common (COM)` terminal to the Battery/Load Positive (+).

## Sensors
1. **Capacitive Soil Moisture Sensor:**
   - VCC -> ESP32 3.3V
   - GND -> Common GND
   - AOUT -> ESP32 GPIO 34
2. **Water Flow Sensor (YF-S201):**
   - VCC -> 5V (from Buck Converter)
   - GND -> Common GND
   - Signal -> ESP32 GPIO 27 (Requires a voltage divider or logic level converter if the sensor outputs 5V, as ESP32 pins are 3.3V tolerant. A simple 10k/20k resistor divider works).
3. **Voltage Sensor (0-25V):**
   - VCC/IN+ -> 12V Battery Positive
   - GND/IN- -> Common GND
   - Signal (S) -> ESP32 GPIO 35
4. **Current Sensor (ACS712):**
   - VCC -> 5V
   - GND -> Common GND
   - OUT -> ESP32 GPIO 32
   - IP+ / IP- -> Connected in series with the Water Pump's positive wire.

## ESP32 Pin Mapping Summary

| Component | ESP32 Pin | Pin Type | Notes |
|-----------|-----------|----------|-------|
| LM2596 5V Output | VIN / 5V | Power In | Must be exactly 5V |
| Common Ground | GND | Ground | Tie all grounds together |
| Soil Moisture | GPIO 34 | Analog In | ADC1 channel |
| Battery Voltage | GPIO 35 | Analog In | ADC1 channel |
| Pump Current | GPIO 32 | Analog In | ADC1 channel |
| Water Flow | GPIO 27 | Digital In | Interrupt capable |
| Relay / Pump Control | GPIO 26 | Digital Out | Active High/Low depends on relay |
