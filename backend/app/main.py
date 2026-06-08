import os
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import PredictionInput, PredictionOutput

app = FastAPI(
    title="OmniHealth Breast Cancer Diagnostic Core",
    description="Production API serving an optimized XGBoost Pipeline for tumor classification.",
    version="1.0.0"
)

# Open CORS configuration to allow your React app to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Swap with your specific domain when deploying live
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Explicitly define the feature names to maintain structural alignment with XGBoost
FEATURE_NAMES = [
    'radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean', 'smoothness_mean',
    'compactness_mean', 'concavity_mean', 'concave points_mean', 'symmetry_mean', 'fractal_dimension_mean',
    'radius_se', 'texture_se', 'perimeter_se', 'area_se', 'smoothness_se',
    'compactness_se', 'concavity_se', 'concave points_se', 'symmetry_se', 'fractal_dimension_se',
    'radius_worst', 'texture_worst', 'perimeter_worst', 'area_worst', 'smoothness_worst',
    'compactness_worst', 'concavity_worst', 'concave points_worst', 'symmetry_worst', 'fractal_dimension_worst'
]

# Load the production joblib pipeline model bundle globally
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../models/best_model.joblib"))

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Missing production model artifact at: {MODEL_PATH}. Run your notebook first!")

model_pipeline = joblib.load(MODEL_PATH)


@app.get("/")
def health_check():
    """Verifies backend system connectivity and structural integrity."""
    return {
        "status": "operational",
        "engine": "XGBoost Pipeline",
        "input_dimensions": len(FEATURE_NAMES)
    }


@app.post("/predict", response_model=PredictionOutput)
def diagnostic_inference(payload: PredictionInput):
    """Processes medical parameters and computes diagnostic evaluations."""
    try:
        # Convert incoming array to a structured DataFrame to keep XGBoost warning-free
        input_dataframe = pd.DataFrame([payload.features], columns=FEATURE_NAMES)
        
        # Execute classification
        prediction_class = int(model_pipeline.predict(input_dataframe)[0])
        probabilities = model_pipeline.predict_proba(input_dataframe)[0]
        
        # Parse classification outputs
        diagnosis_label = "Malignant" if prediction_class == 1 else "Benign"
        
        # Compute certainty rating matching the chosen outcome
        raw_confidence = probabilities[1] if prediction_class == 1 else probabilities[0]
        confidence_percentage = round(float(raw_confidence) * 100, 2)
        
        return {
            "diagnosis": diagnosis_label,
            "confidence": confidence_percentage,
            "status": "success"
        }
        
    except Exception as e:
        # Prevent server lockups by catching inference engine failures cleanly
        raise HTTPException(
            status_code=500,
            detail=f"Inference Engine Runtime Exception: {str(e)}"
        )