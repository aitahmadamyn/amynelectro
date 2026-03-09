import streamlit as st
import pandas as pd
import plotly.express as px
import requests
import random
from datetime import datetime, timedelta

# Configuration de la page
st.set_page_config(page_title="SmartNexus-MA", page_icon="🌿", layout="wide")

# En-tête du tableau de bord
st.title("🌿 SmartNexus-MA : Tableau de Bord")
st.markdown("Surveillance en temps réel du système d'irrigation solaire intelligent.")

# --- Section : Données en temps réel ---
st.header("📊 Données en Temps Réel")

# URL de votre base de données Firebase (à configurer dans les secrets Streamlit)
FIREBASE_URL = st.secrets.get("FIREBASE_URL", "")

# Fonction pour récupérer les vraies données depuis Firebase
def get_sensor_data():
    if not FIREBASE_URL:
        st.error("⚠️ Veuillez configurer FIREBASE_URL dans les secrets Streamlit.")
        return {"battery_v": 0, "moisture": 0, "pump_current": 0, "flow_rate": 0, "pump_status": "OFF"}
        
    try:
        # Requête GET vers Firebase REST API
        response = requests.get(f"{FIREBASE_URL}/SmartNexus/Realtime.json")
        if response.status_code == 200:
            data = response.json()
            if data:
                return data
    except Exception as e:
        st.warning(f"Erreur de connexion à Firebase : {e}")
        
    return {"battery_v": 0, "moisture": 0, "pump_current": 0, "flow_rate": 0, "pump_status": "OFF"}

data = get_sensor_data()

# --- Indicateur Visuel de la Pompe ---
st.subheader("État du Système d'Irrigation")
if data['pump_status'] == "ON":
    st.success("💧 **La pompe est actuellement ACTIVE.** L'irrigation est en cours.", icon="✅")
else:
    st.warning("🛑 **La pompe est actuellement INACTIVE.** Le sol est suffisamment humide ou la batterie est faible.", icon="⏸️")

st.markdown("<br>", unsafe_allow_html=True)

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

# Rafraîchissement automatique (optionnel)
st.button("🔄 Rafraîchir les données")
