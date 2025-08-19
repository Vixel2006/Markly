"use client";
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { User, Mail, Calendar, LogOut } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async <T,>(url: string, method: string = "GET", body?: any): Promise<T | null> => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token missing. Please log in.");
      return null;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `API call failed with status ${response.status}`);
      }
      return await response.json();
    } catch (err: any) {
      console.error(`Network or API error fetching from ${url}: `, err);
      setError(err.message || `Failed to fetch from ${url}`);
      return null;
    }
  }, []);

  useEffect(() => {
    const getMyProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await fetchData<UserProfile>("http://localhost:8080/api/me");
        if (profile) {
          setUserProfile(profile);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    getMyProfile();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth"; // Redirect to login page
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-green-50 to-green-200 text-slate-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold"
        >
          Loading profile...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-red-50 to-red-100 text-red-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold"
        >
          Error: {error}
        </motion.div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-yellow-50 to-yellow-100 text-yellow-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold"
        >
          No profile data found.
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24 custom-scrollbar">
      <motion.div
        className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto border border-green-100"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold text-black mb-6 text-center">My Profile</h1>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl shadow-sm">
            <User className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm text-slate-500">Username</span>
              <span className="text-lg font-semibold text-black">{userProfile.username}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl shadow-sm">
            <Mail className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-lg font-semibold text-black">{userProfile.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl shadow-sm">
            <Calendar className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm text-slate-500">Member Since</span>
              <span className="text-lg font-semibold text-black">
                {new Date(userProfile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <motion.button
          onClick={handleLogout}
          className="w-full mt-8 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </motion.button>
      </motion.div>
    </div>
  );
}
