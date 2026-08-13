import streamlit as st
import pandas as pd
import numpy as np
import joblib
import os
import plotly.graph_objects as go
import time

st.set_page_config(page_title="EROP Clinical Intelligence", layout="wide")

# Tailwind CDN and Custom CSS
st.markdown("""
<script src="https://cdn.tailwindcss.com?v=4"></script>
<style>
    /* Typography */
    h1, h2, h3 { color: #2B3A42; font-family: 'Georgia', serif; }
    p, span, div { color: #4A4A4A; }
    #MainMenu, footer { display: none; }

    /* --- DYNAMIC ANIMATED BACKGROUND --- */
    @keyframes gridPan {
        0% { background-position: 0px 0px; }
        100% { background-position: 40px 40px; }
    }
    [data-testid="stAppViewContainer"] {
        background-color: #F9F9F7;
        background-image: 
            linear-gradient(rgba(74, 124, 89, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74, 124, 89, 0.04) 1px, transparent 1px);
        background-size: 40px 40px;
        animation: gridPan 20s linear infinite;
    }

    /* --- PAGE LOAD ORCHESTRATION --- */
    @keyframes fadeSlideDown { 0% { opacity: 0; transform: translateY(-15px); } 100% { opacity: 1; transform: translateY(0); } }
    @keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
    
    .stagger-in-1 { animation: fadeSlideDown 0.5s ease forwards; }
    .stagger-in-2 { animation: fadeSlideDown 0.5s ease 0.1s forwards; opacity: 0; }
    .stagger-in-3 { animation: fadeSlideUp 0.5s ease 0.2s forwards; opacity: 0; }
    .stagger-in-4 { animation: fadeSlideUp 0.5s ease 0.3s forwards; opacity: 0; }
    .stagger-in-5 { animation: fadeSlideUp 0.5s ease 0.4s forwards; opacity: 0; }
    .stagger-in-6 { animation: fadeSlideUp 0.5s ease 0.5s forwards; opacity: 0; }

    /* --- KPI METRIC CARDS --- */
    .kpi-card {
        background-color: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px);
        border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); 
        border: 1px solid rgba(255,255,255,0.5); transition: all 0.3s ease; text-align: left;
    }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 12px -1px rgba(0,0,0,0.1); }
    .kpi-title { font-size: 0.875rem; color: #6b7280; font-weight: 500; margin-bottom: 4px; }
    .kpi-value { font-size: 1.875rem; color: #4A7C59; font-weight: 700; }

    /* --- RESULTS SEQUENCE --- */
    /* Phase 2: Ambient Risk Wash */
    @keyframes ambientFadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
    @keyframes pulseShadow {
        0% { box-shadow: 0 0 0 0 rgba(211,47,47,0.1); }
        50% { box-shadow: 0 0 0 8px rgba(211,47,47,0); }
        100% { box-shadow: 0 0 0 0 rgba(211,47,47,0); }
    }
    .results-card {
        border-radius: 12px; padding: 32px; border-left: 4px solid transparent;
        opacity: 0; animation: ambientFadeIn 0.8s ease 0.2s forwards;
        backdrop-filter: blur(5px);
        background-color: white;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .risk-low { background-image: linear-gradient(to right, rgba(76, 175, 80, 0.05), transparent); border-left-color: #4CAF50; border-top: 1px solid rgba(76, 175, 80, 0.2); }
    .risk-high {
        background-image: linear-gradient(to right, rgba(211, 47, 47, 0.05), transparent); border-left-color: #D32F2F; border-top: 1px solid rgba(211, 47, 47, 0.2);
        animation: ambientFadeIn 0.8s ease 0.2s forwards, pulseShadow 2s infinite 1.0s;
    }

    /* Phase 3: Cascade Reveal */
    .cascade-1 { opacity: 0; animation: fadeSlideUp 0.4s ease 0.4s forwards; }
    .cascade-2 { opacity: 0; animation: fadeSlideUp 0.4s ease 0.55s forwards; }
    .cascade-4 { opacity: 0; animation: fadeSlideUp 0.4s ease 0.6s forwards; } /* Gauge */

    @property --num { syntax: '<number>'; initial-value: 0; inherits: false; }

    /* Value Flip */
    @keyframes flipIn { 0% { transform: rotateX(-90deg); opacity: 0; } 100% { transform: rotateX(0deg); opacity: 1; } }
    .value-flip { animation: flipIn 0.4s ease-out forwards; display: inline-block; }

    /* Icons */
    @keyframes pulseAlert { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
    .pulse-alert svg { animation: pulseAlert 1.5s infinite ease-in-out; }
    @keyframes popBounce { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }

    /* --- WIDGET OVERRIDES --- */
    div[data-testid="stRadio"] label { transition: all 0.3s ease; border-left: 4px solid transparent; padding-left: 10px; margin-bottom: 4px; border-radius: 4px; }
    div[data-testid="stRadio"] label:hover { background-color: rgba(74, 124, 89, 0.05); border-left-color: #4A7C59; }
    div[data-testid="stRadio"] label[data-checked="true"] { border-left-color: #4A7C59; font-weight: 600; background-color: rgba(74, 124, 89, 0.1); }
    input[type="number"]:focus { border-color: #4A7C59 !important; box-shadow: 0 0 0 1px #4A7C59 !important; }
    button[data-testid="baseButton-primary"] { transition: all 0.2s ease; }
    button[data-testid="baseButton-primary"]:hover { transform: scale(1.02) translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    button[data-testid="baseButton-primary"]:active { transform: scale(0.98); }
    div[data-testid="stExpander"] details { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); background-color: rgba(255,255,255,0.7); }
    div[data-testid="stExpander"] details[open] summary ~ * { animation: fadeSlideUp 0.3s ease forwards; }
    .element-container img { transition: transform 0.3s ease; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .element-container img:hover { transform: scale(1.02); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 10; }
    @keyframes typewrite { from { opacity: 0; transform: translateX(-5px); } to { opacity: 1; transform: translateX(0); } }
    .report-line { opacity: 0; animation: typewrite 0.2s forwards; display: block; font-family: monospace; }
</style>
""", unsafe_allow_html=True)

