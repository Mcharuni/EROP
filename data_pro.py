import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix, f1_score, roc_auc_score, roc_curve, classification_report, accuracy_score, precision_recall_curve, auc
import xgboost as xgb
import warnings
warnings.filterwarnings('ignore')

# Create outputs directory
os.makedirs("outputs", exist_ok=True)

# ---------------------------------------------------------
# PHASE 1: DATA CLEANING
# ---------------------------------------------------------
print("Loading primary dataset...")
adm_df = pd.read_csv("admission_data_cleaned.csv")

# Option A: Drop 'DAMA' rows for clean binary classification
adm_df = adm_df[adm_df['OUTCOME'].astype(str).str.upper() != 'DAMA'].copy()

print("Phase 1: Data Cleaning...")
for col in ['BNP', 'GLUCOSE', 'UREA', 'CREATININE', 'EF']:
    if col in adm_df.columns:
        adm_df[col] = pd.to_numeric(adm_df[col].replace(["EMPTY", "Unknown"], np.nan), errors='coerce')

numeric_fill_cols = ['HB', 'TLC', 'PLATELETS', 'GLUCOSE', 'UREA', 'CREATININE', 'BNP', 'EF']
for col in numeric_fill_cols:
    if col in adm_df.columns:
        adm_df[col] = pd.to_numeric(adm_df[col], errors='coerce')
        adm_df[col] = adm_df[col].fillna(adm_df[col].median())

cat_fill_cols = ['GENDER', 'RURAL', 'TYPE OF ADMISSION-EMERGENCY/OPD']
for col in cat_fill_cols:
    if col in adm_df.columns:
        adm_df[col] = adm_df[col].fillna(adm_df[col].mode()[0])

diag_cols = [
    'STEMI', 'ACS', 'HEART FAILURE', 'HFREF', 'HFNEF', 'VALVULAR', 'CHB', 'SSS', 'AKI', 'CVA INFRACT', 
    'CVA BLEED', 'AF', 'VT', 'PSVT', 'CONGENITAL', 'UTI', 'NEURO CARDIOGENIC SYNCOPE', 'ORTHOSTATIC', 
    'INFECTIVE ENDOCARDITIS', 'DVT', 'CARDIOGENIC SHOCK', 'SHOCK', 'PULMONARY EMBOLISM', 'CHEST INFECTION', 
    'DM', 'HTN', 'CAD', 'PRIOR CMP', 'CKD', 'SEVERE ANAEMIA', 'ANAEMIA', 'STABLE ANGINA'
]
for col in diag_cols:
    if col in adm_df.columns:
        adm_df[col] = pd.to_numeric(adm_df[col], errors='coerce').fillna(0)

adm_df.drop_duplicates(inplace=True)

def cap_outliers(df, cols):
    for col in cols:
        if col in df.columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR
            df[col] = np.clip(df[col], lower, upper)
    return df

outlier_cols = ['HB', 'TLC', 'PLATELETS', 'GLUCOSE', 'UREA', 'CREATININE', 'BNP', 'DURATION OF STAY', 'duration of intensive unit stay']
adm_df = cap_outliers(adm_df, outlier_cols)

# ---------------------------------------------------------
# PHASE 2.1: FEATURE ENGINEERING (BASE DATASET)
# ---------------------------------------------------------
print("Phase 2: Feature Engineering...")

adm_df['D.O.A'] = pd.to_datetime(adm_df['D.O.A'], errors='coerce', format='mixed')
adm_df['D.O.D'] = pd.to_datetime(adm_df['D.O.D'], errors='coerce', format='mixed')

adm_df['length_of_stay'] = (adm_df['D.O.D'] - adm_df['D.O.A']).dt.days
adm_df['length_of_stay'] = adm_df['length_of_stay'].fillna(adm_df['DURATION OF STAY'])

if 'duration of intensive unit stay' in adm_df.columns:
    adm_df['icu_ratio'] = adm_df['duration of intensive unit stay'] / (adm_df['length_of_stay'] + 1e-5)

comorb = ['DM', 'HTN', 'CAD', 'PRIOR CMP', 'CKD']
adm_df['comorbidity_count'] = adm_df[[c for c in comorb if c in adm_df.columns]].sum(axis=1)

cardiac_cols = ['CAD', 'STEMI', 'ACS', 'HEART FAILURE', 'RAISED CARDIAC ENZYMES']
adm_df['cardiac_risk_score'] = adm_df[[c for c in cardiac_cols if c in adm_df.columns]].sum(axis=1)

