// components/profile/ProfileSidebar.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
// FIX: Added BookOpen to the import list
import { User, Mail, Calendar, LogOut, Settings, Key, Menu, X, BookOpen, LayoutDashboard } from "lucide-react";
import Link from "next/link";

// --- ProfileSidebar Component ---
interface ProfileSidebarProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  isExpanded,
  onToggleExpand,
  activeSection,
  setActiveSection,
  onLogout,
}) => {
  const sidebarVariants = {
    expanded: { width: "16rem" }, // 256px
    collapsed: { width: "4rem" }, // 64px
  };

  const navItemVariants = {
    expanded: { opacity: 1, x: 0, display: "block" },
    collapsed: { opacity: 0, x: -10, transitionEnd: { display: "none" } },
  };

  return (
    <motion.div
      initial={false}
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 h-full bg-white/95 backdrop-blur-md border-r border-indigo-100 text-slate-700 shadow-lg z-30 flex flex-col pt-4" // Consistent with Navbar/Dashboard Sidebar
    >
      {/* Top section with Logo/Toggle (aligned with dashboard) */}
      <div className="px-4 py-3 flex items-center justify-between">
        {isExpanded && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Markly</span>
          </div>
        )}
        <button
          onClick={onToggleExpand}
          className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          aria-label={isExpanded ? "Collapse profile sidebar" : "Expand profile sidebar"}
        >
          {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <nav className="space-y-2">
          <motion.div
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              activeSection === "overview" ? "bg-indigo-100 text-indigo-800 font-semibold" : "hover:bg-indigo-50 text-indigo-700"
            }`}
            onClick={() => setActiveSection("overview")}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <motion.span
              variants={navItemVariants}
              animate={isExpanded ? "expanded" : "collapsed"}
              transition={{ duration: 0.1, delay: isExpanded ? 0.1 : 0 }}
              className="ml-3 whitespace-nowrap"
            >
              Overview
            </motion.span>
          </motion.div>

          <motion.div
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              activeSection === "settings" ? "bg-indigo-100 text-indigo-800 font-semibold" : "hover:bg-indigo-50 text-indigo-700"
            }`}
            onClick={() => setActiveSection("settings")}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <motion.span
              variants={navItemVariants}
              animate={isExpanded ? "expanded" : "collapsed"}
              transition={{ duration: 0.1, delay: isExpanded ? 0.1 : 0 }}
              className="ml-3 whitespace-nowrap"
            >
              Account Settings
            </motion.span>
          </motion.div>

          <motion.div
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              activeSection === "security" ? "bg-indigo-100 text-indigo-800 font-semibold" : "hover:bg-indigo-50 text-indigo-700"
            }`}
            onClick={() => setActiveSection("security")}
          >
            <Key className="w-5 h-5 flex-shrink-0" />
            <motion.span
              variants={navItemVariants}
              animate={isExpanded ? "expanded" : "collapsed"}
              transition={{ duration: 0.1, delay: isExpanded ? 0.1 : 0 }}
              className="ml-3 whitespace-nowrap"
            >
              Security
            </motion.span>
          </motion.div>

          {/* Back to Dashboard Link */}
          <Link href="/app" passHref className="block">
            <motion.div
              className="flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-indigo-50 text-indigo-700"
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <motion.span
                variants={navItemVariants}
                animate={isExpanded ? "expanded" : "collapsed"}
                transition={{ duration: 0.1, delay: isExpanded ? 0.1 : 0 }}
                className="ml-3 whitespace-nowrap"
              >
                Back to Dashboard
              </motion.span>
            </motion.div>
          </Link>

        </nav>
      </div>

      <div className="p-4 border-t border-indigo-100">
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center justify-start p-3 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <motion.span
            variants={navItemVariants}
            animate={isExpanded ? "expanded" : "collapsed"}
            transition={{ duration: 0.1, delay: isExpanded ? 0.1 : 0 }}
            className="ml-3 whitespace-nowrap"
          >
            Logout
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProfileSidebar;
