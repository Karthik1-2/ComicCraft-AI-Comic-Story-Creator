/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { CreateComicPage } from './pages/CreateComicPage.tsx';
import { ComicViewPage } from './pages/ComicViewPage.tsx';
import { MyComicsPage } from './pages/MyComicsPage.tsx';
import { ComicData } from './types.ts';
import * as api from './services/api.ts';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'comics' | 'viewer'>('home');
  const [comics, setComics] = useState<ComicData[]>([]);
  const [selectedComic, setSelectedComic] = useState<ComicData | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const loadComics = async () => {
    try {
      const list = await api.fetchComics();
      setComics(list);
    } catch (err) {
      console.warn('Could not load comics from backend:', err);
    }
  };

  useEffect(() => {
    loadComics();
  }, []);

  const handleOpenComic = (comic: ComicData) => {
    setSelectedComic(comic);
    setActiveTab('viewer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDemo = () => {
    const demo = comics.find(c => c.id === 'demo-the-late-student' || c.title === 'The Late Student') || comics[0];
    if (demo) {
      handleOpenComic(demo);
      showToast('Loaded demo comic: "The Late Student"', 'info');
    } else {
      setActiveTab('create');
    }
  };

  const handleComicGenerated = (newComic: ComicData) => {
    setComics(prev => [newComic, ...prev.filter(c => (c.id || c._id) !== (newComic.id || newComic._id))]);
    setSelectedComic(newComic);
    setActiveTab('viewer');
    showToast(`Comic "${newComic.title}" generated successfully with Gemini!`, 'success');
  };

  const handleUpdateComic = (updated: ComicData) => {
    setSelectedComic(updated);
    setComics(prev =>
      prev.map(c => ((c.id || c._id) === (updated.id || updated._id) ? updated : c))
    );
  };

  const handleDeleteComic = async (id: string) => {
    try {
      await api.deleteComic(id);
      setComics(prev => prev.filter(c => (c.id || c._id) !== id));
      if (selectedComic && (selectedComic.id === id || selectedComic._id === id)) {
        setSelectedComic(null);
        setActiveTab('comics');
      }
      showToast('Comic deleted successfully.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete comic.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={tab => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedCount={comics.length}
        onOpenDemo={comics.length > 0 ? handleOpenDemo : undefined}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            onCreateClick={() => setActiveTab('create')}
            onMyComicsClick={() => setActiveTab('comics')}
            onOpenDemo={handleOpenDemo}
            demoComic={comics.find(c => c.id === 'demo-the-late-student' || c.title === 'The Late Student') || comics[0] || null}
          />
        )}

        {activeTab === 'create' && (
          <CreateComicPage
            onComicGenerated={handleComicGenerated}
            onNavigateToComics={() => setActiveTab('comics')}
          />
        )}

        {activeTab === 'viewer' && selectedComic && (
          <ComicViewPage
            comic={selectedComic}
            onUpdateComic={handleUpdateComic}
            onBack={() => setActiveTab('comics')}
            onDeleteComic={handleDeleteComic}
            showToast={showToast}
          />
        )}

        {activeTab === 'comics' && (
          <MyComicsPage
            comics={comics}
            onOpenComic={handleOpenComic}
            onDeleteComic={handleDeleteComic}
            onCreateNew={() => setActiveTab('create')}
            onLoadDemo={handleOpenDemo}
          />
        )}
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] font-comic text-xs font-bold transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-black'
                : toast.type === 'error'
                ? 'bg-rose-500 text-white'
                : 'bg-amber-400 text-black'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="p-1 hover:opacity-75"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