urea_norm = adm_df.get('UREA', 0) / 40.0
creat_norm = adm_df.get('CREATININE', 0) / 1.2
ckd_flag = adm_df.get('CKD', 0)
adm_df['renal_risk_score'] = urea_norm + creat_norm + (ckd_flag * 2)

adm_df['num_diagnoses'] = adm_df[[c for c in diag_cols if c in adm_df.columns]].sum(axis=1)

if 'SEVERE ANAEMIA' in adm_df.columns and 'ANAEMIA' in adm_df.columns:
    adm_df['anemia_severity'] = adm_df['SEVERE ANAEMIA'] * 2 + adm_df['ANAEMIA']

# Create mapping keys for merges
bins = [0, 20, 40, 60, 80, 150]
labels = ['0-20', '21-40', '41-60', '61-80', '80+']
adm_df['age_group'] = pd.cut(adm_df['AGE'], bins=bins, labels=labels, right=False)
gender_map = {'M': 'Male', 'F': 'Female'}
adm_df['gender_mapped'] = adm_df['GENDER'].map(gender_map)
location_map = {'U': 'Urban', 'R': 'Rural'}
adm_df['location_mapped'] = adm_df['RURAL'].map(location_map)
adm_df['month_num'] = pd.to_datetime(adm_df['month year'], format='%b-%y', errors='coerce').dt.month

def map_disease(row):
    if row.get('CAD',0)==1 or row.get('STEMI',0)==1 or row.get('ACS',0)==1 or row.get('HEART FAILURE',0)==1:
        return 'Heart Disease'
    elif row.get('HTN',0)==1:
        return 'Hypertension'
    elif row.get('DM',0)==1:
        return 'Diabetes Mellitus'
    else:
        return 'Healthy'
adm_df['predicted_disease_mapped'] = adm_df.apply(map_disease, axis=1)

dept_map = {'E': 'Emergency Department (ED)', 'O': 'General'}
adm_df['dept_mapped'] = adm_df['TYPE OF ADMISSION-EMERGENCY/OPD'].map(dept_map)

# ---------------------------------------------------------
# PHASE 2.2: SUPPLEMENTARY MERGES (AGGREGATES)
# ---------------------------------------------------------
print("Merging 6 supplementary datasets...")

try:
    ph_df = pd.read_csv("public_health_surveillance_dataset_cleaned.csv")
    ph_df['age_group'] = pd.cut(ph_df['Age'], bins=bins, labels=labels, right=False)
    ph_df['icu_req'] = (ph_df['Hospitalization_Requirement'] == 'Requires ICU').astype(int)
    for col in ['Transmission_Rate', 'Mortality_Rate', 'Hospitalization_Rate']:
        ph_df[col] = pd.to_numeric(ph_df[col], errors='coerce')
    ph_agg = ph_df.groupby(['age_group', 'Gender', 'Location'], observed=False).agg(
        avg_transmission_rate=('Transmission_Rate', 'mean'),
        avg_mortality_rate=('Mortality_Rate', 'mean'),
        avg_hospitalization_rate=('Hospitalization_Rate', 'mean'),
        pct_requires_icu=('icu_req', 'mean')
    ).reset_index()
    adm_df = adm_df.merge(ph_agg, left_on=['age_group', 'gender_mapped', 'location_mapped'],
                          right_on=['age_group', 'Gender', 'Location'], how='left')
    adm_df.drop(columns=['Gender', 'Location'], inplace=True, errors='ignore')
except Exception as e: print(f"Public Health merge failed: {e}")

try:
    er_df = pd.read_csv("ER_Wait_Time_Dataset_cleaned.csv")
    er_df['is_admitted'] = (er_df['Patient Outcome'] == 'Admitted').astype(int)
    er_agg = er_df.groupby('Region', observed=False).agg(
        avg_er_wait_by_region=('Total Wait Time (min)', 'mean'),
        avg_nurse_ratio_by_region=('Nurse-to-Patient Ratio', 'mean'),
        avg_specialist_avail_by_region=('Specialist Availability', 'mean'),
        pct_admitted_by_region=('is_admitted', 'mean')
    ).reset_index()
    adm_df = adm_df.merge(er_agg, left_on='location_mapped', right_on='Region', how='left')
    adm_df.drop(columns=['Region'], inplace=True, errors='ignore')
except Exception as e: print(f"ER Wait Time merge failed: {e}")

