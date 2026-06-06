import { useState } from 'react';
import LandingView from './components/LandingView';
import DashboardView from './components/DashboardView';
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
      // We can reset loading to show the alert or show error in LandingView.
      alert(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setResult(null);
  };

  // If we have a result, show the Dashboard. Otherwise show Landing View.
  if (result) {
    return <DashboardView data={result} onBack={handleBack} />;
  }

  return <LandingView onAnalyze={handleAnalyze} loading={loading} error={error} />;
}

export default App;
