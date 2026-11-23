# Credit Risk Assessment using SHAP

An end-to-end explainable machine learning project for estimating whether a loan applicant is likely to default. It combines an XGBoost credit-risk model, SHAP-based model interpretation, a FastAPI prediction service, and a responsive browser interface.

## Live Application

The app accepts applicant and loan information, calls the prediction API, and displays:

- Default probability
- Optimized decision threshold
- Low-risk or high-risk classification
- An animated visual gauge

> The notebook provides global and local SHAP analysis. The deployed web interface currently displays the model's probability and final risk verdict.

## Project Overview

Financial institutions need credit decisions that are both accurate and understandable. This project studies a loan applicant dataset, compares machine-learning models, tunes an XGBoost classifier, selects a probability threshold, and saves the trained model for use by a web application.

The complete analytical workflow is included in `Credit_Risk.ipynb`, while `main.py` loads the trained artifacts and exposes an API.

## Key Features

- FastAPI-based REST prediction endpoint
- Browser-based credit-risk assessment interface
- XGBoost default-risk probability prediction
- Logistic Regression baseline comparison
- Stratified five-fold cross-validation
- Class-imbalance handling
- Numeric and categorical data preprocessing pipelines
- Hyperparameter tuning
- Precision-recall threshold optimization
- Probability calibration analysis
- Global and local SHAP explanations
- False-positive and false-negative analysis
- Saved model and optimized threshold artifacts
- Render deployment configuration
- Responsive, accessible HTML, CSS, and JavaScript

## Machine Learning Workflow

1. Load the loan applicant dataset.
2. Explore feature distributions and target balance.
3. Check missing values, duplicates, invalid ages, invalid employment lengths, unrealistic values, and zero or negative financial amounts.
4. Separate input features from the default target.
5. Split the data using a stratified train-test split.
6. Handle class imbalance during model training.
7. Build separate preprocessing workflows for numeric and categorical features.
8. Train and evaluate Logistic Regression as a baseline.
9. Train and tune XGBoost using stratified cross-validation.
10. Compare both models using accuracy, precision, recall, F1 score, ROC information, and precision-recall information.
11. Optimize the classification threshold for the preferred operating point.
12. Analyze predicted probability calibration.
13. Generate SHAP summaries and local applicant explanations.
14. Review false positives and false negatives.
15. Save the final XGBoost pipeline and classification threshold.

## Model Inputs

| Feature | Description | UI Example |
|---|---|---|
| `person_age` | Applicant age in years | `30` |
| `person_income` | Annual income | `600000` |
| `person_home_ownership` | Home ownership category | `RENT`, `MORTGAGE`, `OWN`, `OTHER` |
| `person_emp_length` | Employment length in years | `5` |
| `loan_intent` | Purpose of the loan | `PERSONAL`, `EDUCATION`, `MEDICAL`, `VENTURE`, `HOMEIMPROVEMENT`, `DEBTCONSOLIDATION` |
| `loan_grade` | Loan risk grade | `A` through `G` |
| `loan_amnt` | Requested loan amount | `100000` |
| `loan_int_rate` | Interest rate | `11.5` |
| `loan_percent_income` | Loan amount divided by annual income | `0.17` |
| `cb_person_default_on_file` | Whether a prior default is recorded | `Y` or `N` |
| `cb_person_cred_hist_length` | Credit-history length in years | `6` |

## Technology Stack

- Python 3.11
- FastAPI
- Uvicorn
- Pydantic
- Pandas
- scikit-learn
- XGBoost
- Joblib
- SHAP
- HTML, CSS, and JavaScript
- Render

## Project Structure

```text
.
├── Credit-Risk-Assesment-using-SHAP-main/
│   ├── static/
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   ├── .gitignore
│   ├── best_threshold.pkl
│   ├── credit_risk_model.pkl
│   ├── Credit_Risk.ipynb
│   ├── main.py
│   ├── render.yaml
│   ├── requirements.txt
│   └── runtime.txt
└── README.md
```

