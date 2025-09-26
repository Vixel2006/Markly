"use client";

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';
import AddBookmarkModal from '../dashboard/AddBookmarkModal';
import AddCategoryModal from '../dashboard/AddCategoryModal';
import AddCollectionModal from '../dashboard/AddCollectionModal';

const DashboardLayoutContent = ({ children, pageTitle }: { children: React.ReactNode, pageTitle: string }) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const {
        categories,
        collections,
        tags,
        handleAddBookmark,
        addBookmarkLoading,
        addBookmarkError,
        handleAddCategory,
        addCategoryLoading,
        addCategoryError,
        handleAddCollection,
        addCollectionLoading,
        addCollectionError,
        handleAddNewTag,
    } = useDashboard();

    const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);

    const [activePanel, setActivePanel] = useState("overview");

    const onAddBookmark = async (data) => {
        try {
            await handleAddBookmark(data);
            setIsAddBookmarkModalOpen(false);
        }
        catch (error: any) {
            console.error("Error adding bookmark from layout:", error);
        }
    }

    const onAddCategory = async (name: string, emoji: string) => {
        try {
            await handleAddCategory(name, emoji);
            setIsAddCategoryModalOpen(false);
        }
        catch (error: any) {
            console.error("Error adding category from layout:", error);
        }
    }

    const onAddCollection = async (name: string) => {
        try {
            await handleAddCollection(name);
            setIsAddCollectionModalOpen(false);
        }
        catch (error: any) {
            console.error("Error adding collection from layout:", error);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 flex relative">
            <Sidebar
                isExpanded={isSidebarExpanded}
                onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                activePanel={activePanel}
                setActivePanel={setActivePanel}
                categories={categories}
                collections={collections}
                tags={tags}
                onCategorySelect={() => {}}
                selectedCategoryId={null}
                onCollectionSelect={() => {}}
                selectedCollectionId={null}
                onTagSelect={() => {}}
                selectedTagId={null}
                onClearFilters={() => {}} // This should be handled by individual pages or a more global state if needed
                onAddCategoryClick={() => setIsAddCategoryModalOpen(true)}
                onAddCollectionClick={() => setIsAddCollectionModalOpen(true)}
            />
            <div className={`flex-1 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-16'}`}>
                <Header
                    isSidebarExpanded={isSidebarExpanded}
                    onSidebarToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    currentPageTitle={pageTitle}
                    onAddBookmarkClick={() => setIsAddBookmarkModalOpen(true)}
                />
                <main className="p-6 pt-20">
                    {children}
                </main>
            </div>
            <AnimatePresence>
                {isAddBookmarkModalOpen && (
                    <AddBookmarkModal
                        isOpen={isAddBookmarkModalOpen}
                        onClose={() => setIsAddBookmarkModalOpen(false)}
                        onAddBookmark={onAddBookmark}
                        isLoading={addBookmarkLoading}
                        error={addBookmarkError}
                        categories={categories}
                        collections={collections}
                        tags={tags}
                        onAddNewTag={handleAddNewTag}
                    />
                )}
                {isAddCategoryModalOpen && (
                    <AddCategoryModal
                        isOpen={isAddCategoryModalOpen}
                        onClose={() => setIsAddCategoryModalOpen(false)}
                        onAddCategory={onAddCategory}
                        isLoading={addCategoryLoading}
                        error={addCategoryError}
                    />
                )}
                {isAddCollectionModalOpen && (
                    <AddCollectionModal
                        isOpen={isAddCollectionModalOpen}
                        onClose={() => setIsAddCollectionModalOpen(false)}
                        onAddCollection={onAddCollection}
                        isLoading={addCollectionLoading}
                        error={addCollectionError}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const DashboardLayout = ({ children, pageTitle }: { children: React.ReactNode, pageTitle: string }) => {
    return (
        <DashboardProvider>
            <DashboardLayoutContent pageTitle={pageTitle}>
                {children}
            </DashboardLayoutContent>
        </DashboardProvider>
    );
};

export default DashboardLayout;
