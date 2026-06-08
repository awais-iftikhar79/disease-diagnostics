from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_app_initializes_cleanly():
    """Verify that the FastAPI application instance is created successfully."""
    assert app is not None

def test_docs_route():
    """Verify that the base auto-generated docs route is responsive."""
    response = client.get("/docs")
    assert response.status_code == 200

def test_predict_endpoint_validation():
    """Verify that the /predict endpoint responds and properly handles empty validation."""
    # A GET request to a POST endpoint should return 405 Method Not Allowed
    response = client.get("/predict")
    assert response.status_code == 405

    # A POST request with no payload should fail with 422 Unprocessable Entity
    response = client.post("/predict", json={})
    assert response.status_code == 422

def test_prediction_complete_flow():
    """Verify that the /predict endpoint successfully returns a diagnosis when given valid features."""
    mock_features = [0.1] * 30
    payload = {"features": mock_features}
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "diagnosis" in data
    assert data["diagnosis"] in ["Malignant", "Benign"]
