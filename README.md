# MedAI Diagnostic - Breast Cancer Detection

A comprehensive, full-stack machine learning application designed to aid in the preliminary diagnosis of breast cancer. This system integrates a highly-responsive React frontend with a high-performance FastAPI Python backend running advanced predictive models.

## 🚀 Features

- **High-Fidelity User Interface**: A professional, responsive, full-width UI built with React and Tailwind CSS. Features an intuitive 3-column grid input layout for cellular metrics (Mean, SE, Worst).
- **Advanced Machine Learning**: Powered by scikit-learn and XGBoost/TensorFlow models, enabling precise inference on 30 different tumor features.
- **Real-Time API Processing**: Robust `FastAPI` backend optimized with `uvicorn` to handle fast and reliable predictions over the `/predict` endpoint.
- **Dynamic Diagnostic Reporting**: Instantly renders visual confidence metrics, prediction classes (Malignant / Benign), and actionable clinical recommendations.
- **Production Ready Testing**: Backend validated via end-to-end `pytest` coverage and strict type linting.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS
- **Tooling**: ESLint, PostCSS

### Backend
- **Framework**: FastAPI
- **Machine Learning**: Scikit-Learn, XGBoost, TensorFlow, Pandas, NumPy
- **Testing**: Pytest, HTTPX, Pyrefly (Internal)

## 📁 Project Structure

```text
Disease_diagnostic/
├── frontend/               # React & Vite frontend UI
│   ├── src/                # Components and layout logic
│   ├── tailwind.config.js  # Styling framework
│   └── package.json        # Frontend dependencies
│
├── backend/                # FastAPI & Python ML Server
│   ├── app/                # API Routes and Core Logic
│   ├── models/             # Serialized ML Models
│   ├── tests/              # Pytest verification suites
│   ├── test_backend.py     # End-to-end integration tests
│   └── requirement.txt     # Python Dependencies
│
├── venv/                   # Python Virtual Environment
└── pyrefly.toml            # Linter & Environment Config
```

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository_url>
cd Disease_diagnostic
```

### 2. Backend Setup
Activate the virtual environment and install the Python dependencies.
```bash
# If the venv doesn't exist, create it: python3 -m venv venv
source venv/bin/activate
cd backend
pip install -r requirement.txt
```

Run the backend development server:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000` (Visit `http://localhost:8000/docs` for the interactive Swagger UI).

### 3. Frontend Setup
In a new terminal window, navigate to the frontend directory, install the Node dependencies, and start the Vite dev server.
```bash
cd frontend
npm install
npm run dev
```
The application UI will be available at `http://localhost:5173`.

## 🧪 Testing

The backend includes a comprehensive suite of unit and integration flows covering the model's inference pipeline.
To run the tests:
```bash
source venv/bin/activate
cd backend
python -m pytest -v
```

## 🤝 Contributing
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
