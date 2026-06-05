import React from 'react';

const JobSummaryCard = ({ jobProfile }) => {
  if (!jobProfile) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Role: <span className="text-blue-600">{jobProfile.role_title}</span>
      </h2>
      <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full mb-4">
        {jobProfile.role_type}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {jobProfile.required_skills.map((skill, i) => (
              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-semibold">
                {skill}
              </span>
            ))}
            {jobProfile.required_skills.length === 0 && <span className="text-gray-400 text-sm">None detected</span>}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Preferred Skills</h3>
          <div className="flex flex-wrap gap-2">
            {jobProfile.preferred_skills.map((skill, i) => (
              <span key={i} className="px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded text-xs">
                {skill}
              </span>
            ))}
            {jobProfile.preferred_skills.length === 0 && <span className="text-gray-400 text-sm">None detected</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSummaryCard;