try:
    ehr_df = pd.read_csv("EHR_cleaned.csv")
    ehr_df['age'] = pd.to_numeric(ehr_df['age'], errors='coerce')
    ehr_df['age_group'] = pd.cut(ehr_df['age'], bins=bins, labels=labels, right=False)
    ehr_df['is_expired'] = (ehr_df['hospitaldischargestatus'] == 'Expired').astype(int)
    ehr_df['is_emergency'] = (ehr_df['unitadmitsource'] == 'Emergency Department').astype(int)
    ehr_agg = ehr_df.groupby(['age_group', 'gender'], observed=False).agg(
        ehr_mortality_rate=('is_expired', 'mean'),
        avg_ehr_icu_types=('unittype', 'nunique'),
        pct_emergency_admit=('is_emergency', 'mean')
    ).reset_index()
    adm_df = adm_df.merge(ehr_agg, left_on=['age_group', 'gender_mapped'],
                          right_on=['age_group', 'gender'], how='left')
    adm_df.drop(columns=['gender'], inplace=True, errors='ignore')
except Exception as e: print(f"EHR merge failed: {e}")

try:
    vit_df = pd.read_csv("Synthetic_patient-HealthCare-Monitoring_dataset_cleaned.csv")
    vit_df['is_abnormal_hr'] = (vit_df['Heart Rate Alert'] == 'ABNORMAL').astype(int)
    vit_df['is_fall'] = (vit_df['Fall Detection'] == 'Yes').astype(int)
    vit_agg = vit_df.groupby('Predicted Disease', observed=False).agg(
        avg_hr_for_disease=('Heart Rate (bpm)', 'mean'),
        avg_spo2_for_disease=('SpO2 Level (%)', 'mean'),
        avg_systolic_bp_for_disease=('Systolic Blood Pressure (mmHg)', 'mean'),
        pct_abnormal_hr_for_disease=('is_abnormal_hr', 'mean'),
        pct_fall_for_disease=('is_fall', 'mean')
    ).reset_index()
    adm_df = adm_df.merge(vit_agg, left_on='predicted_disease_mapped', right_on='Predicted Disease', how='left')
    adm_df.drop(columns=['Predicted Disease'], inplace=True, errors='ignore')
except Exception as e: print(f"Synthetic Vitals merge failed: {e}")

try:
    bed_df = pd.read_csv("Hospital_Bed_Capacity_cleaned.csv")
    bed_df['Department'] = bed_df['Department'].str.strip()
    ed_row = bed_df[bed_df['Department'] == 'Emergency Department (ED)']
    gen_rows = bed_df[bed_df['Department'].isin(['Cardiology', 'Internal Medicine', 'General Surgery'])]
    
    bed_lookup = {}
    if not ed_row.empty:
        bed_lookup['Emergency Department (ED)'] = {
            'dept_bed_occupancy_rate': 1 - (ed_row['Free_Beds'].values[0] / max(1, ed_row['Total_Beds'].values[0])),
            'dept_icu_occupancy_rate': 1 - (ed_row['Free_ICU_Beds'].values[0] / max(1, ed_row['Total_ICU_Beds'].values[0])),
            'dept_staff_per_bed': ed_row['Staff_On_Duty'].values[0] / max(1, ed_row['Total_Amount_of_Beds'].values[0])
        }
    if not gen_rows.empty:
        bed_lookup['General'] = {
            'dept_bed_occupancy_rate': 1 - (gen_rows['Free_Beds'].sum() / max(1, gen_rows['Total_Beds'].sum())),
            'dept_icu_occupancy_rate': 1 - (gen_rows['Free_ICU_Beds'].sum() / max(1, gen_rows['Total_ICU_Beds'].sum())),
            'dept_staff_per_bed': gen_rows['Staff_On_Duty'].sum() / max(1, gen_rows['Total_Amount_of_Beds'].sum())
        }
    
    bed_agg = pd.DataFrame.from_dict(bed_lookup, orient='index').reset_index()
    bed_agg.rename(columns={'index': 'dept_mapped'}, inplace=True)
    adm_df = adm_df.merge(bed_agg, on='dept_mapped', how='left')
except Exception as e: print(f"Hospital Bed Capacity merge failed: {e}")

