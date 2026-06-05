import React from 'react';

const RepoMatchCard = ({ repo, rank }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <span className="text-gray-400 font-bold mr-3 text-lg">#{rank}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-800 leading-tight">{repo.repo_name}</h3>
            <span className="text-xs font-semibold text-gray-500 uppercase">{repo.project_type.replace('_', ' ')}</span>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-xl font-bold text-gray-700 mr-2">{repo.score}</span>
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${repo.score >= 70 ? 'bg-green-500' : repo.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${repo.score}%` }}></div>
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {repo.why_it_matches}
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {repo.matching_skills.length > 0 && (
          <div className="flex items-center text-xs">
            <span className="font-bold text-green-600 mr-1">+</span>
            <span className="text-gray-600">{repo.matching_skills.slice(0, 3).join(', ')}{repo.matching_skills.length > 3 ? '...' : ''}</span>
          </div>
        )}
        {repo.missing_skills.length > 0 && (
          <div className="flex items-center text-xs">
            <span className="font-bold text-red-500 mr-1">-</span>
            <span className="text-gray-500 line-through decoration-red-300">{repo.missing_skills.slice(0, 2).join(', ')}{repo.missing_skills.length > 2 ? '...' : ''}</span>
          </div>
        )}
      </div>
      
      {repo.resume_bullets && repo.resume_bullets.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
           <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
            {repo.resume_bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RepoMatchCard;