# SVG Icons
SVG_HEARTBEAT_SIDEBAR = """<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2B3A42" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>"""
SVG_ALERT = """<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>"""
SVG_CHECK = """<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#388E3C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>"""

def get_results_html(prob, threshold, anim_id):
    is_high_risk = prob >= threshold
    prob_pct = int(prob * 100)
    wash_class = "risk-high" if is_high_risk else "risk-low"
    trace_color = "#D32F2F" if is_high_risk else "#4CAF50"
    
    # SVG Gauge Calculations
    radius = 42
    circumference = np.pi * radius
    fill_offset = circumference * (1 - prob)
    
    thresh_theta = np.pi - (threshold * np.pi)
    thresh_x = 50 + radius * np.cos(thresh_theta)
    thresh_y = 50 - radius * np.sin(thresh_theta)
    
    meter_color = "#EF4444" if is_high_risk else "#10B981"
    
    # Diagnosis Texts
    if is_high_risk:
        icon = SVG_ALERT
        diag_title = "<span style='color:#DC2626;'>HIGH RISK</span>"
        diag_desc = "The patient has breached the clinical safety threshold. Immediate intervention recommended."
        pulse_class = "pulse-alert"
    else:
        icon = SVG_CHECK
        diag_title = "<span style='color:#059669;'>LOW RISK</span>"
        diag_desc = "The patient's telemetry indicates a stable profile suitable for standard discharge protocols."
        pulse_class = "pop-check"
    
    # NO LEADING SPACES in HTML blocks to prevent Streamlit rendering them as text
    return f"""<style>
@keyframes gaugeFill_{anim_id} {{ 0% {{ stroke-dashoffset: {circumference}; }} 100% {{ stroke-dashoffset: {fill_offset}; }} }}
@keyframes counterRoll_{anim_id} {{ 100% {{ --num: {prob_pct}; }} }} 
.prob-counter-{anim_id}::after {{ counter-reset: prob var(--num); content: counter(prob) "%"; animation: counterRoll_{anim_id} 1.5s cubic-bezier(0.2, 0.9, 0.3, 1) forwards; }}
@keyframes ekgDraw_{anim_id} {{ 0% {{ stroke-dashoffset: 1000; opacity: 1; }} 80% {{ stroke-dashoffset: 0; opacity: 1; }} 100% {{ stroke-dashoffset: 0; opacity: 0; }} }}
@keyframes fadeSlideUp_{anim_id} {{ 0% {{ opacity: 0; transform: translateY(15px); }} 100% {{ opacity: 1; transform: translateY(0); }} }}
@keyframes popBounce_{anim_id} {{ 0% {{ transform: scale(0); opacity: 0; }} 60% {{ transform: scale(1.2); opacity: 1; }} 100% {{ transform: scale(1); opacity: 1; }} }}
</style>
<div style="position: relative; margin-top: 25px; width: 100%;">
<svg style="position: absolute; top: -1px; left: 0; width: 100%; height: 20px; z-index: 10; pointer-events: none;" viewBox="0 0 500 20" preserveAspectRatio="none">
<path stroke="{trace_color}" style="stroke-width: 2; fill: none; stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: ekgDraw_{anim_id} 1.2s ease-out forwards;" d="M0 10 L100 10 L110 5 L120 15 L130 10 L300 10 L310 0 L320 20 L330 10 L500 10"></path>
</svg>
<div class="results-card {wash_class}" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 40px;">
<div style="flex: 1 1 300px; min-width: 300px;">
<div class="cascade-1" style="animation-name: fadeSlideUp_{anim_id}; margin-bottom: 20px;">
<h3 style="margin: 0 0 16px 0; color: #4B5563; font-size: 1rem; text-transform: uppercase; letter-spacing: 1.5px;">Clinical Diagnosis</h3>
<div style="display: flex; align-items: center; gap: 16px;">
<div class="{pulse_class}" style="animation-name: {'pulseAlert' if is_high_risk else 'popBounce_' + anim_id};">{icon}</div>
<h2 style="margin: 0; font-size: 2.2rem; font-weight: 800; letter-spacing: -0.5px;">{diag_title}</h2>
</div>
</div>
<div class="cascade-2" style="animation-name: fadeSlideUp_{anim_id};">
<p style="color: #4B5563; font-size: 1.1rem; line-height: 1.6; margin: 0;">{diag_desc}</p>
</div>
</div>
<div class="cascade-4" style="flex: 1 1 350px; text-align: center; animation-name: fadeSlideUp_{anim_id};">
<div style="position: relative; max-width: 320px; margin: 0 auto;">
<svg viewBox="0 0 100 55" style="width: 100%; overflow: visible; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.05));">
<path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="#E5E7EB" stroke-width="7" stroke-linecap="round" />
<path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="{meter_color}" stroke-width="7" stroke-linecap="round" style="stroke-dasharray: {circumference}; stroke-dashoffset: {circumference}; animation: gaugeFill_{anim_id} 1.5s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;" />
<circle cx="{thresh_x}" cy="{thresh_y}" r="2.5" fill="white" stroke="#6B7280" stroke-width="1.5" />
</svg>
<div style="position: absolute; bottom: 0; left: 0; width: 100%; text-align: center; transform: translateY(-5px);">
<div style="color: #9CA3AF; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: -5px;">Mortality Risk</div>
<div class="prob-counter-{anim_id}" style="font-size: 4.5rem; font-weight: 800; color: #1F2937; line-height: 1.1; font-variant-numeric: tabular-nums;"></div>
<div style="margin-top: 2px;"><span style="background: white; color: #6B7280; font-size: 0.8rem; font-weight: 600; padding: 4px 12px; border-radius: 999px; border: 1px solid #E5E7EB; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Cutoff {threshold*100:.1f}%</span></div>
</div>
</div>
</div>
</div>
</div>"""

