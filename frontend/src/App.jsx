import { useState } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, ShieldCheck, ChevronRight, FileText, Database, Microchip, RefreshCcw } from 'lucide-react';

const FEATURE_NAMES = [
  'Radius', 'Texture', 'Perimeter', 'Area', 'Smoothness',
  'Compactness', 'Concavity', 'Concave Points', 'Symmetry', 'Fractal Dimension'
];

export default function App() {
  const [formData, setFormData] = useState({
    mean: Array(10).fill('0.0'),
    se: Array(10).fill('0.0'),
    worst: Array(10).fill('0.0')
  });

  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleInputChange = (category, index, value) => {
    // Only allow numbers and decimal points
    if (/[^0-9.]/.test(value) && value !== "") return;
    
    // Check if there are multiple decimal points
    if ((value.match(/\./g) || []).length > 1) return;

    // Prevent extremely large values
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 10000) return;

    setFormData(prev => ({
      ...prev,
      [category]: prev[category].map((v, i) => i === index ? value : v)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const allFeatures = [
      ...formData.mean,
      ...formData.se,
      ...formData.worst
    ];

    // Input Validation
    for (let i = 0; i < allFeatures.length; i++) {
      const val = allFeatures[i];
      if (val === '' || val === null || val === undefined) {
        setErrorMsg("All fields must be filled.");
        return;
      }
      const num = parseFloat(val);
      if (isNaN(num) || !isFinite(num)) {
        setErrorMsg("Invalid number detected.");
        return;
      }
      if (num < 0) {
        setErrorMsg("Negative values are not allowed.");
        return;
      }
      if (num > 10000) {
        setErrorMsg("Values cannot exceed 10000.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const features = allFeatures.map(v => parseFloat(v));

      const response = await axios.post('http://localhost:8000/predict', {
        features: features
      });

      if (response.status === 200) {
        const diag = response.data.diagnosis.toUpperCase();
        const conf = response.data.confidence;
        let riskLevel = 'Borderline';
        if (conf >= 65) {
          riskLevel = diag === 'MALIGNANT' ? 'High Risk' : 'Low Risk';
        }

        setResult({
          diagnosis: diag,
          confidence: conf,
          riskLevel: riskLevel
        });
        setIsAnalyzed(true);
      }
    } catch (error) {
      console.error("Diagnostic error:", error);
      alert("Failed to connect to the diagnostic engine.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsAnalyzed(false);
    setResult(null);
    setErrorMsg(null);
    setFormData({
      mean: Array(10).fill('0.0'),
      se: Array(10).fill('0.0'),
      worst: Array(10).fill('0.0')
    });
  };

  const renderInputColumn = (title, category) => (
    <div className="flex flex-col bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
          <Database className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-slate-800">{title}</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
        {FEATURE_NAMES.map((name, idx) => (
          <div key={`${category}-${idx}`} className="relative group">
            <label className="block text-[10px] md:text-xs uppercase tracking-wider text-slate-500 mb-1.5 ml-1 font-semibold group-focus-within:text-blue-600 transition-colors">
              {name}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              max="10000"
              required
              value={formData[category][idx]}
              onChange={(e) => handleInputChange(category, idx, e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="0.0"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 relative overflow-x-hidden flex flex-col">
      {/* Clean Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">MedAI<span className="font-light text-slate-500"> Diagnostics</span></h1>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure Clinical Environment</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-10 relative z-10 flex flex-col">
        {!isAnalyzed ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex-1">
            <div className="mb-10 w-full max-w-4xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Breast Cancer Diagnostic System</h2>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                Enter the 30 cell nuclei parameters from the digitized Fine Needle Aspirate (FNA) image. Our AI model will analyze the morphometric data to predict whether the tumor is benign or malignant.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10">
                {renderInputColumn("Mean Values", "mean")}
                {renderInputColumn("Standard Error", "se")}
                {renderInputColumn("Worst Values", "worst")}
              </div>

              {errorMsg && (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm font-medium">
                  <ShieldAlert className="inline-block w-5 h-5 mr-2 -mt-0.5" />
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-start pb-12">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative inline-flex items-center justify-center gap-3 md:gap-4 px-8 py-4 md:px-10 md:py-4 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Activity className="w-5 h-5 group-hover:animate-pulse" />
                  )}
                  <span className="font-semibold tracking-wide text-sm md:text-base uppercase">
                    {isLoading ? 'Analyzing Data...' : 'Run Analysis'}
                  </span>
                  <ChevronRight className="w-5 h-5 opacity-80 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 flex-1 flex flex-col items-center justify-center py-6 md:py-12">
            <div className="w-full max-w-6xl mx-auto relative">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-12 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h3 className="text-sm md:text-base uppercase tracking-widest text-slate-500 font-semibold mb-1">Diagnostic Report</h3>
                    <p className="text-xs md:text-sm text-slate-400">Automated Patient Evaluation</p>
                  </div>
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">New Analysis</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
                  {/* Left Column: Prediction & Circle */}
                  <div className="flex flex-col items-center text-center space-y-8">
                    <div className="relative flex items-center justify-center">
                      <svg viewBox="0 0 256 256" className="w-48 h-48 md:w-64 md:h-64 transform -rotate-90">
                        <circle
                          className="text-slate-100"
                          strokeWidth="12"
                          stroke="currentColor"
                          fill="transparent"
                          r="110"
                          cx="128"
                          cy="128"
                        />
                        <circle
                          className={`transition-all duration-1500 ease-out ${result.diagnosis === 'MALIGNANT' ? 'text-rose-500' : 'text-emerald-500'}`}
                          strokeWidth="12"
                          strokeDasharray={110 * 2 * Math.PI}
                          strokeDashoffset={110 * 2 * Math.PI * (1 - result.confidence / 100)}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="110"
                          cx="128"
                          cy="128"
                        />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
                          {result.confidence}<span className="text-2xl md:text-3xl text-slate-500">%</span>
                        </span>
                        <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 mt-1 font-semibold">Confidence</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm md:text-base uppercase tracking-widest font-semibold mb-2">Prediction</p>
                      <h2 className={`text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 ${result.diagnosis === 'MALIGNANT' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {result.diagnosis}
                      </h2>
                      {result.riskLevel === 'High Risk' && <span className="bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-full text-sm md:text-base font-semibold shadow-sm inline-flex items-center gap-2">🔴 High Risk</span>}
                      {result.riskLevel === 'Low Risk' && <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-full text-sm md:text-base font-semibold shadow-sm inline-flex items-center gap-2">🟢 Low Risk</span>}
                      {result.riskLevel === 'Borderline' && <span className="bg-yellow-100 text-yellow-700 border border-yellow-300 px-4 py-2 rounded-full text-sm md:text-base font-semibold shadow-sm inline-flex items-center gap-2">🟡 Moderate Risk</span>}
                    </div>
                  </div>

                  {/* Right Column: Engine Card & Summary */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-8">
                      <div className="flex items-center space-x-4 mb-5">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                          <Microchip className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-slate-800">AI Analysis Engine</h4>
                          <p className="text-sm text-slate-500 mt-0.5">
                            Cross-validated using multi-variable morphometric data.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                          <span className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Model Confidence</span>
                          <span className={`font-bold text-xl ${result.diagnosis === 'MALIGNANT' ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {result.confidence}%
                          </span>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                          <span className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Features</span>
                          <span className="text-slate-800 font-bold text-xl">30 Inputs</span>
                        </div>
                      </div>
                    </div>

                    <div className={`border rounded-2xl p-5 md:p-8 ${result.diagnosis === 'MALIGNANT' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                      <div className="flex items-center space-x-3 mb-3">
                        {result.diagnosis === 'MALIGNANT' ? (
                          <ShieldAlert className="w-6 h-6 text-rose-600" />
                        ) : (
                          <ShieldCheck className="w-6 h-6 text-emerald-600" />
                        )}
                        <h4 className="text-lg font-semibold text-slate-800">Medical Disclaimer</h4>
                      </div>
                      <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium">
                        {result.diagnosis === 'MALIGNANT'
                          ? "The model predicts a malignant classification based on the supplied morphometric features. This result should be confirmed through appropriate clinical assessment and diagnostic procedures. It is not a substitute for professional medical advice."
                          : "The model predicts a benign classification based on the supplied morphometric features. This result is intended for decision-support purposes only and should not be considered a medical diagnosis. Clinical evaluation by a qualified healthcare professional is recommended."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
