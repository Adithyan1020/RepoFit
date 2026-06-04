import React, { useState } from 'react';
import AnalyzeForm from './components/AnalyzeForm';
import ResultPanel from './components/ResultPanel';
import { analyzeProfile } from './api/client';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (username, jobDescription) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await analyzeProfile(username, jobDescription);
      setResult(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">RepoFit</h1>
          <p className="text-lg text-gray-600">Day 1: Data Ingestion Foundation</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <AnalyzeForm onAnalyze={handleAnalyze} loading={loading} />
          </div>
          <div>
            <ResultPanel data={result} loading={loading} error={error} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
