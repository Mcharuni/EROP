# 🏥 EROP — Emergency Room Operations Prediction

> **Goal**: Build a high-accuracy classification model to predict **hospital admission outcomes** by integrating multiple healthcare datasets through robust data cleaning, preprocessing, and progressive model training (Logistic Regression → Random Forest → XGBoost).

---

## 🚀 Project Progress Tracker

✅ **Phase 1: Data Cleaning** — Fully Implemented. Missing values imputed, outliers capped, "DAMA" ambiguous outcomes removed for binary classification.
✅ **Phase 2: Feature Engineering & Merging** — Fully Implemented. Derived clinical scores, and **merged all 7 datasets** based on demographics, region, disease diagnosis, and admission month.
✅ **Phase 3: Model Training** — Fully Implemented. Trained Logistic Regression, Random Forest, and XGBoost (with GridSearchCV tuning).
✅ **Phase 4: Evaluation & Visualization** — Fully Implemented. Generated Confusion Matrices, ROC Curves, PR Curves, Feature Importance charts, and Model Comparison charts for all 3 models.
⏳ **Next Steps** — Everything mentioned in this README is complete! We can now analyze the final results or perform further advanced feature selection if needed.

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Dataset Inventory](#2-dataset-inventory)
3. [Environment Setup](#3-environment-setup)
4. [Phase 1 — Data Cleaning](#4-phase-1--data-cleaning)
5. [Phase 2 — Data Preprocessing (Feature Engineering)](#5-phase-2--data-preprocessing-feature-engineering)
6. [Phase 3 — Model Training](#6-phase-3--model-training)
7. [Phase 4 — Evaluation & Visualization](#7-phase-4--evaluation--visualization)
8. [Optimization Strategies](#8-optimization-strategies)
9. [Project Structure](#9-project-structure)
10. [Key Decisions & Rationale](#10-key-decisions--rationale)

---

## 1. Project Overview

### What Are We Doing?
We have **7 cleaned healthcare datasets** covering patient demographics, ER wait times, hospital capacity, vitals monitoring, admission records, public health surveillance, and weather data. Our task is to:

1. **Merge & clean** these datasets into a unified, model-ready dataframe.
2. **Engineer features** that give the model maximum predictive signal.
3. **Train progressively better models** — starting with Logistic Regression (baseline) → Random Forest → XGBoost.
4. **Evaluate rigorously** with confusion matrices, F1 scores, AUC-ROC curves, and classification reports.

### Why This Approach?
- **Logistic Regression first** → establishes a **minimum accuracy baseline**. If even a simple linear model achieves decent accuracy, we know the features carry strong signal.
- **Random Forest second** → captures **non-linear relationships** and **feature interactions** that Logistic Regression misses.
- **XGBoost last** → applies **gradient boosting with regularization** for maximum performance, handles imbalanced classes well, and is the gold standard for tabular data.

### Target Variable
The primary prediction target is **`OUTCOME`** from the `admission_data_cleaned.csv` — whether a patient is **DISCHARGED** or **EXPIRED** (binary classification).

> **Why this target?** It is the most clinically meaningful binary outcome across all datasets, and the admission dataset has the richest clinical features (lab values, comorbidities, diagnoses).

---

## 2. Dataset Inventory

| # | File | Rows | Columns | Description |
|---|------|------|---------|-------------|
| 1 | `admission_data_cleaned.csv` | 5,000 | 56 | **Primary dataset.** Patient admissions with demographics (age, gender), admission type, lab values (HB, TLC, platelets, glucose, urea, creatinine, BNP), comorbidities (DM, HTN, CAD, CKD), diagnoses (STEMI, ACS, heart failure, etc.), and **OUTCOME** (target). |
| 2 | `public_health_surveillance_dataset_cleaned.csv` | 5,000 | 35 | Population-level surveillance: infection risk, disease severity, vaccination status, hospitalization rates, outbreak status, transmission rates. |
| 3 | `ER_Wait_Time_Dataset_cleaned.csv` | 5,000 | 19 | ER visit-level data: wait times (registration, triage, medical professional), urgency level, nurse ratios, patient satisfaction, outcomes. |
| 4 | `EHR_cleaned.csv` | 1,447 | 29 | Electronic Health Records: detailed admission/discharge times, unit types (ICU, Med-Surg), Apache diagnoses, admission weight, discharge status. |
| 5 | `Synthetic_patient-HealthCare-Monitoring_dataset_cleaned.csv` | 5,000 | 13 | Real-time vitals: heart rate, SpO2, blood pressure (systolic/diastolic), body temperature, fall detection, predicted disease, alert flags. |
| 6 | `Hospital_Bed_Capacity_cleaned.csv` | 25 | 7 | Hospital infrastructure: department-wise total beds, free beds, ICU beds, staff on duty. (Small reference table, not for direct modeling.) |
| 7 | `weather_dataset_cleaned.csv` | 5,000 | 12 | Environmental data: temperature, humidity, wind speed, visibility, pressure, precipitation type, daily summary. |

### Dataset Relationships & Strategy

```
┌─────────────────────────────┐
│  admission_data (PRIMARY)   │  ← TARGET: OUTCOME (DISCHARGE / EXPIRED)
│  5,000 rows × 56 cols       │
│  Rich clinical features     │
└──────────┬──────────────────┘
           │
           │  The primary dataset is self-sufficient for modeling.
           │  Other datasets provide supplementary aggregate features.
           │
    ┌──────┴──────────────────────────────────────────┐
    │                                                  │
    ▼                                                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  public_health   │  │  ER_Wait_Time    │  │  Synthetic_vitals│
│  surveillance    │  │  Dataset         │  │  monitoring      │
│  (aggregate      │  │  (aggregate      │  │  (aggregate      │
│   stats)         │  │   stats)         │  │   stats)         │
└──────────────────┘  └──────────────────┘  └──────────────────┘
    │                      │                      │
    ▼                      ▼                      ▼
  Merge aggregate       Merge aggregate       Merge aggregate
  features by           features by           features by
  demographics          region/urgency        disease/vitals

┌──────────────────┐  ┌──────────────────┐
│  EHR_cleaned     │  │  weather_dataset │
│  (unit/ICU       │  │  (environmental  │
│   features)      │  │   context)       │
└──────────────────┘  └──────────────────┘

┌──────────────────┐
│  Hospital_Bed    │
│  Capacity        │
│  (reference      │
│   lookup table)  │
└──────────────────┘
```

> **Key Decision**: `admission_data_cleaned.csv` is our **primary modeling dataset**. It already has 56 rich features and the target variable. Other datasets will be used to **engineer aggregate supplementary features** (e.g., average ER wait time by urgency, average vitals by disease type) rather than row-level joins (since there are no common patient IDs across datasets).

---

## 3. Environment Setup

### Why a Virtual Environment?
Isolates project dependencies from the system Python. Ensures reproducibility.

### Steps

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate it
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install pandas numpy scikit-learn xgboost matplotlib seaborn

# 4. Verify installation
python -c "import pandas, numpy, sklearn, xgboost, matplotlib, seaborn; print('All libraries installed successfully!')"
```

### Required Libraries & Their Roles

| Library | Version | Purpose |
|---------|---------|---------|
| `pandas` | ≥2.0 | Data loading, cleaning, manipulation, merging |
| `numpy` | ≥1.24 | Numerical operations, array math |
| `scikit-learn` | ≥1.3 | ML models (LogReg, RF), preprocessing (scaling, encoding), evaluation metrics |
| `xgboost` | ≥2.0 | Gradient boosted trees (final high-performance model) |
| `matplotlib` | ≥3.7 | Base plotting library for charts |
| `seaborn` | ≥0.12 | Statistical visualizations (confusion matrix heatmaps, distribution plots) |

---

## 4. Phase 1 — Data Cleaning

> **Goal**: Transform raw data into a consistent, error-free state ready for feature engineering.

### 4.1 What Cleaning Steps & Why

#### Step 1: Load & Initial Inspection
```python
df.shape          # Check dimensions
df.info()         # Column types & non-null counts
df.head()         # Visual sanity check
df.describe()     # Statistical summary
```
**Why?** Before touching data, you must understand what you have. Data types tell you if numbers were loaded as strings (common issue). Null counts tell you the scale of missing data.

---

#### Step 2: Handle Missing Values

| Strategy | When to Use | Columns |
|----------|-------------|---------|
| **Drop rows** | <5% missing AND data is MCAR (Missing Completely At Random) | Rows with isolated nulls |
| **Fill with median** | Numerical columns with skewed distributions | `HB`, `TLC`, `PLATELETS`, `GLUCOSE`, `UREA`, `CREATININE` |
| **Fill with mode** | Categorical columns | `GENDER`, `RURAL`, `TYPE OF ADMISSION` |
| **Fill with "Unknown"** | Text columns where missingness is informative | `BNP`, `RAISED CARDIAC ENZYMES` |
| **Fill with 0** | Binary indicator columns (0/1 flags) | All diagnosis binary columns (e.g., `STEMI`, `ACS`, `HEART FAILURE`, etc.) |

**Why median over mean?** Medical lab values are often **right-skewed** (e.g., a few very high creatinine values in renal failure patients). Median is robust to these outliers. Mean would be pulled upward and misrepresent the typical patient.

**Why not drop all missing rows?** In healthcare data, missingness is often **informative** — e.g., BNP not being measured might indicate the doctor didn't suspect heart failure. Dropping these rows would lose this signal AND reduce sample size.

---

#### Step 3: Handle Duplicates
```python
df.duplicated().sum()       # Count exact duplicates
df.drop_duplicates(inplace=True)
```
**Why?** Duplicate records inflate model confidence and bias evaluation metrics. A model that "memorizes" duplicated patients will have artificially high accuracy.

---

#### Step 4: Fix Data Types

| Issue | Example | Fix |
|-------|---------|-----|
| Numbers stored as strings | `"EMPTY"` in `BNP`, `GLUCOSE` columns | Replace with `NaN`, then convert to float |
| Dates as strings | `"11-02-2017"` in `D.O.A` | Parse with `pd.to_datetime()` |
| Inconsistent categories | `"M"` vs `"Male"` | Standardize to one format |
| `EF` (Ejection Fraction) as mixed | Contains `"EMPTY"` strings | Convert to numeric, coerce errors |

**Why this matters?** Scikit-learn models expect **numeric inputs**. String values in numeric columns will cause crashes. Inconsistent categories will be treated as different classes.

---

#### Step 5: Handle the `"EMPTY"` and `"Unknown"` Sentinel Values
The `admission_data_cleaned.csv` uses `"EMPTY"` and `"Unknown"` as placeholders in numeric columns like `BNP`, `GLUCOSE`, `EF`:

```python
# Replace sentinel strings with NaN, then impute
for col in ['BNP', 'GLUCOSE', 'UREA', 'CREATININE', 'EF']:
    df[col] = pd.to_numeric(df[col], errors='coerce')  # "EMPTY" → NaN
```

**Why `errors='coerce'`?** This converts non-numeric values to `NaN` gracefully instead of crashing. We then impute these NaN values with median.

---

#### Step 6: Outlier Detection & Treatment

**Method**: IQR (Interquartile Range) capping for lab values.

```
Q1 = 25th percentile
Q3 = 75th percentile
IQR = Q3 - Q1
Lower bound = Q1 - 1.5 × IQR
Upper bound = Q3 + 1.5 × IQR
```

| Why Cap Instead of Remove? |
|----------------------------|
| In healthcare, extreme values are often **real** (e.g., very high glucose = diabetic crisis). Removing them loses critical signal. Capping to the IQR boundary preserves the "extreme" signal without letting a single outlier dominate model training. |

**Columns to apply IQR capping**: `HB`, `TLC`, `PLATELETS`, `GLUCOSE`, `UREA`, `CREATININE`, `BNP`, `DURATION OF STAY`, `duration of intensive unit stay`.

---

### 4.2 Cleaning the Other Datasets (Supplementary)

Each supplementary dataset gets the same core treatment:

| Dataset | Key Cleaning Actions |
|---------|---------------------|
| `public_health_surveillance` | Parse dates, ensure numeric for rates (Transmission_Rate, Mortality_Rate), standardize categorical levels |
| `ER_Wait_Time` | Parse visit dates, ensure all time columns are numeric (min), handle satisfaction scores |
| `EHR_cleaned` | Parse admission/discharge timestamps, calculate length of stay, handle "Unknown" in weight columns |
| `Synthetic_patient_vitals` | All mostly clean; ensure alert columns are consistently encoded |
| `weather_dataset` | Parse formatted dates, ensure numeric for weather metrics |
| `Hospital_Bed_Capacity` | Small table (25 rows) — use as-is for capacity lookups |

---

## 5. Phase 2 — Data Preprocessing (Feature Engineering)

> **Goal**: Transform cleaned data into model-ready numerical features with maximum predictive power.

### 5.1 Feature Engineering from Primary Dataset (`admission_data`)

#### A. Derive New Features

| New Feature | Formula | Why |
|-------------|---------|-----|
| `length_of_stay` | `D.O.D` − `D.O.A` (in days) | Direct measure of illness severity |
| `icu_ratio` | `duration of intensive unit stay` / `length_of_stay` | Higher ratio = more critical patient |
| `comorbidity_count` | Sum of `DM + HTN + CAD + PRIOR CMP + CKD` | Multi-morbid patients have worse outcomes |
| `num_diagnoses` | Sum of all 20+ binary diagnosis columns | Complexity indicator |
| `anemia_severity` | Combine `SEVERE ANAEMIA` and `ANAEMIA` into ordinal (0, 1, 2) | More granular than two separate binaries |
| `cardiac_risk_score` | `CAD + STEMI + ACS + HEART FAILURE + RAISED CARDIAC ENZYMES` | Composite cardiac risk indicator |
| `renal_risk_score` | Normalized function of `UREA`, `CREATININE`, `CKD` | Kidney function indicator |

#### B. Encode Categorical Variables

| Column | Type | Encoding Strategy | Why |
|--------|------|-------------------|-----|
| `GENDER` | Binary (M/F) | **Label Encoding** (0/1) | Only 2 categories; simple and effective |
| `RURAL` | Binary (R/U) | **Label Encoding** (0/1) | Only 2 categories |
| `TYPE OF ADMISSION` | Binary (E/O) | **Label Encoding** (0/1) | Emergency vs OPD |
| `OUTCOME` (target) | Binary | **Label Encoding** (DISCHARGE=0, EXPIRED=1) | Binary classification target |

**Why Label Encoding here?** All categoricals in the primary dataset are binary. Label encoding is simpler and doesn't increase dimensionality like One-Hot Encoding would.

#### C. Drop Irrelevant Columns

| Column(s) to Drop | Reason |
|--------------------|--------|
| `SNO`, `MRD No.` | Identifiers, no predictive value |
| `D.O.A`, `D.O.D` | Raw dates; replaced by `length_of_stay` |
| `month year` | Redundant with derived time features |

**Why drop IDs?** If left in, the model may "memorize" patient IDs rather than learning generalizable patterns. This is a form of **data leakage**.

---

### 5.2 Supplementary Feature Engineering (Aggregate Merges)

We successfully merge features from **all 7 datasets** by mapping shared demographic and categorical keys:

| Source Dataset | Merge Key Used | Merged Features Added |
|----------------|----------------|-----------------------|
| `public_health` | Age Group + Gender + Location | `avg_transmission_rate`, `avg_mortality_rate`, `avg_hospitalization_rate`, `pct_requires_icu` |
| `ER_Wait_Time` | Region (Urban/Rural) | `avg_er_wait_by_region`, `avg_nurse_ratio_by_region`, `avg_specialist_avail_by_region`, `pct_admitted_by_region` |
| `EHR` | Age Group + Gender | `ehr_mortality_rate`, `avg_ehr_icu_types`, `pct_emergency_admit` |
| `Synthetic_vitals`| Mapped Disease (CAD/HTN/DM) | `avg_hr_for_disease`, `avg_spo2_for_disease`, `avg_systolic_bp_for_disease`, `pct_abnormal_hr_for_disease`, `pct_fall_for_disease` |
| `Hospital_Bed` | Dept mapping (Emergency vs OPD) | `dept_bed_occupancy_rate`, `dept_icu_occupancy_rate`, `dept_staff_per_bed` |
| `weather_dataset` | Admission Month | `avg_temp_month`, `avg_humidity_month`, `avg_wind_speed_month`, `avg_pressure_month`, `pct_rain_month` |

**Why aggregate features?** These give the model **contextual knowledge** — e.g., "patients admitted during high-transmission-rate months had worse outcomes." This is a standard data science technique called **feature enrichment**. This expands our feature set to **81 columns**.

---

### 5.3 Feature Scaling

| Scaler | When to Use | Columns |
|--------|-------------|---------|
| **StandardScaler** (z-score) | Logistic Regression (assumes normalized features) | All continuous features for LogReg |
| **No scaling needed** | Random Forest, XGBoost (tree-based; scale-invariant) | All features for RF & XGB |

**Why StandardScaler for LogReg?** Logistic Regression uses gradient descent. Features on different scales (e.g., age 0–100 vs BNP 0–30,000) cause the optimizer to converge slowly or get stuck. Standardizing ensures all features contribute equally.

**Why no scaling for trees?** Decision trees split on thresholds, not magnitudes. Whether a feature is 0–1 or 0–10,000, the split logic is identical.

---

### 5.4 Handle Class Imbalance

The target (`OUTCOME`) is likely **imbalanced** — most patients are discharged, few expire.

| Technique | How It Works | When to Use |
|-----------|--------------|-------------|
| **SMOTE** (Synthetic Minority Oversampling) | Generates synthetic samples of the minority class by interpolating between existing minority samples | Training set only (never test set!) |
| **`class_weight='balanced'`** | Adjusts the loss function to penalize misclassifying minority class more heavily | Logistic Regression & Random Forest |
| **`scale_pos_weight`** | XGBoost equivalent of class_weight | XGBoost |

**Why SMOTE on training set only?** If we SMOTE the test set, we'd be evaluating on synthetic data, not real data. This would give misleadingly optimistic metrics.

---

### 5.5 Train-Test Split

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
```

| Parameter | Value | Why |
|-----------|-------|-----|
| `test_size` | 0.2 (20%) | Standard split; 80% for training, 20% for evaluation |
| `random_state` | 42 | Reproducibility — same split every run |
| `stratify=y` | Yes | Preserves the class ratio in both train and test sets. Critical for imbalanced data! |

---

## 6. Phase 3 — Model Training

### 6.1 Model 1: Logistic Regression (Baseline)

**Purpose**: Establish the **minimum accuracy floor**. If LogReg gets 75%, we know our features are solid. Our goal is then to beat this with ensemble models.

```python
from sklearn.linear_model import LogisticRegression

log_reg = LogisticRegression(
    max_iter=1000,          # Ensure convergence
    class_weight='balanced', # Handle imbalance
    solver='lbfgs',          # Efficient for small-medium datasets
    random_state=42
)
log_reg.fit(X_train_scaled, y_train)
```

| What LogReg Does | Limitations |
|------------------|-------------|
| Finds a linear decision boundary between classes | Cannot capture non-linear feature interactions |
| Outputs probabilities (useful for threshold tuning) | Assumes features are independent (often violated) |
| Fast to train, interpretable | Sensitive to multicollinearity |

---

### 6.2 Model 2: Random Forest

**Purpose**: Capture **non-linear relationships** and **feature interactions** that LogReg misses.

```python
from sklearn.ensemble import RandomForestClassifier

rf_model = RandomForestClassifier(
    n_estimators=300,         # Number of trees
    max_depth=15,             # Prevent overfitting
    min_samples_split=5,      # Minimum samples to split a node
    min_samples_leaf=2,       # Minimum samples in a leaf
    class_weight='balanced',  # Handle imbalance
    random_state=42,
    n_jobs=-1                 # Use all CPU cores
)
rf_model.fit(X_train, y_train)
```

| Hyperparameter | Value | Why |
|----------------|-------|-----|
| `n_estimators=300` | More trees = more stable predictions, diminishing returns after ~300 |
| `max_depth=15` | Prevents individual trees from memorizing training data |
| `min_samples_split=5` | Nodes must have ≥5 samples to split, prevents micro-splits on noise |
| `class_weight='balanced'` | Automatically adjusts weights inversely proportional to class frequencies |

---

### 6.3 Model 3: XGBoost

**Purpose**: **Maximum performance** through gradient boosting with built-in regularization.

```python
import xgboost as xgb

xgb_model = xgb.XGBClassifier(
    n_estimators=500,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_alpha=0.1,         # L1 regularization
    reg_lambda=1.0,         # L2 regularization
    scale_pos_weight=ratio, # ratio = count(negative) / count(positive)
    eval_metric='logloss',
    random_state=42,
    use_label_encoder=False
)
xgb_model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=50
)
```

| Hyperparameter | Value | Why |
|----------------|-------|-----|
| `learning_rate=0.05` | Smaller = slower learning but better generalization |
| `subsample=0.8` | Each tree sees 80% of data → reduces overfitting |
| `colsample_bytree=0.8` | Each tree sees 80% of features → reduces overfitting |
| `reg_alpha` + `reg_lambda` | L1 + L2 regularization → penalizes complex models |
| `scale_pos_weight` | Handles class imbalance by weighting minority class |

---

### 6.4 Hyperparameter Tuning (Cross-Validation)

```python
from sklearn.model_selection import GridSearchCV, StratifiedKFold

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

param_grid_xgb = {
    'max_depth': [4, 6, 8],
    'learning_rate': [0.01, 0.05, 0.1],
    'n_estimators': [300, 500, 700],
    'subsample': [0.7, 0.8, 0.9],
}

grid_search = GridSearchCV(
    xgb_model, param_grid_xgb, cv=cv,
    scoring='f1', n_jobs=-1, verbose=1
)
grid_search.fit(X_train, y_train)
best_model = grid_search.best_estimator_
```

**Why `StratifiedKFold`?** Each fold preserves the class distribution. With imbalanced data, regular K-Fold might create folds with zero minority samples.

**Why `scoring='f1'`?** Accuracy is misleading with imbalanced classes (predicting all "DISCHARGE" gives 90%+ accuracy but 0% recall for EXPIRED). F1 balances precision and recall.

---

## 7. Phase 4 — Evaluation & Visualization

### 7.1 Metrics to Compute

| Metric | What It Measures | Why It Matters |
|--------|------------------|----------------|
| **Accuracy** | Overall correct predictions / total | Baseline understanding, but misleading if imbalanced |
| **Precision** | TP / (TP + FP) | "Of patients we predicted would expire, how many actually did?" |
| **Recall (Sensitivity)** | TP / (TP + FN) | "Of patients who actually expired, how many did we catch?" — **critical in healthcare** |
| **F1 Score** | Harmonic mean of Precision & Recall | Single metric balancing both; our primary metric |
| **AUC-ROC** | Area under ROC curve | Model's ability to distinguish classes at all thresholds |
| **Specificity** | TN / (TN + FP) | "Of patients who survived, how many did we correctly identify?" |

### 7.2 Visualizations to Generate

#### A. Confusion Matrix (per model)
```
                Predicted
              DISCHARGE  EXPIRED
Actual  DISCHARGE   TN       FP
        EXPIRED     FN       TP
```
- **Heatmap** with raw counts AND percentages
- Side-by-side comparison across all 3 models

#### B. ROC Curve (all models overlaid)
- X-axis: False Positive Rate
- Y-axis: True Positive Rate
- Diagonal line = random guess (AUC = 0.5)
- All 3 models on same plot for direct comparison

#### C. Precision-Recall Curve
- More informative than ROC for imbalanced datasets
- Shows trade-off between precision and recall

#### D. Feature Importance (Random Forest & XGBoost)
- Bar chart of top 20 most important features
- Helps interpret which clinical factors drive predictions

#### E. Classification Report (per model)
```
              precision    recall  f1-score   support
   DISCHARGE       0.XX      0.XX      0.XX      XXXX
     EXPIRED       0.XX      0.XX      0.XX      XXXX
    accuracy                           0.XX      XXXX
   macro avg       0.XX      0.XX      0.XX      XXXX
weighted avg       0.XX      0.XX      0.XX      XXXX
```

#### F. Model Comparison Bar Chart
- Side-by-side bars: Accuracy, F1, AUC for each model
- Quick visual to see which model wins on which metric

---

## 8. Optimization Strategies

### 8.1 Strategies Already Built In

| Strategy | Where Applied | Effect |
|----------|---------------|--------|
| Class weight balancing | All 3 models | Prevents majority class bias |
| Feature engineering | Preprocessing | Creates stronger predictive signals |
| Outlier capping (IQR) | Data cleaning | Prevents extreme values from dominating |
| Stratified split | Train-test split | Ensures fair evaluation |
| Cross-validation | Hyperparameter tuning | More reliable than single validation split |
| Regularization (L1/L2) | XGBoost | Prevents overfitting |
| Early stopping | XGBoost | Stops training when validation loss plateaus |

### 8.2 If Accuracy Is Still Low

| Action | How |
|--------|-----|
| **Try different class imbalance techniques** | Switch from `class_weight` to `SMOTE` or `ADASYN` |
| **Add polynomial features** | `PolynomialFeatures(degree=2)` for top features |
| **Tune decision threshold** | Default is 0.5; find optimal threshold from PR curve |
| **Try different imputation** | Switch from median to `KNNImputer` or `IterativeImputer` |
| **Feature selection** | Use `SelectKBest`, `RFE`, or mutual information to remove noise features |

---

## 9. Project Structure

```
EROP_clean/
│
├── venv/                          # Virtual environment (dependencies)
│
├── data_pro.py                    # Main script: data cleaning + preprocessing + training
│
├── README.md                      # This file — project guide
│
├── admission_data_cleaned.csv     # PRIMARY dataset (5,000 rows × 56 cols)
├── public_health_surveillance_dataset_cleaned.csv
├── ER_Wait_Time_Dataset_cleaned.csv
├── EHR_cleaned.csv
├── Synthetic_patient-HealthCare-Monitoring_dataset_cleaned.csv
├── Hospital_Bed_Capacity_cleaned.csv
├── weather_dataset_cleaned.csv
│
├── explore_data.py                # Data exploration utility script
│
└── outputs/                       # Generated during training
    ├── confusion_matrix_logreg.png
    ├── confusion_matrix_rf.png
    ├── confusion_matrix_xgb.png
    ├── roc_curve_comparison.png
    ├── feature_importance.png
    ├── model_comparison.png
    └── classification_reports.txt
```

---

## 10. Key Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| **`admission_data` as primary dataset** | Only dataset with a clinically meaningful binary target (OUTCOME) and rich clinical features (56 columns of labs, diagnoses, comorbidities) |
| **Aggregate merge strategy** (not row-level join) | No shared patient IDs across datasets; aggregate features add contextual knowledge without data leakage |
| **Logistic Regression first** | Establishes interpretable baseline; if linear model does well, features are solid |
| **F1 as primary metric** (not accuracy) | Imbalanced target; accuracy is misleading when one class dominates |
| **IQR capping** (not removal) | Healthcare outliers are often real clinical events; removing them loses signal |
| **StandardScaler only for LogReg** | Tree-based models are scale-invariant; unnecessary scaling adds complexity |
| **Stratified everything** | Class imbalance requires stratified splits and stratified cross-validation |
| **No deep learning** | Tabular data with 5,000 rows; gradient boosting consistently outperforms neural networks on small tabular datasets ([Grinsztajn et al., 2022](https://arxiv.org/abs/2207.08815)) |

---

## ⏭️ Next Steps

After reading this README:

1. **Approve the approach** — Confirm the target variable, primary dataset, and modeling strategy.
2. **Phase 1 implementation** — We'll code data cleaning in `data_pro.py`.
3. **Phase 2 implementation** — Feature engineering & preprocessing.
4. **Phase 3 implementation** — Progressive model training (LogReg → RF → XGBoost).
5. **Phase 4 implementation** — Full evaluation with all visualizations.

> **All code will be in a single `data_pro.py`** file — clean, well-commented, and production-ready. No notebooks, no Colab dependencies.

---

*Built with 🐍 Python 3.13 | scikit-learn | XGBoost | pandas | matplotlib | seaborn*
abc