try:
    weather_df = pd.read_csv("weather_dataset_cleaned.csv")
    weather_df['month'] = pd.to_datetime(weather_df['Formatted Date'], errors='coerce', utc=True).dt.month
    weather_df['is_rain'] = (weather_df['Precip Type'] == 'rain').astype(int)
    weather_agg = weather_df.groupby('month', observed=False).agg(
        avg_temp_month=('Temperature (C)', 'mean'),
        avg_humidity_month=('Humidity', 'mean'),
        avg_wind_speed_month=('Wind Speed (km/h)', 'mean'),
        avg_pressure_month=('Pressure (millibars)', 'mean'),
        pct_rain_month=('is_rain', 'mean')
    ).reset_index()
    adm_df = adm_df.merge(weather_agg, left_on='month_num', right_on='month', how='left')
    adm_df.drop(columns=['month'], inplace=True, errors='ignore')
except Exception as e: print(f"Weather merge failed: {e}")

# ---------------------------------------------------------
# PHASE 2.3: FINAL CLEANUP & ENCODING
# ---------------------------------------------------------
drop_cols = ['SNO', 'MRD No.', 'D.O.A', 'D.O.D', 'month year', 'DURATION OF STAY', 
             'age_group', 'gender_mapped', 'location_mapped', 'month_num', 
             'predicted_disease_mapped', 'dept_mapped']
adm_df.drop(columns=[c for c in drop_cols if c in adm_df.columns], inplace=True)

for col in adm_df.columns:
    if adm_df[col].dtype in ['float64', 'int64'] and adm_df[col].isnull().any():
        adm_df[col] = adm_df[col].fillna(adm_df[col].median())

le = LabelEncoder()
if 'GENDER' in adm_df.columns: adm_df['GENDER'] = le.fit_transform(adm_df['GENDER'].astype(str))
if 'RURAL' in adm_df.columns: adm_df['RURAL'] = le.fit_transform(adm_df['RURAL'].astype(str))
if 'TYPE OF ADMISSION-EMERGENCY/OPD' in adm_df.columns: adm_df['TYPE OF ADMISSION-EMERGENCY/OPD'] = le.fit_transform(adm_df['TYPE OF ADMISSION-EMERGENCY/OPD'].astype(str))

if 'OUTCOME' in adm_df.columns: 
    adm_df['OUTCOME'] = adm_df['OUTCOME'].astype(str).str.upper()
    adm_df['OUTCOME'] = adm_df['OUTCOME'].apply(lambda x: 0 if 'DISCHARGE' in x else 1)

adm_df.replace([np.inf, -np.inf], np.nan, inplace=True)
adm_df.fillna(0, inplace=True)

X = adm_df.drop(columns=['OUTCOME'])
y = adm_df['OUTCOME']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ---------------------------------------------------------
# PHASE 3: MODEL TRAINING (LOGREG, RF, XGBOOST)
# ---------------------------------------------------------
print("Phase 3: Model Training...")

# 3.1 Logistic Regression
print("Training Logistic Regression...")
log_reg = LogisticRegression(max_iter=1000, class_weight='balanced', solver='lbfgs', random_state=42)
log_reg.fit(X_train_scaled, y_train)

# 3.2 Random Forest
print("Training Random Forest...")
rf_model = RandomForestClassifier(n_estimators=300, max_depth=15, min_samples_split=5, 
                                  min_samples_leaf=2, class_weight='balanced', random_state=42, n_jobs=-1)
# Tree models don't strictly need scaled data, but it doesn't hurt. We use scaled for consistency.
rf_model.fit(X_train_scaled, y_train)

# 3.3 XGBoost
print("Training XGBoost...")
ratio = float(y_train.value_counts()[0] / y_train.value_counts()[1])
xgb_model = xgb.XGBClassifier(
    n_estimators=500, max_depth=6, learning_rate=0.05,
    subsample=0.8, colsample_bytree=0.8, reg_alpha=0.1, reg_lambda=1.0,
    scale_pos_weight=ratio, eval_metric='logloss', random_state=42
)

# Optional: GridSearchCV for XGBoost (fast run)
print("Running GridSearch for XGBoost...")
cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
param_grid_xgb = {
    'max_depth': [4, 6],
    'learning_rate': [0.05, 0.1],
    'n_estimators': [300, 500]
}
grid_search = GridSearchCV(xgb_model, param_grid_xgb, cv=cv, scoring='f1', n_jobs=-1, verbose=1)
grid_search.fit(X_train_scaled, y_train)
best_xgb_model = grid_search.best_estimator_

