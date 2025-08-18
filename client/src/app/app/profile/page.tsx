"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import { User as UserIcon, Mail } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
}

const UserProfilePage = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { name: "Development", count: 24, icon: "💻", color: "bg-blue-500" },
    { name: "Design", count: 18, icon: "🎨", color: "bg-pink-500" },
    { name: "Productivity", count: 30, icon: "⏱️", color: "bg-green-500" },
    { name: "AI/ML", count: 12, icon: "🤖", color: "bg-purple-500" },
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:8080/api/me", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`
          }
        });

        if (!res.ok) {
          const errText = await res.text();
          // Attempt to parse error as JSON if possible, otherwise use raw text
          try {
            const errData = JSON.parse(errText);
            setError(errData.message || "Failed to fetch user profile.");
          } catch (parseError) {
            setError(errText || `Failed to fetch user profile: ${res.status} ${res.statusText}`);
          }
          return;
        }

        const data: User = await res.json();
        setUserProfile(data);
      } catch (err) {
        console.error("Network error fetching user profile: ", err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        categories={categories}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarExpanded ? 'ml-64' : 'ml-16'
        } p-4 md:p-6`}
      >
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-xl mx-auto mt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>

          {loading && (
            <div className="flex justify-center items-center h-48 flex-col">
              <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="mt-3 text-lg text-slate-400">Loading profile...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {userProfile && !loading && !error && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-700 p-4 rounded-lg border border-slate-600">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Name</p>
                  <p className="text-xl font-semibold">{userProfile.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-700 p-4 rounded-lg border border-slate-600">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-xl font-semibold">{userProfile.email}</p>
                </div>
              </div>

              {/* You might add an "Edit Profile" button here later */}
              {/* <button
                className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold mt-6"
                // onClick={() => router.push('/edit-profile')}
              >
                Edit Profile
              </button> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
