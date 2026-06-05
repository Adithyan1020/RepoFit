import React from 'react';

const BestMatchCard = ({ repo }) => {
  if (!repo) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-200 p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg font-bold text-sm shadow-sm">
        Best Match
      </div>
      
      <div className="flex items-center justify-between mb-4 mt-2">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">{repo.repo_name}</h2>
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded uppercase tracking-wide">
            {repo.project_type.replace('_', ' ')}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-3xl font-black text-blue-600">
            {repo.score}
            <span className="text-lg text-blue-400">/100</span>
          </div>
          <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${repo.score}%` }}></div>
          </div>
        </div>
      </div>

      <p className="text-gray-700 italic mb-6 border-l-4 border-blue-300 pl-3">
        "{repo.why_it_matches}"
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-bold text-green-700 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Matching Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {repo.matching_skills.map((skill, i) => (
              <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded border border-green-200">
                {skill}
              </span>
            ))}
            {repo.matching_skills.length === 0 && <span className="text-sm text-gray-500">None detected</span>}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-600 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            Missing Signals
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {repo.missing_skills.map((skill, i) => (
              <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                {skill}
              </span>
            ))}
            {repo.missing_skills.length === 0 && <span className="text-sm text-gray-500">None</span>}
          </div>
        </div>
      </div>

      {repo.resume_bullets && repo.resume_bullets.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            Resume Bullet Suggestions
          </h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {repo.resume_bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BestMatchCard;
