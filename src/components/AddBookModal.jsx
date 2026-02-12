import { useState, useRef } from 'react';
import { Plus, BookOpen, X, Camera, Loader2, Search } from 'lucide-react';
import Tesseract from 'tesseract.js';

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

/**
 * Preprocess image for better OCR: grayscale + high contrast
 */
function preprocessForOCR(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Use higher resolution for OCR
                const scale = Math.min(1600 / img.width, 1600 / img.height, 1);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Convert to grayscale and boost contrast
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    // Grayscale
                    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    // Contrast boost
                    const boosted = Math.min(255, Math.max(0, (gray - 128) * 1.5 + 128));
                    data[i] = data[i + 1] = data[i + 2] = boosted;
                }
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Extract useful keywords from OCR text, filtering noise.
 */
function extractKeywords(text) {
    const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 2);

    // Filter common cover noise
    const noise = /^(new york times|bestseller|best seller|#1|national|international|a novel|a memoir|introduction|foreword|winner|award|edition|revised|updated|million copies|isbn|copyright|\d{10,})/i;
    const cleaned = lines.filter((l) => !noise.test(l));

    // Take the most substantial lines (likely title + author)
    const sorted = cleaned
        .filter((l) => /[a-zA-Z]{2,}/.test(l))
        .slice(0, 5);

    return sorted.join(' ').replace(/[^a-zA-Z0-9\s'-]/g, '').trim();
}

/**
 * Search Google Books API for a query string.
 * Returns { title, author } or nulls.
 */
async function searchGoogleBooks(query) {
    if (!query || query.length < 3) return null;

    try {
        const encoded = encodeURIComponent(query);
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encoded}&maxResults=3`);
        if (!res.ok) return null;

        const data = await res.json();
        if (!data.items || data.items.length === 0) return null;

        // Return the first result's info
        const info = data.items[0].volumeInfo;
        return {
            title: info.title || '',
            author: info.authors ? info.authors.join(', ') : '',
            pages: info.pageCount || null,
        };
    } catch {
        return null;
    }
}

export default function AddBookModal({ onAdd, onClose }) {
    const [form, setForm] = useState({
        title: '',
        author: '',
        totalPages: '',
    });
    const [coverImage, setCoverImage] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [scanStatus, setScanStatus] = useState('');
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.totalPages) return;
        onAdd({ ...form, coverImage });
        onClose();
    };

    const handlePhoto = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Compress and show image immediately
        const compressed = await compressImage(file);
        setCoverImage(compressed);

        // Only scan if title is empty
        if (!form.title.trim()) {
            setScanning(true);
            setScanStatus('Reading cover…');
            try {
                // Preprocess for better OCR
                const processedCanvas = await preprocessForOCR(file);

                setScanStatus('Scanning text…');
                const result = await Tesseract.recognize(processedCanvas, 'eng', {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            const pct = Math.round((m.progress || 0) * 100);
                            setScanStatus(`Scanning… ${pct}%`);
                        }
                    },
                });

                const keywords = extractKeywords(result.data.text);

                if (keywords) {
                    setScanStatus('Looking up book…');
                    const bookInfo = await searchGoogleBooks(keywords);

                    if (bookInfo) {
                        setForm((prev) => ({
                            ...prev,
                            title: prev.title || bookInfo.title,
                            author: prev.author || bookInfo.author,
                            totalPages: prev.totalPages || (bookInfo.pages ? String(bookInfo.pages) : ''),
                        }));
                    } else {
                        // Fallback: use raw OCR lines
                        const lines = result.data.text
                            .split('\n')
                            .map((l) => l.trim())
                            .filter((l) => l.length > 2 && /[a-zA-Z]{2,}/.test(l));
                        if (lines.length > 0) {
                            setForm((prev) => ({
                                ...prev,
                                title: prev.title || lines[0],
                                author: prev.author || (lines.length > 1 ? lines[1] : ''),
                            }));
                        }
                    }
                }
            } catch (err) {
                console.warn('OCR/lookup failed:', err);
            } finally {
                setScanning(false);
                setScanStatus('');
            }
        }
    };

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
                                {/* Scanning Overlay */}
                                {scanning && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-2">
                                        <Loader2 size={24} className="text-primary-light animate-spin" />
                                        <span className="text-sm text-white/80 font-medium">{scanStatus}</span>
                                    </div>
                                )}
                                {/* Hover Controls */}
                                {!scanning && (
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
                                )}
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-36 border-2 border-dashed border-white/15 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                            >
                                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/15 transition-colors">
                                    <Camera size={24} className="text-muted group-hover:text-primary-light transition-colors" />
                                </div>
                                <span className="text-sm text-muted group-hover:text-white/70 transition-colors">
                                    Snap a cover to auto-fill title & author
                                </span>
                            </button>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Book Title
                            {scanning && <span className="text-xs text-primary-light ml-2 animate-pulse">scanning…</span>}
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. The Daily Laws"
                            className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Author
                            {scanning && <span className="text-xs text-primary-light ml-2 animate-pulse">scanning…</span>}
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
                            {scanning && <span className="text-xs text-primary-light ml-2 animate-pulse">scanning…</span>}
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
                        disabled={!form.title.trim() || !form.totalPages || scanning}
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
