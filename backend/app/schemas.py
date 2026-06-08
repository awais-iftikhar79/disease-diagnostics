from pydantic import BaseModel, Field
from typing import List

class PredictionInput(BaseModel):
    # Accepts the flat array of 30 continuous tumor characteristics
    features: List[float] = Field(
        ..., 
        description="List of 30 numerical features computed from the tumor FNA image.",
        min_items=30,
        max_items=30
    )

class PredictionOutput(BaseModel):
    diagnosis: str
    confidence: float
    status: str