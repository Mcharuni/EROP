import pandas as pd

# 1. Admission
df = pd.read_csv('admission_data_cleaned.csv')
print("=== ADMISSION ===")
print(f"GENDER: {df['GENDER'].unique()}")
print(f"RURAL: {df['RURAL'].unique()}")
print(f"TYPE OF ADMISSION: {df['TYPE OF ADMISSION-EMERGENCY/OPD'].unique()}")
print(f"AGE range: {df['AGE'].min()} - {df['AGE'].max()}")
print(f"OUTCOME: {df['OUTCOME'].unique()}")
print(f"month year sample: {df['month year'].unique()[:10]}")
print(f"SMOKING: {df['SMOKING '].unique()}" if 'SMOKING ' in df.columns else f"SMOKING: {df.get('SMOKING', pd.Series(['N/A'])).unique()}")

# Diagnosis columns present
diag_like = [c for c in df.columns if df[c].dtype != 'object' and df[c].nunique() <= 3 and c not in ['AGE','SNO']]
print(f"\nBinary/diagnosis-like columns ({len(diag_like)}):")
for c in diag_like:
    print(f"  {c}: {sorted(df[c].unique())}")

print("\n=== PUBLIC HEALTH ===")
df2 = pd.read_csv('public_health_surveillance_dataset_cleaned.csv')
print(f"Gender: {df2['Gender'].unique()}")
print(f"Location: {df2['Location'].unique()}")
print(f"Age range: {df2['Age'].min()} - {df2['Age'].max()}")
print(f"Disease_Severity: {df2['Disease_Severity'].unique()}")
print(f"Infection_Risk_Level: {df2['Infection_Risk_Level'].unique()}")
print(f"Chronic_Conditions: {df2['Chronic_Conditions'].unique()}")
print(f"Hospitalization_Requirement: {df2['Hospitalization_Requirement'].unique()}")
print(f"Vaccination_Status: {df2['Vaccination_Status'].unique()}")

print("\n=== ER WAIT TIME ===")
df3 = pd.read_csv('ER_Wait_Time_Dataset_cleaned.csv')
print(f"Region: {df3['Region'].unique()}")
print(f"Urgency Level: {df3['Urgency Level'].unique()}")
print(f"Season: {df3['Season'].unique()}")
print(f"Day of Week: {df3['Day of Week'].unique()}")
print(f"Patient Outcome: {df3['Patient Outcome'].unique()}")

print("\n=== EHR ===")
df4 = pd.read_csv('EHR_cleaned.csv')
print(f"gender: {df4['gender'].unique()}")
print(f"age range: {df4['age'].min()} - {df4['age'].max()}")
print(f"unittype: {df4['unittype'].unique()}")
print(f"hospitaldischargestatus: {df4['hospitaldischargestatus'].unique()}")
print(f"unitadmitsource: {df4['unitadmitsource'].unique()}")
print(f"hospitaladmitsource: {df4['hospitaladmitsource'].unique()}")

print("\n=== SYNTHETIC VITALS ===")
df5 = pd.read_csv('Synthetic_patient-HealthCare-Monitoring_dataset_cleaned.csv')
print(f"Predicted Disease: {df5['Predicted Disease'].unique()}")
print(f"Fall Detection: {df5['Fall Detection'].unique()}")
print(f"HR Alert: {df5['Heart Rate Alert'].unique()}")
print(f"SpO2 Alert: {df5['SpO2 Level Alert'].unique()}")
