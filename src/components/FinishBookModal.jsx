import { useState } from 'react';
import { Star, X, Trophy } from 'lucide-react';

export default function FinishBookModal({ book, onFinish, onClose }) {
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [review, setReview] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) return;
        onFinish(book.id, rating, review);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 animate-in">
            <div
                className="bg-surface-raised border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-star/20 rounded-xl">
                            <Trophy size={20} className="text-star" />
                        </div>
                        <h2 className="text-xl font-bold">Finish Book</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <X size={20} className="text-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
                    <div className="text-center">
                        <p className="text-muted text-sm mb-1">Congratulations on finishing</p>
                        <p className="text-lg font-semibold">{book.title}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-3 text-center">
                            Rate this book
                        </label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    className="p-1 cursor-pointer transition-transform hover:scale-125"
                                >
                                    <Star
                                        size={32}
                                        className={`transition-colors ${star <= (hoveredStar || rating)
                                                ? 'text-star fill-star'
                                                : 'text-muted/30'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Brief Review
                        </label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="What did you think of this book?"
                            rows={3}
                            className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-star/50 transition-all resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={rating === 0}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-star/90 hover:bg-star disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-all cursor-pointer"
                    >
                        <Trophy size={18} />
                        Mark as Finished
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
