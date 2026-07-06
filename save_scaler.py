import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectFromModel
import xgboost as xgb
import joblib
import warnings
warnings.filterwarnings('ignore')

print("Loading dataset...")
adm_df = pd.read_csv('outputs/final_merged_dataset.csv')
X = adm_df.drop(columns=['OUTCOME'])
y = adm_df['OUTCOME']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print("Fitting Scaler...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)

print("Fitting Selector...")
selector = SelectFromModel(xgb.XGBClassifier(random_state=42, n_estimators=100), max_features=40)
selector.fit(X_train_scaled, y_train)

joblib.dump(scaler, 'outputs/scaler.pkl')
joblib.dump(selector, 'outputs/selector.pkl')
print("Successfully saved scaler.pkl and selector.pkl!")
