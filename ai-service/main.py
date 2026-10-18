
from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# --------------------------------------------------
# Configuration
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "bus_delay_model.joblib"

if not MODEL_PATH.exists():
    raise RuntimeError(
        "Trained model not found. Run: python train_model.py"
    )

model = joblib.load(MODEL_PATH)

app = FastAPI(
    title="AI BusTruth Prediction API",
    description=(
        "Demo bus delay predictions based on time, "
        "weekday, distance and traffic conditions."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request validation
# --------------------------------------------------

class DelayRequest(BaseModel):
    hour: int = Field(ge=0, le=23)
    weekday: int = Field(ge=0, le=6)
    distance_km: float = Field(gt=0, le=500)
    traffic_level: int = Field(ge=1, le=4)


# --------------------------------------------------
# API endpoints
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "success": True,
        "message": "AI BusTruth Prediction API is running",
        "version": "2.0.0",
        "model": "RandomForestRegressor",
        "data_type": "synthetic_demo",
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "model_loaded": model is not None,
        "service": "AI BusTruth",
        "prediction_status": "DEMO_ONLY",
    }


@app.post("/predict")
def predict_delay(request: DelayRequest):
    try:
        input_data = pd.DataFrame(
            [
                {
                    "hour": request.hour,
                    "weekday": request.weekday,
                    "distance_km": request.distance_km,
                    "traffic_level": request.traffic_level,
                }
            ]
        )

        prediction = float(model.predict(input_data)[0])

        if not pd.notna(prediction):
            raise ValueError("Model returned an invalid prediction")

        prediction = round(max(0.0, prediction), 1)

        # Demo thresholds, not real-world validated thresholds.
        if prediction < 5:
            status = "LOW_DELAY"
            message = "Low estimated delay"
        elif prediction < 15:
            status = "MODERATE_DELAY"
            message = "Moderate estimated delay"
        else:
            status = "HIGH_DELAY"
            message = "High estimated delay"

        return {
            "success": True,
            "predicted_delay_minutes": prediction,
            "status": status,
            "message": message,
            "warning": (
                "Demo estimate only. This model uses synthetic "
                "data and has not been validated against real "
                "Sri Lankan bus records."
            ),
            "input": request.model_dump(),
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Prediction failed. Check the AI service logs.",
        ) from error
