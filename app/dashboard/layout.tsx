'use client';

import Link from 'next/link';
import {  UserButton ,useUser } from '@clerk/clerk-react';


const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const projects = [
    { id: '1', name: 'Project One' },
    { id: '2', name: 'Project Two' },
    { id: '3', name: 'Project Three' },
  ];
  const {user} = useUser();
  console.log(user);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-6 shadow-lg flex flex-col justify-between">
        <div>
          <a className="text-2xl font-bold text-gray-800 cursor-pointer" href='/dashboard'>ProjectPilot</a>
          <nav className="mt-6">
            <ul className="space-y-4">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/dashboard/${project.id}`}
                    className="block px-4 py-2 text-gray-600 hover:text-white hover:bg-gradient-to-r from-blue-600 to-indigo-700 rounded-md"
                  >
                    {project.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="mt-6">
          <div className="flex items-center space-x-4 p-4 bg-gray-200 rounded-md">
            <UserButton />
            <div className="flex-1">
              {/* Name with Wrapping */}
              <p className="text-gray-800 font-medium line-clamp-2 max-w-[9rem]">
                {user?.fullName || 'Pilot'}
              </p>
              {/* Email with Truncation */}
              <p className="text-gray-600 text-xs truncate max-w-[7rem]">
                {user?.emailAddresses[0]?.emailAddress || 'No Email'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
