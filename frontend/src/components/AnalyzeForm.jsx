import React, { useState } from 'react';

const AnalyzeForm = ({ onAnalyze, loading }) => {
  const [username, setUsername] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && jobDescription.trim()) {
      onAnalyze(username, jobDescription);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">RepoFit Data Ingestion</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
          GitHub Username
        </label>
        <input
          id="username"
          type="text"
          placeholder="e.g., torvalds"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="jobDescription">
          Job Description
        </label>
        <textarea
          id="jobDescription"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-48 resize-y transition"
          required
        ></textarea>
      </div>
      
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={loading || !username.trim() || !jobDescription.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition shadow-md"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </form>
  );
};

export default AnalyzeForm;
