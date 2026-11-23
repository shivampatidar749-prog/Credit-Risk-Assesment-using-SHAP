# Credit Risk Assessment using SHAP

An end-to-end credit-default risk project containing a model-training notebook and a web application. The notebook explores a loan dataset, compares Logistic Regression with XGBoost, calibrates the selected model, studies feature contributions with SHAP, and exports model artifacts. A FastAPI service uses those artifacts to score applications through a browser-based interface.

> **Use responsibly:** This is an educational project, not a validated lending or financial-advice system. Model outputs should not be used as the sole basis for a real credit decision.

## What the project does

- Predicts a loan-default probability from applicant, loan, and credit-history features.
- Compares a class-weighted Logistic Regression baseline with an XGBoost model.
- Uses stratified train/test splitting and five-fold cross-validation.
- Handles class imbalance using `class_weight="balanced"` for Logistic Regression and a positive-class weight for XGBoost.
- Tunes XGBoost hyperparameters with randomized search using average precision.
- Selects a decision threshold from the precision-recall curve.
- Applies sigmoid probability calibration.
- Analyzes global and individual predictions with SHAP in the notebook.
- Serves the saved model with FastAPI and displays probability and risk classification in a responsive web UI.

The web app currently displays the estimated probability, the decision threshold, and the resulting risk label. SHAP explanations are explored in the notebook; they are not currently exposed in the web interface or prediction response.

## Dataset

The notebook reads a CSV named `credit_risk_dataset.csv` from its working directory. **That CSV is not included in the repository**, so it must be obtained separately and placed next to the notebook before running the analysis.

The notebook's saved data inspection shows an original dataset of **32,581 rows** and 12 columns. The target is `loan_status` (`1` indicates default; `0` indicates no default). Input features are:

| Feature | Meaning |
|---|---|
| `person_age` | Applicant age in years |
| `person_income` | Applicant income |
| `person_home_ownership` | Home ownership category |
| `person_emp_length` | Employment length in years |
| `loan_intent` | Loan purpose |
| `loan_grade` | Loan grade |
| `loan_amnt` | Loan amount |
| `loan_int_rate` | Interest rate |
| `loan_percent_income` | Loan amount relative to income |
| `cb_person_default_on_file` | Historical default indicator |
| `cb_person_cred_hist_length` | Credit history length |

During notebook cleaning, duplicate rows are removed; rows outside the age range 18–100, employment length greater than age or 60 years, and non-positive loan amounts are filtered out. The notebook also inspects missing values, target balance, outliers, and feature correlations.

## Modeling workflow

1. Load and explore the dataset, including data types, missing values, target balance, outliers, and correlations.
2. Clean duplicate and invalid records, then use `loan_status` as the target.
3. Make an 80/20 stratified train/test split with `random_state=42`.
4. Build preprocessing pipelines: median imputation for numeric columns, constant imputation and one-hot encoding for categorical columns. Numeric values are scaled for Logistic Regression; scaling is not used for XGBoost.
5. Evaluate a balanced Logistic Regression baseline and XGBoost using classification metrics and stratified five-fold cross-validation.
6. Tune XGBoost using `RandomizedSearchCV` and average precision.
7. Select a classification threshold from the precision-recall curve, calibrate probabilities with sigmoid calibration, and inspect calibration behavior.
8. Use SHAP to examine global feature importance and individual predictions; inspect false positives and false negatives.
9. Save the calibrated model and selected threshold for the API.

The notebook includes evaluation helpers for accuracy, precision, recall, F1, confusion matrices, classification reports, and precision-recall analysis. It does not provide a guarantee of performance on new applicant populations.

## Web application

The FastAPI application loads `credit_risk_model.pkl` and `best_threshold.pkl` when it starts. The static interface is served from `/`. Users enter values for the 11 model features, and the browser sends them to `POST /predict`.

### Input fields

The API expects a JSON object with all of the following fields:

| Field | Type | Example / accepted categories |
|---|---|---|
| `person_age` | integer | `30` |
| `person_income` | number | `600000` |
| `person_home_ownership` | string | `RENT`, `MORTGAGE`, `OWN`, `OTHER` |
| `person_emp_length` | number | `5` |
| `loan_intent` | string | `PERSONAL`, `EDUCATION`, `MEDICAL`, `VENTURE`, `HOMEIMPROVEMENT`, `DEBTCONSOLIDATION` |
| `loan_grade` | string | `A` through `G` |
| `loan_amnt` | number | `100000` |
| `loan_int_rate` | number | `11.5` |
| `loan_percent_income` | number | `0.17` |
| `cb_person_default_on_file` | string | `Y` or `N` |
| `cb_person_cred_hist_length` | integer | `6` |

`loan_percent_income` is automatically calculated by the UI as loan amount divided by income; the form allows it to be edited.
The interface labels income and loan amount with a rupee symbol, but the API performs no currency conversion. Use monetary values in the same units expected by the dataset/model.

### API

- `GET /openapi.json` — OpenAPI schema and UI service-status check.
- `GET /docs` — interactive Swagger documentation.
- `POST /predict` — estimate default probability and classify it using the saved threshold.

Example request:

```json
{
  "person_age": 30,
  "person_income": 600000,
  "person_home_ownership": "RENT",
  "person_emp_length": 5,
  "loan_intent": "PERSONAL",
  "loan_grade": "B",
  "loan_amnt": 100000,
  "loan_int_rate": 11.5,
  "loan_percent_income": 0.17,
  "cb_person_default_on_file": "N",
  "cb_person_cred_hist_length": 6
}
```

The response contains:

```json
{
  "default_probability": 0.21,
  "default_prediction": 0,
  "threshold": 0.25,
  "Result": "Low Risk"
}
```

The numeric values above are illustrative, not a measured prediction. `default_prediction` is `1` when the probability is at least the saved threshold, otherwise `0`; `Result` is `High Risk` or `Low Risk` accordingly.

## Repository layout

```text
Credit-Risk-Assesment-using-SHAP/
├── README.md
└── Credit-Risk-Assesment-using-SHAP-main/
    ├── Credit_Risk.ipynb
    ├── main.py
    ├── credit_risk_model.pkl
    ├── best_threshold.pkl
    ├── requirements.txt
    ├── runtime.txt
    ├── render.yaml
    └── static/
        ├── index.html
        ├── script.js
        └── style.css
```

The training CSV is intentionally not listed because it is not present in the repository.

## Run locally

The application files are inside `Credit-Risk-Assesment-using-SHAP-main/`. Use Python 3.11 (the deployment runtime is pinned to 3.11.9).

### Windows PowerShell

```powershell
cd Credit-Risk-Assesment-using-SHAP-main
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### macOS or Linux

```bash
cd Credit-Risk-Assesment-using-SHAP-main
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Open `http://127.0.0.1:8000` for the interface, or `http://127.0.0.1:8000/docs` for the API documentation.

### Notebook dependencies

`requirements.txt` contains the production web-app dependencies. To run the notebook, install Jupyter and the additional analysis libraries it imports, including SHAP, Matplotlib, and Seaborn:

```bash
python -m pip install jupyter shap matplotlib seaborn
```

Place `credit_risk_dataset.csv` in the same directory from which the notebook is run. The web application does not need the training CSV; it needs the two committed model artifact files.

## Deploy to Render

The repository includes `render.yaml` in the application subdirectory. For a dashboard-created Render Web Service, set **Root Directory** to `Credit-Risk-Assesment-using-SHAP-main` and use:

- **Runtime:** Python
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health check path:** `/openapi.json`

The Render service configuration uses the free plan and enables automatic deploys. If deploying with Render Blueprint discovery from the repository root, place the Blueprint manifest at the repository root or configure the service through the Render dashboard.

## Dependencies

The pinned production requirements are FastAPI, Uvicorn, Pydantic, Pandas, scikit-learn, XGBoost, and Joblib. Notebook-only analysis also uses Jupyter, SHAP, Matplotlib, and Seaborn.

## Limitations and responsible use

- The dataset is not included, so the complete training workflow is not reproducible from this repository alone until the CSV is supplied.
- The web app provides a model estimate, not a lending approval or rejection.
- Historical data may contain bias; predictions can perpetuate it.
- Assess fairness, legal and regulatory requirements, data privacy, model drift, and calibration before any real-world use.
- Saved Python model artifacts should only be loaded from trusted sources.

## License

No license file is currently included. Unless a license is added, standard copyright applies and reuse is not automatically granted.