# Store models
models = {
    'Logistic Regression': log_reg,
    'Random Forest': rf_model,
    'XGBoost': best_xgb_model
}

# ---------------------------------------------------------
# PHASE 4: EVALUATION & VISUALIZATION
# ---------------------------------------------------------
print("Phase 4: Evaluation & Visualization...")

results = {}
predictions = {}

with open('outputs/classification_reports.txt', 'w') as f:
    for name, model in models.items():
        y_pred = model.predict(X_test_scaled)
        y_prob = model.predict_proba(X_test_scaled)[:, 1]
        predictions[name] = {'pred': y_pred, 'prob': y_prob}
        
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        auc_score = roc_auc_score(y_test, y_prob)
        results[name] = {'Accuracy': acc, 'F1 Score': f1, 'AUC': auc_score}
        
        report = classification_report(y_test, y_pred)
        f.write(f"=== {name} ===\n")
        f.write(f"Accuracy: {acc:.4f} | F1: {f1:.4f} | AUC: {auc_score:.4f}\n")
        f.write(f"{report}\n\n")

# A. Confusion Matrix (side-by-side)
fig, axes = plt.subplots(1, 3, figsize=(18, 5))
for i, (name, model) in enumerate(models.items()):
    cm = confusion_matrix(y_test, predictions[name]['pred'])
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[i],
                xticklabels=['DISCHARGE', 'EXPIRED'], yticklabels=['DISCHARGE', 'EXPIRED'])
    axes[i].set_title(f'{name}\nAcc: {results[name]["Accuracy"]:.2f}')
    axes[i].set_xlabel('Predicted')
    axes[i].set_ylabel('Actual')
plt.tight_layout()
plt.savefig('outputs/confusion_matrix_all.png')
plt.close()

# B. ROC Curve (all overlaid)
plt.figure(figsize=(8, 6))
for name in models.keys():
    fpr, tpr, _ = roc_curve(y_test, predictions[name]['prob'])
    plt.plot(fpr, tpr, label=f'{name} (AUC = {results[name]["AUC"]:.2f})', linewidth=2)
plt.plot([0, 1], [0, 1], 'k--', label='Random Guess')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve Comparison')
plt.legend(loc='lower right')
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig('outputs/roc_curve_comparison.png')
plt.close()

# C. Precision-Recall Curve
plt.figure(figsize=(8, 6))
for name in models.keys():
    prec, rec, _ = precision_recall_curve(y_test, predictions[name]['prob'])
    pr_auc = auc(rec, prec)
    plt.plot(rec, prec, label=f'{name} (PR-AUC = {pr_auc:.2f})', linewidth=2)
plt.xlabel('Recall')
plt.ylabel('Precision')
plt.title('Precision-Recall Curve Comparison')
plt.legend(loc='upper right')
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig('outputs/pr_curve_comparison.png')
plt.close()

# D. Feature Importance (RF & XGBoost)
fig, axes = plt.subplots(1, 2, figsize=(16, 8))
# RF
rf_importances = pd.Series(rf_model.feature_importances_, index=X.columns).sort_values(ascending=False).head(20)
sns.barplot(x=rf_importances.values, y=rf_importances.index, ax=axes[0], palette='viridis')
axes[0].set_title('Random Forest - Top 20 Features')
# XGB
xgb_importances = pd.Series(best_xgb_model.feature_importances_, index=X.columns).sort_values(ascending=False).head(20)
sns.barplot(x=xgb_importances.values, y=xgb_importances.index, ax=axes[1], palette='viridis')
axes[1].set_title('XGBoost - Top 20 Features')
plt.tight_layout()
plt.savefig('outputs/feature_importance.png')
plt.close()

# F. Model Comparison Bar Chart
res_df = pd.DataFrame(results).T
res_df.plot(kind='bar', figsize=(10, 6), colormap='Set2')
plt.title('Model Performance Comparison')
plt.ylabel('Score')
plt.ylim(0, 1)
plt.xticks(rotation=0)
plt.legend(loc='lower right')
plt.grid(axis='y', alpha=0.3)
plt.tight_layout()
plt.savefig('outputs/model_comparison.png')
plt.close()

print(f"Process completed successfully!")
print("Outputs generated:")
print(" - outputs/classification_reports.txt")
print(" - outputs/confusion_matrix_all.png")
print(" - outputs/roc_curve_comparison.png")
print(" - outputs/pr_curve_comparison.png")
print(" - outputs/feature_importance.png")
print(" - outputs/model_comparison.png")