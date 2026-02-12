import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, BookOpen, X, Camera, Search, Loader2 } from 'lucide-react';

function compressImage(file, maxWidth = 600, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                const width = ratio < 1 ? img.width * ratio : img.width;
                const height = ratio < 1 ? img.height * ratio : img.height;
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function useBookSearch(query) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef(null);
    const timeoutRef = useRef(null);

    const search = useCallback((q) => {
        // Clear previous
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (abortRef.current) abortRef.current.abort();

        if (!q || q.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Debounce 400ms
        timeoutRef.current = setTimeout(async () => {
            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const encoded = encodeURIComponent(q.trim());
                const res = await fetch(
                    `https://www.googleapis.com/books/v1/volumes?q=${encoded}&maxResults=5&printType=books`,
                    { signal: controller.signal }
                );
                if (!res.ok) throw new Error('API error');
                const data = await res.json();

                const items = (data.items || []).map((item) => {
                    const info = item.volumeInfo;
                    return {
                        id: item.id,
                        title: info.title || '',
                        author: info.authors ? info.authors.join(', ') : '',
                        pages: info.pageCount || null,
                        thumbnail: info.imageLinks?.smallThumbnail || null,
                    };
                });

                setResults(items);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setResults([]);
                }
            } finally {
                setLoading(false);
            }
        }, 400);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    return { results, loading, search };
}

export default function AddBookModal({ onAdd, onClose }) {
    const [form, setForm] = useState({
        title: '',
        author: '',
        totalPages: '',
    });
    const [coverImage, setCoverImage] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const fileInputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const { results, loading, search } = useBookSearch();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.totalPages) return;
        onAdd({ ...form, coverImage });
        onClose();
    };

    const handlePhoto = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const compressed = await compressImage(file);
        setCoverImage(compressed);
    };

    const handleTitleChange = (e) => {
        const value = e.target.value;
        setForm({ ...form, title: value });
        search(value);
        setShowSuggestions(true);
    };

    const selectBook = (book) => {
        setForm({
            title: book.title,
            author: book.author,
            totalPages: book.pages ? String(book.pages) : form.totalPages,
        });
        setShowSuggestions(false);
    };

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const coverColors = [
        '#4338ca',
        '#0e7490',
        '#be185d',
        '#059669',
        '#d97706',
        '#7c3aed',
    ];
    const [selectedColor, setSelectedColor] = useState(coverColors[0]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 animate-in">
            <div
                className="bg-surface-raised border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <BookOpen size={20} className="text-primary-light" />
                        </div>
                        <h2 className="text-xl font-bold">Add New Book</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <X size={20} className="text-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-5">
                    {/* Cover Photo */}
                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Cover Photo
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhoto}
                            className="hidden"
                        />
                        {coverImage ? (
                            <div className="relative group">
                                <img
                                    src={coverImage}
                                    alt="Book cover"
                                    className="w-full h-48 object-cover rounded-xl border border-white/10"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/30 transition-colors cursor-pointer"
                                    >
                                        Retake
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCoverImage(null)}
                                        className="px-3 py-2 bg-danger/40 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-danger/60 transition-colors cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-28 border-2 border-dashed border-white/15 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                            >
                                <Camera size={20} className="text-muted group-hover:text-primary-light transition-colors" />
                                <span className="text-xs text-muted group-hover:text-white/70 transition-colors">
                                    Add cover photo (optional)
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Book Title with Search */}
                    <div className="relative" ref={suggestionsRef}>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Book Title
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={form.title}
                                onChange={handleTitleChange}
                                onFocus={() => results.length > 0 && setShowSuggestions(true)}
                                placeholder="Start typing to search…"
                                className="w-full px-4 py-3 pr-10 bg-surface border border-white/10 rounded-xl text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                autoFocus
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {loading ? (
                                    <Loader2 size={16} className="text-primary-light animate-spin" />
                                ) : (
                                    <Search size={16} className="text-muted/40" />
                                )}
                            </div>
                        </div>

                        {/* Search Suggestions Dropdown */}
                        {showSuggestions && results.length > 0 && (
                            <div className="absolute z-10 w-full mt-1.5 bg-surface-raised border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
                                {results.map((book) => (
                                    <button
                                        key={book.id}
                                        type="button"
                                        onClick={() => selectBook(book)}
                                        className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0"
                                    >
                                        {book.thumbnail ? (
                                            <img
                                                src={book.thumbnail}
                                                alt={book.title}
                                                className="w-8 h-12 object-cover rounded shrink-0"
                                            />
                                        ) : (
                                            <div className="w-8 h-12 bg-white/5 rounded shrink-0 flex items-center justify-center">
                                                <BookOpen size={12} className="text-muted/50" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-white truncate">
                                                {book.title}
                                            </p>
                                            <p className="text-xs text-muted truncate">
                                                {book.author}
                                                {book.pages && ` · ${book.pages} pages`}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Author
                        </label>
                        <input
                            type="text"
                            value={form.author}
                            onChange={(e) => setForm({ ...form, author: e.target.value })}
                            placeholder="e.g. Robert Greene"
                            className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Total Pages
                        </label>
                        <input
                            type="number"
                            value={form.totalPages}
                            onChange={(e) => setForm({ ...form, totalPages: e.target.value })}
                            placeholder="e.g. 366"
                            min="1"
                            className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Cover Color {coverImage && <span className="text-xs text-muted/50">(fallback)</span>}
                        </label>
                        <div className="flex gap-3">
                            {coverColors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setSelectedColor(c)}
                                    className={`w-10 h-10 rounded-xl cursor-pointer transition-all ${selectedColor === c
                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-raised scale-110'
                                        : 'hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!form.title.trim() || !form.totalPages}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all cursor-pointer"
                    >
                        <Plus size={18} />
                        Add Book
                    </button>
                </form>
            </div>

            <style>{`
        .animate-in { animation: fadeIn 0.2s ease-out; }
        .animate-scale-in { animation: scaleIn 0.25s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
        </div>
    );
}