# Load dependencies
@st.cache_resource
def load_assets():
    scaler_77 = joblib.load('outputs/scaler.pkl')
    selector = joblib.load('outputs/selector.pkl')
    scaler_17 = joblib.load('outputs/scaler_17.pkl')
    features_17 = joblib.load('outputs/selected_features.pkl')
    dataset_cols = pd.read_csv('outputs/final_merged_dataset.csv', nrows=0).drop(columns=['OUTCOME']).columns.tolist()
    
    models = {}
    
    model_paths = {
        'Logistic Regression': 'outputs/logistic_regression_model.pkl',
        'Random Forest': 'outputs/random_forest_model.pkl',
        'XGBoost': 'outputs/xgboost_model.pkl',
        'LightGBM': 'outputs/lightgbm_model.pkl',
        'Stacking Ensemble': 'outputs/stacking_ensemble_model.pkl'
    }
    
    for name, path in model_paths.items():
        if os.path.exists(path):
            models[name] = joblib.load(path)
        else:
            st.sidebar.warning(f"Model file missing: {name}")
    
    metrics_data = {}
    if os.path.exists('outputs/classification_reports.txt'):
        with open('outputs/classification_reports.txt', 'r') as f:
            for sec in f.read().split('=== '):
                if not sec.strip(): continue
                name_part = sec.split('\n')[0]
                model_name = name_part.split('(')[0].strip()
                thresh = float(name_part.split('Threshold:')[1].split(')')[0].strip()) if 'Threshold:' in name_part else 0.5
                f1 = next((float(line.split('F1:')[1].split('|')[0].strip()) for line in sec.split('\n') if 'F1:' in line), 0.0)
                metrics_data[model_name] = {'threshold': thresh, 'f1': f1}
                
    return scaler_77, selector, scaler_17, features_17, dataset_cols, models, metrics_data

