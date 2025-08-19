import React from 'react';
import { BookOpen, Folder, Zap, TrendingUp, Sparkles, AlertCircle, Plus, Tags } from 'lucide-react';

interface CategoryForDisplay {
    id: string;
    name: string;
    count: number;
    icon: string;
    color: string;
}

interface Collection {
    id: string;
    name: string;
    count: number;
}

interface Tag {
    id: string;
    name: string;
    weeklyCount: number;
    prevCount: number;
    createdAt: string;
}

interface DashboardOverviewProps {
    totalBookmarksCount: number;
    categories: CategoryForDisplay[];
    collections: Collection[];
    tags: Tag[];
    onAddBookmarkClick: () => void;
    onCategorizeAll: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    totalBookmarksCount,
    categories,
    collections,
    tags,
    onAddBookmarkClick,
    onCategorizeAll,
}) => {
    const totalCategoriesCount = categories.length;
    const totalCollectionsCount = collections.length;
    const totalTagsCount = tags.length;

    const uncategorizedCount = totalBookmarksCount - categories.reduce((sum, cat) => sum + cat.count, 0);

    // Mock recent activity / AI suggestions for demo
    const recentActivity = [
        { type: 'bookmark', description: 'Saved "Getting Started with Tailwind CSS"', date: '2 hours ago' },
        { type: 'ai', description: 'AI categorized "Next.js Authentication Guide" into Development', date: '5 hours ago' },
        { type: 'collection', description: 'Added "React Hooks Cheatsheet" to "Frontend Dev"', date: 'yesterday' },
    ];

    const trendingTags = tags.sort((a, b) => b.weeklyCount - a.weeklyCount).slice(0, 5);

    return (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Key Stats & Quick Actions */}
            <div className="lg:col-span-2 space-y-8">
                {/* Welcome & Quick Actions */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-slate-700 shadow-lg">
                    <h2 className="text-3xl font-bold mb-3">Welcome back to Markly!</h2>
                    <p className="text-slate-300 text-lg mb-6">Your AI-powered knowledge hub awaits.</p>
                    <div className="flex gap-4">
                        <button
                            onClick={onAddBookmarkClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            New Bookmark
                        </button>
                        <button className="border border-slate-600 hover:border-slate-500 text-slate-300 px-6 py-3 rounded-lg transition-colors">
                            Explore Insights
                        </button>
                    </div>
                </div>

                {/* Stat Cards - Reimagined for overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                        <p className="text-slate-400 text-sm">Total Bookmarks</p>
                        <p className="text-3xl font-bold text-blue-400">{totalBookmarksCount.toLocaleString()}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                            <BookOpen className="w-4 h-4" /> Organized knowledge
                        </div>
                    </div>
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                        <p className="text-slate-400 text-sm">Categories</p>
                        <p className="text-3xl font-bold text-purple-400">{totalCategoriesCount.toLocaleString()}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                            <Folder className="w-4 h-4" /> AI-classified
                        </div>
                    </div>
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                        <p className="text-slate-400 text-sm">Collections</p>
                        <p className="text-3xl font-bold text-green-400">{totalCollectionsCount.toLocaleString()}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                            <Folder className="w-4 h-4" /> Custom groups
                        </div>
                    </div>
                     <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                        <p className="text-slate-400 text-sm">Total Tags</p>
                        <p className="text-3xl font-bold text-orange-400">{totalTagsCount.toLocaleString()}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                            <Tags className="w-4 h-4" /> Descriptive keywords
                        </div>
                    </div>
                </div>

                {/* AI Suggestions / Actionable Insights */}
                {uncategorizedCount > 0 && (
                    <div className="bg-blue-800/20 p-6 rounded-xl border border-blue-700 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-lg text-blue-300 mb-2">Uncategorized Bookmarks</h3>
                            <p className="text-slate-200 text-base mb-4">
                                You have <span className="font-bold text-blue-200">{uncategorizedCount}</span> bookmarks that aren't yet categorized.
                                Let AI organize them for you instantly!
                            </p>
                            <button
                                onClick={onCategorizeAll}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                                AI Categorize All
                            </button>
                        </div>
                    </div>
                )}

                {/* Recent Activity Stream */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="font-semibold text-xl mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                    {activity.type === 'bookmark' && <BookOpen className="w-4 h-4 text-blue-400" />}
                                    {activity.type === 'ai' && <Zap className="w-4 h-4 text-purple-400" />}
                                    {activity.type === 'collection' && <Folder className="w-4 h-4 text-green-400" />}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-300">{activity.description}</p>
                                    <p className="text-xs text-slate-500">{activity.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column - Personalized Insights & Trends */}
            <div className="lg:col-span-1 space-y-8">
                {/* Trending Tags/Topics */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="font-semibold text-xl mb-4">Your Trending Topics</h3>
                    <div className="space-y-3">
                        {trendingTags.length > 0 ? (
                            trendingTags.map((tag) => (
                                <div key={tag.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-orange-400" />
                                        <span className="text-slate-300">{tag.name}</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-400">
                                        {tag.weeklyCount} this week
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 text-sm">Start saving bookmarks to see your trends!</p>
                        )}
                    </div>
                </div>

                {/* AI Reading Suggestions (Conceptual) */}
                <div className="bg-purple-800/20 p-6 rounded-xl border border-purple-700">
                    <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        <h3 className="font-semibold text-xl text-purple-300">AI Reading Suggestions</h3>
                    </div>
                    <p className="text-sm opacity-90 mb-4">
                        Based on your recent activity, here are some interesting articles you might like from your saved bookmarks.
                    </p>
                    {/* Placeholder for actual suggestions */}
                    <div className="space-y-3">
                        <div className="bg-slate-800 p-3 rounded-lg">
                            <p className="font-medium text-sm">"Understanding Web3: A Deep Dive"</p>
                            <p className="text-xs text-slate-400">Related to 'Blockchain' category</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg">
                            <p className="font-medium text-sm">"Optimizing React Performance"</p>
                            <p className="text-xs text-slate-400">Related to 'Development' tag</p>
                        </div>
                    </div>
                    <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                        View All Suggestions
                    </button>
                </div>

                {/* Empty State for other insights */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center text-slate-400">
                    <h3 className="font-semibold text-xl mb-3">Looking for more?</h3>
                    <p className="text-sm">We'll provide deeper insights, usage analytics, and smart recommendations here as you save more.</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
