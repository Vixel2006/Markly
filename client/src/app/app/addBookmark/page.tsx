"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import { Plus } from 'lucide-react'; // Assuming Plus icon for the button

interface BookmarkFormData {
  url: string;
  title: string;
  description: string;
  category: string;
  tags: string; // Storing as comma-separated string for input, will convert to array for API
}

const AddBookmarkPage = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Kept for Header component
  const [formData, setFormData] = useState<BookmarkFormData>({
    url: '',
    title: '',
    description: '',
    category: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Example categories for dropdown/suggestion, you might fetch these from your API
  const predefinedCategories = [
    { name: "Development", count: 0, icon: "💻", color: "bg-blue-500" },
    { name: "Design", count: 0, icon: "🎨", color: "bg-pink-500" },
    { name: "Productivity", count: 0, icon: "⏱️", color: "bg-green-500" },
    { name: "AI/ML", count: 0, icon: "🤖", color: "bg-purple-500" },
    { name: "News", count: 0, icon: "📰", color: "bg-yellow-500" },
    { name: "Marketing", count: 0, icon: "📈", color: "bg-red-500" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value })); // [2, 7, 9]
    setError(null); // Clear errors on input change
    setSuccess(null); // Clear success message on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("token"); // Retrieve token from local storage [11, 14]

    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        url: formData.url,
        title: formData.title,
        description: formData.description || undefined, // Optional field
        category: formData.category || undefined, // Optional field
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0), // Convert comma-separated string to array
      };

      const res = await fetch("http://localhost:8080/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}` // [11, 12, 14, 15]
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        // Attempt to parse error as JSON if possible, otherwise use raw text
        try {
          const errData = JSON.parse(errText);
          setError(errData.message || "Failed to add bookmark.");
        } catch (parseError) {
          setError(errText || "Failed to add bookmark.");
        }
        return;
      }

      const newBookmark = await res.json();
      setSuccess(`Bookmark "${newBookmark.title}" added successfully!`);
      // Optionally clear the form after successful submission
      setFormData({
        url: '',
        title: '',
        description: '',
        category: '',
        tags: '',
      });
    } catch (err) {
      console.error("Network error adding bookmark: ", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        categories={predefinedCategories} // Pass a relevant category list to the sidebar
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

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-2xl mx-auto mt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Add New Bookmark</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-400 text-white" // [3, 4, 10]
                placeholder="https://example.com/awesome-resource"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-400 text-white"
                placeholder="A concise title for your bookmark"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-400 text-white"
                placeholder="A brief summary of the content"
              ></textarea>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">
                Category (Optional)
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white appearance-none pr-8"
              >
                <option value="">Select a category</option>
                {predefinedCategories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-slate-300 mb-1">
                Tags (Optional, comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-400 text-white"
                placeholder="e.g., react, javascript, frontend"
              />
            </div>

            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900 bg-opacity-30 border border-green-700 text-green-300 p-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Bookmark...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Bookmark
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookmarkPage;
