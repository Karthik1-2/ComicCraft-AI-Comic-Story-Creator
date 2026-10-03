import React, { useState } from 'react';
import { ComicData, Genre } from '../types.ts';
import { ComicCard } from '../components/ComicCard.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { Search, PlusCircle, BookOpen, Filter, Zap } from 'lucide-react';

interface MyComicsPageProps {
  comics: ComicData[];
  onOpenComic: (comic: ComicData) => void;
  onDeleteComic: (id: string) => void;
  onCreateNew: () => void;
  onLoadDemo: () => void;
}

export const MyComicsPage: React.FC<MyComicsPageProps> = ({
  comics,
  onOpenComic,
  onDeleteComic,
  onCreateNew,
  onLoadDemo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [comicToDelete, setComicToDelete] = useState<string | null>(null);

  const filteredComics = comics.filter(comic => {
    const matchesSearch =
      comic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comic.originalPrompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comic.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGenre = selectedGenre === 'All' || comic.genre === selectedGenre;

    return matchesSearch && matchesGenre;
  });

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setComicToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (comicToDelete) {
      onDeleteComic(comicToDelete);
      setComicToDelete(null);
    }
  };

  const allGenres = ['All', 'Comedy', 'Action', 'Adventure', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Mystery', 'Drama'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bangers text-4xl sm:text-5xl text-white tracking-wide drop-shadow-[3px_3px_0px_#000]">
            My Comics Library
          </h1>
          <p className="font-comic text-xs sm:text-sm text-slate-400 mt-1">
            Browse, open, edit, and export your saved comic creations
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bangers text-base tracking-wide bg-amber-400 hover:bg-amber-300 text-black border-2 border-black shadow-[3px_3px_0px_#000] transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-black" />
          <span>CREATE NEW COMIC</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search comics by title or plot idea..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-hidden"
          />
        </div>

        {/* Genre Filter Scroll/Dropdown */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-500 shrink-0 mr-1" />
          {allGenres.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedGenre === g
                  ? 'bg-amber-400 text-black border border-black shadow-[1.5px_1.5px_0px_#000]'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Comics Grid */}
      {filteredComics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComics.map(comic => (
            <ComicCard
              key={comic.id || comic._id}
              comic={comic}
              onOpen={onOpenComic}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-900/60 border-4 border-dashed border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-400/40 mx-auto flex items-center justify-center text-amber-400">
            <BookOpen className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bangers text-2xl text-white tracking-wide">
              {searchTerm || selectedGenre !== 'All' ? 'No Matching Comics Found' : 'No Saved Comics Yet'}
            </h3>
            <p className="font-comic text-xs text-slate-400 leading-relaxed">
              {searchTerm || selectedGenre !== 'All'
                ? 'Try clearing your search query or selecting another genre filter.'
                : 'Start turning your story ideas into full multi-panel comics with Gemini.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bangers text-sm tracking-wide bg-amber-400 hover:bg-amber-300 text-black border-2 border-black shadow-[3px_3px_0px_#000] transition-all"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>CREATE FIRST COMIC</span>
            </button>

            <button
              onClick={onLoadDemo}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-amber-300 bg-amber-950/60 border border-amber-500/40 hover:bg-amber-900/60 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Load "The Late Student" Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={comicToDelete !== null}
        title="Delete Comic Book?"
        message="Are you sure you want to permanently delete this comic from your library? This action cannot be undone."
        confirmLabel="Permanently Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setComicToDelete(null)}
      />
    </div>
  );
};