scaler_77, selector, scaler_17, features_17, dataset_cols, models, metrics_data = load_assets()

# --- SIDEBAR ---
with st.sidebar:
    st.markdown(f"<div class='stagger-in-1'>{SVG_HEARTBEAT_SIDEBAR}</div>", unsafe_allow_html=True)
    st.markdown("<h1 class='stagger-in-2' style='margin-top:0;'>EROP Clinical AI</h1>", unsafe_allow_html=True)
    st.markdown("<hr class='stagger-in-2'>", unsafe_allow_html=True)
    st.markdown("<div class='stagger-in-3'><b>Predictive Modeling Engine</b></div>", unsafe_allow_html=True)
    st.markdown("<div class='stagger-in-4'>", unsafe_allow_html=True)
    selected_model_name = st.radio("Select Active Algorithm", list(models.keys()), label_visibility="collapsed")
    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("<hr class='stagger-in-5'>", unsafe_allow_html=True)
    st.markdown("<div class='stagger-in-6' style='background:#f3f4f6; color:#6b7280; padding:4px 12px; border-radius:12px; display:inline-block; font-size:12px;'>EROP Early Warning System v3.0</div>", unsafe_allow_html=True)

active_model = models[selected_model_name]
active_threshold = metrics_data.get(selected_model_name, {}).get('threshold', 0.5)
active_f1 = metrics_data.get(selected_model_name, {}).get('f1', 0.0)

# --- MAIN DASHBOARD HEADER ---
st.markdown("<h1 class='stagger-in-1' style='margin-bottom:0;'>Patient Mortality Risk Assessment</h1>", unsafe_allow_html=True)
st.markdown("<p class='stagger-in-2' style='margin-top:5px;'>Enter patient EMR telemetry to instantly evaluate expiration risk upon admission.</p>", unsafe_allow_html=True)

# KPI Row (Custom HTML)
st.markdown(f"""
<div style="display: flex; gap: 20px; margin-bottom: 25px;">
    <div class="kpi-card stagger-in-3" style="flex: 1;">
        <div class="kpi-title">Active Algorithm</div>
        <div class="kpi-value value-flip" style="color: #2B3A42; font-size: 1.5rem;">{selected_model_name}</div>
    </div>
    <div class="kpi-card stagger-in-4" style="flex: 1;">
        <div class="kpi-title">Model F1 Score</div>
        <div class="kpi-value value-flip">{active_f1:.3f}</div>
    </div>
    <div class="kpi-card stagger-in-5" style="flex: 1;">
        <div class="kpi-title">Decision Threshold</div>
        <div class="kpi-value value-flip">{active_threshold:.2f}</div>
    </div>
</div>
""", unsafe_allow_html=True)

# --- TABS ---
st.markdown("<div class='stagger-in-6'>", unsafe_allow_html=True)
tab1, tab2 = st.tabs(["EMR Data Import", "Algorithm Analytics"])

