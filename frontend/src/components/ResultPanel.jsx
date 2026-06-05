import React from 'react';
import JobSummaryCard from './JobSummaryCard';
import BestMatchCard from './BestMatchCard';
import RepoMatchCard from './RepoMatchCard';

const ResultPanel = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 bg-white rounded-lg border border-gray-200 shadow-sm min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Analyzing repositories & generating match scores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-red-50 text-red-700 rounded-lg border border-red-200 shadow-sm">
        <h3 className="font-bold text-lg mb-2">Analysis Failed</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-500 min-h-[400px]">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
        <p className="text-center font-medium">Submit a GitHub username and job description to see matching repositories.</p>
      </div>
    );
  }

  const { job_profile, top_matches } = data;
  const bestMatch = top_matches.length > 0 ? top_matches[0] : null;
  const otherMatches = top_matches.length > 1 ? top_matches.slice(1) : [];

  return (
    <div className="w-full animate-fadeIn">
      <JobSummaryCard jobProfile={job_profile} />
      
      {top_matches.length === 0 ? (
        <div className="p-6 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
          No matching repositories found. Try another username or a broader job description.
        </div>
      ) : (
        <>
          <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">Top Recommendation</h3>
          <BestMatchCard repo={bestMatch} />
          
          {otherMatches.length > 0 && (
            <>
              <h3 className="text-lg font-bold text-gray-800 mb-4 mt-8 px-1">Other Strong Matches</h3>
              <div className="space-y-4">
                {otherMatches.map((repo, idx) => (
                  <RepoMatchCard key={idx} repo={repo} rank={idx + 2} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ResultPanel;
