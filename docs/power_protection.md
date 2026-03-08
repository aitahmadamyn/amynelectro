# Power Protection Suggestions

When dealing with batteries, solar panels, and water pumps, safety and protection are critical to prevent fires, damaged components, or system failure.

## 1. Fusing (Critical)
Always use fuses to protect against short circuits.
- **Battery Fuse:** Place an inline blade fuse (e.g., 10A) on the positive wire as close to the battery terminal as possible. If a short occurs anywhere in the system, this fuse will blow and prevent the battery from catching fire.
- **Pump Fuse:** Place a secondary fuse (e.g., 5A, depending on pump rating) on the positive wire leading to the pump.

## 2. Flyback Diode for the Pump
DC motors (like the water pump) are highly inductive loads. When the relay turns off the pump, the collapsing magnetic field generates a massive voltage spike (flyback voltage) that can damage the relay contacts or the MOSFET.
- **Solution:** Place a flyback diode (e.g., 1N4007) in parallel with the pump. The cathode (striped end) connects to the positive terminal of the pump, and the anode connects to the negative terminal.

## 3. Deep Discharge Protection
Lead-acid and Li-ion batteries degrade rapidly if discharged below a certain voltage.
- The **Solar Charge Controller** usually has built-in Low Voltage Disconnect (LVD) on its load terminals. Connect your LM2596 and Pump to the *Load* terminals of the controller, not directly to the battery.
- Implement software protection: The ESP32 should constantly monitor the battery voltage via the voltage sensor. If voltage drops below 11.5V (for a 12V SLA battery), the ESP32 must refuse to turn on the pump, regardless of soil moisture.

## 4. Reverse Polarity Protection
Accidentally connecting the battery backwards will destroy the electronics instantly.
- Use polarized connectors (like XT60 or Anderson Powerpoles) so they cannot be plugged in backward.
- The Solar Charge Controller usually has built-in reverse polarity protection, but the custom ESP32 circuit relies on you wiring it correctly.

## 5. Environmental Protection
- **Waterproofing:** The prototype involves water. Place all electronics (ESP32, buck converter, relay, charge controller) inside an IP65 or IP67 rated waterproof enclosure.
- **Cable Glands:** Use waterproof cable glands where wires exit the enclosure to prevent moisture ingress.
- **Conformal Coating:** For long-term outdoor use, apply a silicone conformal coating to the ESP32 and sensor PCBs to protect them from humidity and condensation.
