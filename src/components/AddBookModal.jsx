import { useState } from 'react';
import { Plus, BookOpen, X } from 'lucide-react';

export default function AddBookModal({ onAdd, onClose }) {
    const [form, setForm] = useState({
        title: '',
        author: '',
        totalPages: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.totalPages) return;
        onAdd(form);
        onClose();
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
                className="bg-surface-raised border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-scale-in"
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
                            Cover Color
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
