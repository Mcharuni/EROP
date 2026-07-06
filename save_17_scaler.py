import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import warnings
warnings.filterwarnings('ignore')

print("Loading dataset...")
adm_df = pd.read_csv('outputs/final_merged_dataset.csv')

# The 17 selected features
features_17 = joblib.load('outputs/selected_features.pkl')

X = adm_df[features_17]
y = adm_df['OUTCOME']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print("Fitting 17-feature Scaler...")
scaler_17 = StandardScaler()
scaler_17.fit(X_train)

joblib.dump(scaler_17, 'outputs/scaler_17.pkl')
print("Successfully saved scaler_17.pkl!")
