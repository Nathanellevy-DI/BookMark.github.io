import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Send,
    Clock,
    BookOpen,
    Calendar,
    Trash2,
    Star,
    CheckCircle2,
    Flag,
    TrendingUp,
} from 'lucide-react';
import FinishBookModal from '../components/FinishBookModal';

export default function BookDetail({
    getBook,
    addEntry,
    deleteEntry,
    finishBook,
    deleteBook,
    getProgress,
    getCurrentPage,
    getReadingDays,
}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const book = getBook(id);

    const [pageNum, setPageNum] = useState('');
    const [note, setNote] = useState('');
    const [showFinish, setShowFinish] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!book) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted mb-4">Book not found</p>
                    <button
                        onClick={() => navigate('/')}
                        className="text-primary-light hover:underline cursor-pointer"
                    >
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    const progress = getProgress(book);
    const currentPage = getCurrentPage(book);
    const readingDays = getReadingDays(book);
    const isFinished = !!book.dateFinished;

    const handleAddEntry = (e) => {
        e.preventDefault();
        if (!pageNum || !note.trim()) return;
        addEntry(book.id, { page_number: pageNum, note: note.trim() });
        setPageNum('');
        setNote('');
    };

    const handleDelete = () => {
        deleteBook(book.id);
        navigate('/');
    };

    const formatDate = (iso) => {
        return new Date(iso).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (iso) => {
        return new Date(iso).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const formatFullDate = (iso) => {
        return new Date(iso).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    // Group entries by date
    const groupedEntries = book.entries.reduce((groups, entry) => {
        const date = new Date(entry.timestamp).toDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(entry);
        return groups;
    }, {});

    return (
        <div className="app-shell">
            {/* Fixed Header */}
            <header className="app-header">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-semibold truncate">{book.title}</h1>
                        <p className="text-xs text-muted truncate">{book.author}</p>
                    </div>
                    {isFinished && (
                        <span className="flex items-center gap-1 text-xs text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={12} />
                            Finished
                        </span>
                    )}
                </div>
            </header>

            <div className="app-content">
                <main className="max-w-3xl mx-auto px-4 pt-6 pb-12">
                    {/* Progress Section */}
                    <div className="bg-surface-raised border border-white/5 rounded-2xl p-5 mb-6">
                        <div className="flex items-start gap-4">
                            <div
                                className="w-3 h-20 rounded-full shrink-0"
                                style={{ backgroundColor: book.coverColor }}
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm text-muted">Progress</span>
                                    <span className="text-2xl font-bold">{progress}%</span>
                                </div>
                                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mb-4">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${progress}%`,
                                            background: `linear-gradient(90deg, ${book.coverColor}, oklch(0.7 0.18 260))`,
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <p className="text-lg font-semibold">
                                            {currentPage}
                                            <span className="text-xs text-muted font-normal">
                                                /{book.totalPages}
                                            </span>
                                        </p>
                                        <p className="text-xs text-muted">Pages</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold">{readingDays}</p>
                                        <p className="text-xs text-muted">
                                            Day{readingDays !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold">{book.entries.length}</p>
                                        <p className="text-xs text-muted">Entries</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Date info */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-4 text-xs text-muted">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={12} />
                                Started {formatDate(book.dateStarted)}
                            </span>
                            {isFinished && (
                                <span className="flex items-center gap-1.5">
                                    <Flag size={12} />
                                    Finished {formatDate(book.dateFinished)}
                                </span>
                            )}
                        </div>

                        {/* Rating & Review for finished books */}
                        {isFinished && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            size={18}
                                            className={
                                                s <= (book.rating || 0)
                                                    ? 'text-star fill-star'
                                                    : 'text-muted/30'
                                            }
                                        />
                                    ))}
                                </div>
                                {book.review && (
                                    <p className="text-sm text-muted italic">"{book.review}"</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Entry Form */}
                    {!isFinished && (
                        <form onSubmit={handleAddEntry} className="mb-6">
                            <div className="bg-surface-raised border border-white/5 rounded-2xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-1.5 bg-primary/15 rounded-lg">
                                        <BookOpen size={16} className="text-primary-light" />
                                    </div>
                                    <span className="text-sm font-medium">Log Your Progress</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                                    <input
                                        type="number"
                                        value={pageNum}
                                        onChange={(e) => setPageNum(e.target.value)}
                                        placeholder="Page #"
                                        min="1"
                                        max={book.totalPages}
                                        className="w-full sm:w-28 px-3 py-2.5 bg-surface border border-white/10 rounded-xl text-white text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <div className="flex gap-3 flex-1">
                                        <input
                                            type="text"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="What stood out to you?"
                                            className="flex-1 px-3 py-2.5 bg-surface border border-white/10 rounded-xl text-white text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!pageNum || !note.trim()}
                                            className="p-2.5 bg-primary hover:bg-primary-light disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-white transition-all cursor-pointer"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Timeline */}
                    {book.entries.length > 0 && (
                        <section>
                            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                                <TrendingUp size={14} />
                                Reading Timeline
                            </h2>
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/10" />

                                {Object.entries(groupedEntries).map(([date, entries]) => (
                                    <div key={date} className="mb-6">
                                        {/* Date Label */}
                                        <div className="flex items-center gap-3 mb-3 relative z-10">
                                            <div className="w-[31px] h-[31px] rounded-full bg-surface-overlay border border-white/10 flex items-center justify-center">
                                                <Calendar size={14} className="text-primary-light" />
                                            </div>
                                            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                                                {formatFullDate(date)}
                                            </span>
                                        </div>

                                        {/* Entries for this date */}
                                        <div className="ml-[15px] pl-6 border-l border-transparent space-y-2">
                                            {entries.map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="group bg-surface-raised border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all relative"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <span
                                                                    className="text-xs font-semibold px-2 py-0.5 rounded-md text-white"
                                                                    style={{
                                                                        backgroundColor: book.coverColor,
                                                                    }}
                                                                >
                                                                    p.{entry.page_number}
                                                                </span>
                                                                <span className="text-xs text-muted flex items-center gap-1">
                                                                    <Clock size={10} />
                                                                    {formatTime(entry.timestamp)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-white/80 leading-relaxed">
                                                                {entry.note}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => deleteEntry(book.id, entry.id)}
                                                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-danger/20 rounded-lg transition-all cursor-pointer"
                                                        >
                                                            <Trash2 size={14} className="text-danger" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Empty entries state */}
                    {book.entries.length === 0 && !isFinished && (
                        <div className="text-center py-12">
                            <div className="p-4 bg-primary/10 rounded-2xl inline-flex mb-4">
                                <BookOpen size={32} className="text-primary-light" />
                            </div>
                            <p className="text-muted text-sm">
                                No entries yet. Start logging your reading above!
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-8 flex gap-3">
                        {!isFinished && (
                            <button
                                onClick={() => setShowFinish(true)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-star/15 hover:bg-star/25 text-star font-medium rounded-xl transition-all cursor-pointer"
                            >
                                <Flag size={16} />
                                Finish Book
                            </button>
                        )}
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-danger/10 hover:bg-danger/20 text-danger font-medium rounded-xl transition-all cursor-pointer"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </main>
            </div>

            {/* Finish Modal */}
            {showFinish && (
                <FinishBookModal
                    book={book}
                    onFinish={finishBook}
                    onClose={() => setShowFinish(false)}
                />
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
                    <div className="bg-surface-raised border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
                        <div className="p-3 bg-danger/15 rounded-xl inline-flex mb-4">
                            <Trash2 size={24} className="text-danger" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Delete Book?</h3>
                        <p className="text-sm text-muted mb-6">
                            This will permanently delete "{book.title}" and all its entries.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2.5 bg-danger hover:bg-danger/80 text-white rounded-xl font-medium transition-all cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
