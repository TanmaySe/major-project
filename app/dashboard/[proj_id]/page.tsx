'use client';

import { useParams } from 'next/navigation';

export default function ProjectPage() {
  const params = useParams();
  const { proj_id } = params;

  const projects = [
    { id: '1', name: 'Project One', details: 'Details about Project One' },
    { id: '2', name: 'Project Two', details: 'Details about Project Two' },
    { id: '3', name: 'Project Three', details: 'Details about Project Three' },
  ];

  const project = projects.find((p) => p.id === proj_id);

  if (!project) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Project Not Found</h1>
        <p className="mt-4 text-gray-600">The project you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
      <p className="mt-4 text-gray-600">{project.details}</p>
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <h3 className="text-xl font-semibold text-gray-800">Active Tasks</h3>
          <p className="mt-2 text-gray-600">15 tasks in progress.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <h3 className="text-xl font-semibold text-gray-800">Team Members</h3>
          <p className="mt-2 text-gray-600">5 team members are working on this project.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <h3 className="text-xl font-semibold text-gray-800">Deadline</h3>
          <p className="mt-2 text-gray-600">Due in 10 days.</p>
        </div>
      </div>
    </div>
  );
}
