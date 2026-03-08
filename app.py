import streamlit as st
import pandas as pd
import plotly.express as px
import time
import random
from datetime import datetime, timedelta

# Configuration de la page
st.set_page_config(page_title="SmartNexus-MA", page_icon="🌿", layout="wide")

# En-tête du tableau de bord
st.title("🌿 SmartNexus-MA : Tableau de Bord")
st.markdown("Surveillance en temps réel du système d'irrigation solaire intelligent.")

# --- Section : Données en temps réel ---
st.header("📊 Données en Temps Réel")

# Fonction pour générer des données simulées
# (À remplacer plus tard par une connexion à Firebase ou MQTT pour lire les vraies données de l'ESP32)
def get_sensor_data():
    return {
        "battery_v": round(random.uniform(11.8, 12.6), 2),
        "moisture": random.randint(30, 80),
        "pump_current": round(random.uniform(0.0, 2.5), 2),
        "flow_rate": round(random.uniform(0.0, 15.0), 2),
        "pump_status": random.choice(["ON", "OFF"])
    }

data = get_sensor_data()

# Affichage des métriques principales sous forme de colonnes
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(label="🔋 Tension Batterie", value=f"{data['battery_v']} V", delta="-0.1 V" if data['battery_v'] < 12.0 else "+0.1 V")
with col2:
    st.metric(label="💧 Humidité du Sol", value=f"{data['moisture']} %", delta="-2 %")
with col3:
    st.metric(label="🚰 Débit d'eau", value=f"{data['flow_rate']} L/min")
with col4:
    status_color = "🟢" if data['pump_status'] == "ON" else "🔴"
    st.metric(label="⚙️ État de la Pompe", value=f"{status_color} {data['pump_status']}")

st.divider()

# --- Section : Historique (Graphiques) ---
st.header("📈 Historique des 24 dernières heures")

# Génération de fausses données historiques pour la démonstration
times = [datetime.now() - timedelta(hours=i) for i in range(24)]
times.reverse()
moisture_history = [random.randint(40, 70) for _ in range(24)]
battery_history = [round(random.uniform(12.0, 12.8), 2) for _ in range(24)]

df = pd.DataFrame({
    "Heure": times,
    "Humidité (%)": moisture_history,
    "Tension Batterie (V)": battery_history
})

col_chart1, col_chart2 = st.columns(2)

with col_chart1:
    fig_moisture = px.line(df, x="Heure", y="Humidité (%)", title="Évolution de l'humidité du sol", markers=True)
    fig_moisture.update_traces(line_color="#3b82f6") # Bleu
    st.plotly_chart(fig_moisture, use_container_width=True)

with col_chart2:
    fig_battery = px.line(df, x="Heure", y="Tension Batterie (V)", title="Évolution de la tension batterie", markers=True)
    fig_battery.update_traces(line_color="#10b981") # Vert
    st.plotly_chart(fig_battery, use_container_width=True)

# Note explicative pour le projet
st.info("""
💡 **Note pour le prototype :** Actuellement, ce tableau de bord affiche des données simulées pour la démonstration. 
Pour le connecter à votre ESP32, vous devrez envoyer les données de l'ESP32 vers une base de données (comme Firebase Realtime Database ou un broker MQTT), puis lire ces données ici dans ce script Python.
""")
