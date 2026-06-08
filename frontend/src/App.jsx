import { useState } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, ShieldCheck, ChevronRight, Dna, Database, Microchip, RefreshCcw } from 'lucide-react';

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

  const handleInputChange = (category, index, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].map((v, i) => i === index ? value : v)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const features = [
        ...formData.mean.map(v => parseFloat(v) || 0.0),
        ...formData.se.map(v => parseFloat(v) || 0.0),
        ...formData.worst.map(v => parseFloat(v) || 0.0)
      ];

      const response = await axios.post('http://localhost:8000/predict', {
        features: features
      });

      if (response.status === 200) {
        setResult({
          diagnosis: response.data.diagnosis.toUpperCase(),
          confidence: response.data.confidence
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
    setFormData({
      mean: Array(10).fill('0.0'),
      se: Array(10).fill('0.0'),
      worst: Array(10).fill('0.0')
    });
  };

  const renderInputColumn = (title, category) => (
    <div className="flex flex-col backdrop-blur-xl bg-[#090f1c]/80 p-4 md:p-8 rounded-3xl border border-white/5 shadow-2xl transition-all hover:bg-[#090f1c]">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner shrink-0">
          <Database className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="text-lg md:text-xl font-medium text-slate-100 tracking-wide">{title}</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
        {FEATURE_NAMES.map((name, idx) => (
          <div key={`${category}-${idx}`} className="relative group">
            <label className="block text-[10px] md:text-xs uppercase tracking-widest text-slate-500 mb-1.5 ml-1 group-focus-within:text-indigo-400 transition-colors font-medium">
              {name}
            </label>
            <input
              type="number"
              step="any"
              required
              value={formData[category][idx]}
              onChange={(e) => handleInputChange(category, idx, e.target.value)}
              className="w-full bg-[#060b13] border border-slate-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all shadow-inner"
              placeholder="0.0"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-visible flex flex-col">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-900/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-[#060b13]/80">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
              <Dna className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-white">Omni<span className="font-light text-slate-400">Health</span></h1>
              <p className="text-xs uppercase tracking-widest text-indigo-400 font-medium mt-0.5">Diagnostic Core v1.0</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-12 relative z-10 flex flex-col">
        {!isAnalyzed ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex-1">
            <div className="mb-12 text-center w-full max-w-7xl mx-auto px-4 md:px-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-4 md:mb-6 tracking-tight">Cellular Morphometrics Workspace</h2>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                Provide the 30 standardized morphological parameters extracted from the digitized Fine Needle Aspirate (FNA) specimen. The core diagnostic inference framework will evaluate these combined physiological criteria to isolate pathological anomalies.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
                {renderInputColumn("Mean Values", "mean")}
                {renderInputColumn("Standard Error (SE)", "se")}
                {renderInputColumn("Worst Values", "worst")}
              </div>

              <div className="flex justify-center pb-12">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative inline-flex items-center justify-center gap-3 md:gap-4 px-6 py-4 md:px-10 md:py-5 bg-white/5 border border-white/10 rounded-full overflow-hidden transition-all hover:bg-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_50px_0_rgba(99,102,241,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-violet-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {isLoading ? (
                    <RefreshCcw className="w-6 h-6 animate-spin text-indigo-400" />
                  ) : (
                    <Activity className="w-6 h-6 text-indigo-400 group-hover:animate-pulse" />
                  )}
                  <span className="font-medium tracking-wider text-sm md:text-base uppercase text-slate-100 group-hover:text-white transition-colors">
                    {isLoading ? 'Processing Pipeline...' : 'Run Diagnostic Analysis'}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 flex-1 flex flex-col items-center justify-center py-12">

            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 relative">
              <div className={`absolute inset-0 blur-[120px] opacity-20 pointer-events-none transition-colors duration-1000 ${result.diagnosis === 'MALIGNANT' ? 'bg-rose-500' : 'bg-emerald-500'}`} />

              <div className="backdrop-blur-3xl bg-[#090f1c]/90 rounded-3xl md:rounded-[2.5rem] border border-white/5 p-6 md:p-14 shadow-2xl relative overflow-hidden">

                <div className="flex justify-between items-start mb-16">
                  <div>
                    <h3 className="text-sm md:text-base uppercase tracking-widest text-slate-500 mb-1">Clinical Diagnostic Report</h3>
                    <p className="text-xs uppercase tracking-widest text-slate-600 mb-3">Patient Evaluation & Multi-Dimensional Pattern Analytics</p>
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full animate-pulse shrink-0 ${result.diagnosis === 'MALIGNANT' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]'}`} />
                      <span className="text-slate-300 tracking-wide text-xs md:text-sm">Status: Complete</span>
                    </div>
                  </div>

                  <button
                    onClick={resetForm}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
                    title="Start New Analysis"
                  >
                    <RefreshCcw className="w-6 h-6 text-slate-400 group-hover:text-white group-hover:-rotate-180 transition-all duration-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">

                  {/* Left Column: Prediction & Circle */}
                  <div className="flex flex-col items-center text-center space-y-10">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-48 h-48 md:w-64 md:h-64 transform -rotate-90">
                        <circle
                          className="text-[#060b13]"
                          strokeWidth="12"
                          stroke="currentColor"
                          fill="transparent"
                          r="110"
                          cx="128"
                          cy="128"
                        />
                        <circle
                          className={`transition-all duration-1500 ease-out ${result.diagnosis === 'MALIGNANT' ? 'text-rose-500' : 'text-emerald-400'}`}
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
                        <span className="text-4xl md:text-5xl font-light text-white tracking-tighter">
                          {result.confidence}<span className="text-2xl md:text-3xl text-slate-500">%</span>
                        </span>
                        <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 mt-1 md:mt-2">Probability</span>
                      </div>
                    </div>

                    <div>
                      <h2 className={`text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-2 md:mb-4 ${result.diagnosis === 'MALIGNANT' ? 'text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}>
                        {result.diagnosis}
                      </h2>
                      <p className="text-slate-400 text-sm md:text-lg uppercase tracking-widest">Diagnostic Classification</p>
                    </div>
                  </div>

                  {/* Right Column: Engine Card & Summary */}
                  <div className="space-y-8">
                    {/* Performance Engine Card */}
                    <div className="bg-[#060b13]/60 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                      <div className="flex items-center space-x-5 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-[#090f1c] flex items-center justify-center border border-slate-800 shadow-inner">
                          <Microchip className="w-7 h-7 text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-slate-200">Core Diagnostic Engine</h4>
                          <p className="text-sm text-slate-500 font-mono mt-1 leading-relaxed">
                            Inference computed utilizing optimized multi-variable pattern analysis cross-validated on historical records.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div className="bg-[#090f1c] rounded-2xl p-4 md:p-5 border border-white/5 shadow-inner">
                          <span className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Model Confidence</span>
                          <span className={`font-mono text-xl md:text-2xl ${result.diagnosis === 'MALIGNANT' ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {result.confidence}%
                          </span>
                        </div>
                        <div className="bg-[#090f1c] rounded-2xl p-4 md:p-5 border border-white/5 shadow-inner">
                          <span className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Features Extracted</span>
                          <span className="text-slate-300 font-mono text-xl md:text-2xl">30 Dims</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#060b13]/60 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-8 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${result.diagnosis === 'MALIGNANT' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <div className="flex items-center space-x-3 mb-4">
                        {result.diagnosis === 'MALIGNANT' ? (
                          <ShieldAlert className="w-6 h-6 text-rose-500" />
                        ) : (
                          <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        )}
                        <h4 className="text-lg font-medium text-slate-200">Contextual Summary</h4>
                      </div>
                      <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                        {result.diagnosis === 'MALIGNANT'
                          ? "The provided cellular morphometrics exhibit severe deviations consistent with malignancy. The computed probability reflects a highly aggressive geometrical profile. Urgent histopathological validation and immediate clinical intervention are strongly advised."
                          : "The cellular characteristics demonstrate regular morphometric patterns consistent with benign, healthy tissue. All nuclear uniformity and dimensional parameters remain well within normal physiological baselines. Routine monitoring is recommended."}
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
