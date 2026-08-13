import pandas as pd
import os

datasets = [
    "public_health_surveillance_dataset_cleaned.csv",
    "EHR_cleaned.csv",
    "ER_Wait_Time_Dataset_cleaned.csv",
    "Hospital_Bed_Capacity_cleaned.csv",
    "Synthetic_patient-HealthCare-Monitoring_dataset_cleaned.csv",
    "admission_data_cleaned.csv",
    "weather_dataset_cleaned.csv",
]

for fname in datasets:
    if os.path.exists(fname):
        print(f"\n{'='*60}")
        print(f"DATASET: {fname}")
        print(f"{'='*60}")
        df = pd.read_csv(fname)
        print(f"Shape: {df.shape}")
        print(f"\nColumns: {list(df.columns)}")
        print(f"\nDtypes:\n{df.dtypes}")
        print(f"\nNull counts:\n{df.isnull().sum()}")
        print(f"\nDuplicates: {df.duplicated().sum()}")
        print(f"\nSample values (first 3 rows):")
        print(df.head(3).to_string())
        print(f"\nUnique counts per column:")
        for col in df.columns:
            print(f"  {col}: {df[col].nunique()} unique values", end="")
            if df[col].dtype == 'object':
                vals = df[col].unique()[:5]
                print(f"  -> samples: {list(vals)}", end="")
            print()
    else:
        print(f"\nFILE NOT FOUND: {fname}")
