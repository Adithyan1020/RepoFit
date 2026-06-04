import React from 'react';

const ResultPanel = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Analyzing profile and extracting job requirements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <h3 className="font-semibold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
        Submit a GitHub username and job description to see the results.
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 rounded-lg overflow-hidden flex flex-col shadow-lg border border-gray-700">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
        <span className="text-gray-300 font-mono text-sm">JSON Response</span>
      </div>
      <div className="p-4 overflow-auto max-h-[600px] text-left">
        <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ResultPanel;