### Important Files

- `Credit_Risk.ipynb`: Data analysis, preprocessing, model comparison, tuning, threshold selection, SHAP analysis, and model export.
- `main.py`: FastAPI application, Pydantic request validation, model loading, prediction endpoint, and static web mounting.
- `credit_risk_model.pkl`: Serialized trained XGBoost pipeline.
- `best_threshold.pkl`: Serialized classification probability threshold.
- `static/index.html`: Main assessment interface.
- `static/script.js`: Form handling, API requests, ratio calculation, and result presentation.
- `static/style.css`: Responsive application styling.
- `requirements.txt`: Production Python dependencies.
- `render.yaml`: Render web-service build and start configuration.
- `runtime.txt`: Python runtime used by the deployment environment.

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/shivampatidar749-prog/Credit-Risk-Assesment-using-SHAP.git
cd Credit-Risk-Assesment-using-SHAP
```

### 2. Create a virtual environment

Windows:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

macOS or Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r Credit-Risk-Assesment-using-SHAP-main/requirements.txt
```

### 4. Start the application

```bash
cd Credit-Risk-Assesment-using-SHAP-main
python -m uvicorn main:app --reload
```

Open `http://127.0.0.1:8000` in a browser.

FastAPI documentation is available at:

- Swagger UI: `http://127.0.0.1:8000/docs`
- OpenAPI schema: `http://127.0.0.1:8000/openapi.json`

## API Usage

### Health and API schema

```http
GET /openapi.json
```

### Prediction

```http
POST /predict
Content-Type: application/json
```

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

Example response:

```json
{
  "default_probability": 0.21,
  "default_prediction": 0,
  "threshold": 0.25,
  "Result": "Low Risk"
}
```

Response fields:

- `default_probability`: Probability estimated by the model
- `default_prediction`: `1` for high risk or `0` for low risk
- `threshold`: Optimized probability threshold used for classification
- `Result`: Human-readable risk label

## Deployment

The repository includes `render.yaml` for deployment as a Python web service on Render.

```yaml
buildCommand: pip install -r requirements.txt
startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
healthCheckPath: /openapi.json
```

Deployment steps:

1. Push the project to GitHub.
2. Create a new Blueprint or Web Service in Render.
3. Connect the GitHub repository.
4. Select the repository's Python runtime.
5. Use Python 3.11.
6. Deploy from the `main` branch.

The start command binds Uvicorn to Render's dynamic `$PORT` and serves the static interface from `/`.

## Notebook Usage

Open `Credit_Risk.ipynb` with Jupyter Notebook, JupyterLab, or VS Code. The notebook documents the data-preparation and training process and includes:

- Dataset exploration
- Missing-value and outlier checks
- Cross-validation
- Model metrics
- Precision-recall curves
- Confusion matrices
- Hyperparameter tuning
- Threshold optimization
- Probability calibration
- SHAP global summaries
- SHAP local explanations
- Model and threshold export

## Interpretation and Limitations

- This project is an educational and research application, not an approved lending system.
- Predictions are based on historical data and may reproduce bias present in that data.
- Loan decisions should include human oversight, fairness review, regulatory compliance, and additional underwriting checks.
- Valid API inputs do not guarantee that the application should approve or reject a loan.
- The public web result should not be interpreted as financial advice.
- Model performance and calibration should be rechecked whenever the dataset or applicant population changes.

## Future Improvements

- Display SHAP explanations in the web interface
- Add authentication and role-based access
- Add API rate limiting and request logging
- Store predictions and audit information securely
- Add model monitoring and drift detection
- Add automated tests for preprocessing and API behavior
- Add fairness metrics for protected and sensitive attributes
- Add Docker support
- Add a configurable CI/CD pipeline

## Contributing

Contributions are welcome. Please open an issue describing a bug or proposed improvement before submitting a pull request.

## License

Add a license before publishing the project for unrestricted reuse. Until one is added, standard copyright applies.
