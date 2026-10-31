"use strict";

const form = document.querySelector("#assessment-form");
const stages = [...document.querySelectorAll(".form-stage")];
const indicators = [...document.querySelectorAll("[data-step-indicator]")];
const connectors = [...document.querySelectorAll(".step-connector")];
const backButton = document.querySelector("#back-button");
const continueButton = document.querySelector("#continue-button");
const submitButton = document.querySelector("#submit-button");
const errorMessage = document.querySelector("#form-error");
const resultPanel = document.querySelector("#result-panel");
const ratioNote = document.querySelector("#ratio-note");
const ratioCopy = document.querySelector("#ratio-copy");
const ratioFill = document.querySelector("#ratio-fill");
let currentStep = 0;

function setStep(step) {
  currentStep = step;
  stages.forEach((stage, index) => {
    stage.hidden = index !== step;
    stage.querySelectorAll("input, select").forEach((field) => {
      field.disabled = index !== step;
    });
  });
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("current", index === step);
    indicator.classList.toggle("complete", index < step);
    if (index === step) indicator.setAttribute("aria-current", "step");
    else indicator.removeAttribute("aria-current");
    indicator.querySelector(".step-number").textContent = index < step ? "✓" : String(index + 1);
  });
  connectors.forEach((connector, index) => connector.classList.toggle("complete", index < step));
  backButton.hidden = step === 0;
  continueButton.hidden = step === stages.length - 1;
  submitButton.hidden = step !== stages.length - 1;
  errorMessage.hidden = true;
}

function validateCurrentStage() {
  const fields = [...stages[currentStep].querySelectorAll("input, select")];
  const invalidField = fields.find((field) => !field.checkValidity());
  if (invalidField) {
    invalidField.reportValidity();
    return false;
  }
  return true;
}

function updateLoanRatio() {
  const income = Number(form.elements.person_income.value);
  const amount = Number(form.elements.loan_amnt.value);
  const share = income > 0 && amount > 0 ? Math.round((amount / income) * 100) : 0;

  ratioNote.classList.toggle("ratio-caution", share > 35);
  ratioNote.querySelector(".ratio-indicator").textContent = share > 35 ? "!" : "✓";
  ratioFill.style.width = `${Math.min(share, 100)}%`;
  if (!share) {
    ratioCopy.textContent = "Add income and loan amount to see the loan-to-income estimate.";
  } else {
    ratioCopy.innerHTML = `<strong>${share}%</strong> of annual income requested — ${
      share > 35 ? "consider reviewing affordability." : "within a typical range."
    }`;
  }
}

function renderResult(data) {
  const riskPercent = Math.round(data.default_probability * 100);
  const isHighRisk = data.default_prediction === 1;
  const title = isHighRisk ? "Take a closer look." : "A promising profile.";
  const message = isHighRisk
    ? "The model estimates an elevated likelihood of default. Consider reviewing this application against your lending criteria."
    : "Based on the information provided, this application falls below the model’s risk threshold.";
  const loanShare = Math.round(
    (Number(form.elements.loan_amnt.value) / Number(form.elements.person_income.value)) * 100,
  );
  const resultClass = isHighRisk ? "pill-high" : "pill-low";
  const kicker = isHighRisk ? "REVIEW RECOMMENDED" : "BELOW THE MODEL THRESHOLD";

  resultPanel.innerHTML = `
    <div class="result-score">
      <div class="score-ring" style="--score: ${riskPercent * 3.6}deg; --ring-color: ${isHighRisk ? "#c46b57" : "#438b68"}">
        <div><strong>${riskPercent}<small>%</small></strong><span>DEFAULT RISK</span></div>
      </div>
      <span class="result-pill ${resultClass}"><i></i>${isHighRisk ? "High Risk" : "Low Risk"}</span>
    </div>
    <div class="result-copy">
      <div class="result-kicker">${kicker}</div>
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="result-meta">
        <span>Model threshold</span><strong>${(data.threshold * 100).toFixed(1)}%</strong>
        <span class="meta-divider"></span><span>Loan-to-income</span><strong>${loanShare}%</strong>
      </div>
    </div>
    <div class="result-side-note"><span aria-hidden="true">✓</span><span>Use this assessment as one input in your decision. Review applications in line with your responsible lending policy.</span></div>
  `;
  form.hidden = true;
  document.querySelector(".stepper").hidden = true;
  document.querySelector(".application-ref").hidden = true;
  document.querySelector("#application-heading").textContent = "Assessment complete";
  document.querySelector(".application-heading > div:first-child > p:last-child").textContent =
    "Here’s the model’s view of this application.";
  resultPanel.hidden = false;

  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "reset-button";
  resetButton.textContent = "New assessment";
  resetButton.addEventListener("click", () => window.location.reload());
  document.querySelector(".application-heading").append(resetButton);
}

continueButton.addEventListener("click", () => {
  if (validateCurrentStage()) setStep(currentStep + 1);
});

backButton.addEventListener("click", () => setStep(currentStep - 1));

form.addEventListener("input", updateLoanRatio);
form.addEventListener("change", updateLoanRatio);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  if (!validateCurrentStage()) return;

  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="button-spinner" aria-hidden="true"></span> Assessing…';

  const values = Object.fromEntries(
    [...form.querySelectorAll("input, select")].map((field) => [field.name, field.value]),
  );
  const payload = {
    ...values,
    person_age: Number(values.person_age),
    person_income: Number(values.person_income),
    person_emp_length: Number(values.person_emp_length),
    loan_amnt: Number(values.loan_amnt),
    loan_int_rate: Number(values.loan_int_rate),
    loan_percent_income: Number(values.loan_amnt) / Number(values.person_income),
    cb_person_cred_hist_length: Number(values.cb_person_cred_hist_length),
  };

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error("The risk service returned an unreadable response. Please try again.");
    }
    if (!response.ok) {
      throw new Error(data.detail || "The application could not be assessed. Please check the details and try again.");
    }
    renderResult(data);
  } catch (error) {
    errorMessage.textContent = error.message || "Unable to reach the risk service. Please try again.";
    errorMessage.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Generate assessment <span aria-hidden="true">✦</span>';
  }
});

setStep(0);
updateLoanRatio();
