"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import StatsCards from '../components/dashboard/StatsCards';
import RecentBookmarks from '../components/dashboard/RecentBookmarks';
import CategoriesList from '../components/dashboard/CategoriesList';
import PopularThisWeek from '../components/dashboard/PopularThisWeek';
import AIInsights from '../components/dashboard/AIInsights';

const MarklyDashboard = () => {
  //const router = userRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userBookmarks, setUserBookmarks] = useState<any[]>([]);

  const categories = [
    { name: "Development", count: 24, icon: "💻", color: "bg-blue-500" },
    // ... other categories
  ];

  const popularBookmarks = [
    { title: "ChatGPT", visits: 142, trend: "+12%" },
    // ... others
  ];

  useEffect(() => {
    const fetchBookmarks = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found");
        return;
      }

      try {
        const res = await fetch("http://localhost:8080/api/bookmarks", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`
          }
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error("Failed to fetch bookmarks: ", errText);
          return;
        }

        const data = await res.json();
        setUserBookmarks(data);
      } catch (err) {
        console.error("Network error fetching bookmarks: ", err);
      }
    };

    fetchBookmarks();
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
        <StatsCards totalBookmarksCount={userBookmarks?.length ?? 0} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
          <div className="lg:col-span-2">
            <RecentBookmarks bookmarks={userBookmarks} />
          </div>
          <div className="space-y-6">
            <CategoriesList categories={categories} />
            <PopularThisWeek bookmarks={popularBookmarks} />
            <AIInsights />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarklyDashboard;