# TAB 1: PREDICTION
with tab1:
    with st.container(border=True):
        st.subheader("Data Input Mode")
        st.markdown("Select how you would like to enter the patient's data.")
        
        with st.expander("Quick EMR Bulk Import (77 Raw Features)", expanded=False):
            st.markdown("Paste the raw comma-separated telemetry (77 features).")
            raw_input = st.text_area("Raw EMR String", height=100, key="raw_emr")
            if st.button("Run Risk Assessment (Bulk Import)", type="primary"):
                if raw_input:
                    try:
                        values = [float(x.strip()) for x in raw_input.split(',')]
                        if len(values) != 77: st.error(f"EMR Import Error: Expected 77 points, received {len(values)}.")
                        else:
                            df = pd.DataFrame([values], columns=dataset_cols)
                            st.session_state['processed_features'] = selector.transform(scaler_77.transform(df))
                            st.session_state['run_id'] = time.time()
                    except Exception as e: st.error(f"System Error parsing EMR data: {e}")
                else: st.warning("Please insert EMR telemetry data before running.")

        with st.expander("Manual Clinical Entry (17 Core Features)", expanded=True):
            with st.form("manual_entry_form"):
                col_c1, col_c2, col_c3 = st.columns(3)
                with col_c1:
                    st.markdown("**Demographics & History**")
                    v_opd = st.checkbox("Emergency / OPD Admission")
                    v_alc = st.checkbox("Alcohol History")
                    v_htn = st.checkbox("Hypertension (HTN)")
                    v_cad = st.checkbox("Coronary Artery Disease (CAD)")
                    v_acs = st.checkbox("Acute Coronary Syndrome (ACS)")
                    v_chb = st.checkbox("Complete Heart Block (CHB)")
                with col_c2:
                    st.markdown("**Clinical Conditions**")
                    v_hfref = st.checkbox("Heart Failure with Reduced EF (HFrEF)")
                    v_hfnef = st.checkbox("Heart Failure with Normal EF (HFnEF)")
                    v_aki = st.checkbox("Acute Kidney Injury (AKI)")
                    v_uti = st.checkbox("Urinary Tract Infection (UTI)")
                    v_cardiogenic = st.checkbox("Cardiogenic Shock")
                    v_shock = st.checkbox("General Shock")
                with col_c3:
                    st.markdown("**Labs & Metrics**")
                    v_tlc = st.number_input("TLC", value=10.0, format="%.2f")
                    v_plat = st.number_input("Platelets", value=150.0, format="%.2f")
                    v_creat = st.number_input("Creatinine", value=1.0, format="%.2f")
                    v_ef = st.number_input("Ejection Fraction (EF %)", value=50.0, format="%.2f")
                    v_renal = st.number_input("Renal Risk Score", value=0.0, format="%.2f")
                
                if st.form_submit_button("Run Risk Assessment (Manual)", type="primary"):
                    feature_dict = {
                        'TYPE OF ADMISSION-EMERGENCY/OPD': 1.0 if v_opd else 0.0,
                        'ALCOHOL': 1.0 if v_alc else 0.0, 'HTN': 1.0 if v_htn else 0.0, 'CAD': 1.0 if v_cad else 0.0,
                        'TLC': v_tlc, 'PLATELETS': v_plat, 'CREATININE': v_creat, 'EF': v_ef,
                        'ACS': 1.0 if v_acs else 0.0, 'HFREF': 1.0 if v_hfref else 0.0, 'HFNEF': 1.0 if v_hfnef else 0.0,
                        'CHB': 1.0 if v_chb else 0.0, 'AKI': 1.0 if v_aki else 0.0, 'UTI': 1.0 if v_uti else 0.0,
                        'CARDIOGENIC SHOCK': 1.0 if v_cardiogenic else 0.0, 'SHOCK': 1.0 if v_shock else 0.0, 'renal_risk_score': v_renal
                    }
                    ordered_values = [feature_dict[feat] for feat in features_17]
                    st.session_state['processed_features'] = scaler_17.transform(pd.DataFrame([ordered_values], columns=features_17))
                    st.session_state['run_id'] = time.time()

    # --- DYNAMIC RESULTS HERO SEQUENCE ---
    if 'processed_features' in st.session_state:
        anim_id = str(st.session_state.get('run_id', time.time())).replace('.', '') + "_" + selected_model_name.replace(" ", "")
        features_array = st.session_state['processed_features']
        prob = active_model.predict_proba(features_array)[0][1]
        
        # Render the unified HTML Results Component
        st.markdown(get_results_html(prob, active_threshold, anim_id), unsafe_allow_html=True)

# TAB 2: ANALYTICS
with tab2:
    with st.container(border=True):
        st.subheader(f"Algorithm Deep-Dive: {selected_model_name}")
        report_text = ""
        if os.path.exists('outputs/classification_reports.txt'):
            with open('outputs/classification_reports.txt', 'r') as f:
                for sec in f.read().split('=== '):
                    if sec.startswith(selected_model_name):
                        report_text = sec
                        break
        if report_text:
            lines = report_text.split('\n')[1:]
            for i, line in enumerate(lines):
                if line.strip(): st.markdown(f"<span class='report-line' style='animation-delay: {i*50}ms;'>{line}</span>", unsafe_allow_html=True)
                else: st.markdown("<br>", unsafe_allow_html=True)
        
    st.subheader("Global Performance Comparisons")
    with st.expander("Feature Interpretability (Top 17 Selected)", expanded=True):
        if os.path.exists("outputs/feature_importance.png"): st.image("outputs/feature_importance.png", use_column_width=True)
    with st.expander("Confusion Matrices (All Models)"):
         if os.path.exists("outputs/confusion_matrix_all.png"): st.image("outputs/confusion_matrix_all.png", use_column_width=True)
    with st.expander("ROC & Aggregate Metrics"):
        c1, c2 = st.columns(2)
        with c1:
            if os.path.exists("outputs/model_comparison.png"): st.image("outputs/model_comparison.png", use_column_width=True)
        with c2:
            if os.path.exists("outputs/roc_curve_comparison.png"): st.image("outputs/roc_curve_comparison.png", use_column_width=True)
st.markdown("</div>", unsafe_allow_html=True)
