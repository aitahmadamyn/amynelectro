# Circuit Explanation

## 1. Power Management
The system relies on a 12V architecture driven by the solar panel and battery. The **Solar Charge Controller** is the heart of the power system, ensuring the battery is charged safely and not over-discharged. 
Because the ESP32 operates at 3.3V and requires a 5V input (via its onboard regulator), we use an **LM2596 Buck Converter** to step down the 12V from the battery to a stable 5V. This 5V line powers the ESP32, the relay module, and the 5V sensors.

## 2. Voltage Monitoring
The ESP32's Analog-to-Digital Converter (ADC) can only measure up to 3.3V. To measure the 12V battery, we use a **Voltage Divider Module** (typically a 30kΩ and 7.5kΩ resistor network). This scales the 0-25V input down to 0-5V. Since the ESP32 max is 3.3V, the maximum measurable battery voltage will be around 16.5V, which is perfect for a 12V system.

## 3. Current Monitoring
The **ACS712 Current Sensor** is placed in series with the water pump. It uses the Hall effect to measure current and outputs an analog voltage proportional to the current. This allows the ESP32 to detect if the pump is running normally, drawing too much current (stalled/clogged), or drawing no current (dry run/broken wire).

## 4. Soil Moisture Sensing
We use a **Capacitive Soil Moisture Sensor** instead of a resistive one. Resistive sensors corrode quickly in wet soil due to electrolysis. Capacitive sensors measure the dielectric permittivity of the surrounding medium and are completely sealed, making them last much longer. It outputs an analog voltage inversely proportional to moisture.

## 5. Water Flow Sensing
The **YF-S201 Water Flow Sensor** contains a pinwheel and a Hall effect sensor. Every time the pinwheel rotates a certain amount, it outputs a digital pulse. The ESP32 counts these pulses using a hardware interrupt to calculate the flow rate (Liters per minute) and total volume dispensed.

## 6. Pump Control
The ESP32 GPIO pins cannot provide enough current or voltage to drive a 12V pump directly. We use a **Relay Module** (or a logic-level MOSFET like IRLZ44N). When the ESP32 sends a HIGH signal to the relay, the relay's internal electromagnet closes a switch, completing the 12V circuit and turning on the pump. Optocouplers on the relay module isolate the ESP32 from voltage spikes caused by the pump motor.
