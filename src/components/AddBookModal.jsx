import { useState, useRef } from 'react';
import { Plus, BookOpen, X, Camera, ImageIcon } from 'lucide-react';

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

export default function AddBookModal({ onAdd, onClose }) {
    const [form, setForm] = useState({
        title: '',
        author: '',
        totalPages: '',
    });
    const [coverImage, setCoverImage] = useState(null);
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
        const compressed = await compressImage(file);
        setCoverImage(compressed);
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
                                className="w-full h-36 border-2 border-dashed border-white/15 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                            >
                                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/15 transition-colors">
                                    <Camera size={24} className="text-muted group-hover:text-primary-light transition-colors" />
                                </div>
                                <span className="text-sm text-muted group-hover:text-white/70 transition-colors">
                                    Tap to take a photo or upload
                                </span>
                            </button>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Book Title
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
