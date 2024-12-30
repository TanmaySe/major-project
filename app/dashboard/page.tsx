'use client';

export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Welcome to Your Dashboard</h1>
      <p className="mt-4 text-gray-600">
        Here, you can manage your projects, track progress, and view analytics.
      </p>
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <h3 className="text-xl font-semibold text-gray-800">Total Projects</h3>
          <p className="mt-2 text-gray-600">You have 3 active projects.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <h3 className="text-xl font-semibold text-gray-800">Completed Tasks</h3>
          <p className="mt-2 text-gray-600">You've completed 75 tasks this month.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <h3 className="text-xl font-semibold text-gray-800">Upcoming Deadlines</h3>
          <p className="mt-2 text-gray-600">2 projects have deadlines this week.</p>
        </div>
      </div>
    </div>
  );
}
