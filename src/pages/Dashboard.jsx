import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Plus,
    Clock,
    Star,
    TrendingUp,
    Library,
    CheckCircle2,
} from 'lucide-react';
import AddBookModal from '../components/AddBookModal';
import CircularGallery from '../components/CircularGallery';

// Generate a book cover image as a data URL
function generateBookCover(title, author, coverColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, coverColor || '#3b2f6b');
    gradient.addColorStop(1, '#0d0d1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Decorative circles
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(650, 100, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(150, 500, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Spine accent line
    ctx.fillStyle = coverColor || '#7c5cbf';
    ctx.fillRect(40, 60, 6, 480);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    const words = title.split(' ');
    let line = '';
    let y = 200;
    for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > 640 && line) {
            ctx.fillText(line.trim(), 80, y);
            line = word + ' ';
            y += 52;
        } else {
            line = test;
        }
    }
    ctx.fillText(line.trim(), 80, y);

    // Author
    if (author) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '24px Inter, system-ui, sans-serif';
        ctx.fillText(author, 80, y + 60);
    }

    // Star rating icon at bottom
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '28px sans-serif';
    ctx.fillText('★★★★★', 80, 540);

    return canvas.toDataURL('image/png');
}

export default function Dashboard({
    books,
    addBook,
    getProgress,
    getCurrentPage,
    getReadingDays,
}) {
    const [showAdd, setShowAdd] = useState(false);
    const navigate = useNavigate();

    const activeBooks = books.filter((b) => !b.dateFinished);
    const finishedBooks = books.filter((b) => b.dateFinished);
    const totalEntries = books.reduce((sum, b) => sum + b.entries.length, 0);

    // Build gallery items for finished books
    const galleryItems = useMemo(() => {
        return finishedBooks.map((book) => ({
            image: generateBookCover(book.title, book.author, book.coverColor),
            text: book.title,
        }));
    }, [finishedBooks]);

    const showGallery = finishedBooks.length >= 3;

    return (
        <div className="app-shell">
            {/* Fixed Header */}
            <header className="app-header">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <Library size={22} className="text-primary-light" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">BookMarked</h1>
                            <p className="text-xs text-muted hidden sm:block">Track your reading journey</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Add Book</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </header>

            <div className="app-content">
                <main className="max-w-3xl mx-auto px-4 pt-6 pb-12">
                    {/* Stats Cards */}
                    {books.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <StatCard
                                icon={<BookOpen size={18} />}
                                label="Reading"
                                value={activeBooks.length}
                                color="primary"
                            />
                            <StatCard
                                icon={<CheckCircle2 size={18} />}
                                label="Finished"
                                value={finishedBooks.length}
                                color="accent"
                            />
                            <StatCard
                                icon={<TrendingUp size={18} />}
                                label="Entries"
                                value={totalEntries}
                                color="star"
                            />
                        </div>
                    )}

                    {/* Currently Reading */}
                    {activeBooks.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
                                Currently Reading
                            </h2>
                            <div className="space-y-3">
                                {activeBooks.map((book) => (
                                    <BookCard
                                        key={book.id}
                                        book={book}
                                        progress={getProgress(book)}
                                        currentPage={getCurrentPage(book)}
                                        readingDays={getReadingDays(book)}
                                        onClick={() => navigate(`/book/${book.id}`)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Finished Books — Circular Gallery (3+ books) */}
                    {showGallery && (
                        <section className="mb-8">
                            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-accent" />
                                Finished — Scroll to explore
                            </h2>
                            <div
                                style={{ height: '500px', position: 'relative' }}
                                className="rounded-2xl overflow-hidden border border-white/5 bg-surface-raised"
                            >
                                <CircularGallery
                                    items={galleryItems}
                                    bend={1}
                                    textColor="#ffffff"
                                    borderRadius={0.05}
                                    scrollSpeed={2}
                                    scrollEase={0.05}
                                />
                            </div>
                            {/* Clickable list below gallery for navigation */}
                            <div className="mt-3 space-y-2">
                                {finishedBooks.map((book) => (
                                    <button
                                        key={book.id}
                                        onClick={() => navigate(`/book/${book.id}`)}
                                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 bg-surface-raised/50 border border-white/5 rounded-xl hover:border-accent/30 transition-all cursor-pointer group"
                                    >
                                        <div
                                            className="w-1.5 h-8 rounded-full shrink-0"
                                            style={{ backgroundColor: book.coverColor }}
                                        />
                                        <span className="font-medium text-sm truncate flex-1 group-hover:text-accent-light transition-colors">
                                            {book.title}
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    size={10}
                                                    className={
                                                        s <= (book.rating || 0)
                                                            ? 'text-star fill-star'
                                                            : 'text-muted/20'
                                                    }
                                                />
                                            ))}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Finished Books — Card List (fewer than 3) */}
                    {!showGallery && finishedBooks.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
                                Finished
                            </h2>
                            <div className="space-y-3">
                                {finishedBooks.map((book) => (
                                    <FinishedBookCard
                                        key={book.id}
                                        book={book}
                                        readingDays={getReadingDays(book)}
                                        onClick={() => navigate(`/book/${book.id}`)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Empty State */}
                    {books.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="p-5 bg-primary/10 rounded-2xl mb-6">
                                <BookOpen size={48} className="text-primary-light" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Start Your Journey</h2>
                            <p className="text-muted text-sm max-w-xs mb-6">
                                Add your first book and begin tracking your reading progress and
                                thoughts.
                            </p>
                            <button
                                onClick={() => setShowAdd(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl transition-all cursor-pointer"
                            >
                                <Plus size={18} />
                                Add Your First Book
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {showAdd && (
                <AddBookModal
                    onAdd={(book) => addBook(book)}
                    onClose={() => setShowAdd(false)}
                />
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    const colorMap = {
        primary: 'bg-primary/15 text-primary-light',
        accent: 'bg-accent/15 text-accent-light',
        star: 'bg-star/15 text-star',
    };

    return (
        <div className="bg-surface-raised border border-white/5 rounded-xl p-4">
            <div className={`inline-flex p-2 rounded-lg ${colorMap[color]} mb-2`}>
                {icon}
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted">{label}</p>
        </div>
    );
}

function BookCard({ book, progress, currentPage, readingDays, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-surface-raised border border-white/5 rounded-2xl p-4 hover:border-primary/30 transition-all cursor-pointer group"
        >
            <div className="flex gap-4">
                {/* Book Cover Spine */}
                <div
                    className="w-2 h-full min-h-[80px] rounded-full shrink-0"
                    style={{ backgroundColor: book.coverColor }}
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-primary-light transition-colors truncate">
                        {book.title}
                    </h3>
                    {book.author && (
                        <p className="text-sm text-muted mt-0.5">{book.author}</p>
                    )}

                    {/* Progress Bar */}
                    <div className="mt-3 mb-2">
                        <div className="flex justify-between text-xs text-muted mb-1.5">
                            <span>
                                Page {currentPage} of {book.totalPages}
                            </span>
                            <span className="font-medium text-white">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${progress}%`,
                                    background: `linear-gradient(90deg, ${book.coverColor}, oklch(0.7 0.18 260))`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {readingDays} day{readingDays !== 1 ? 's' : ''}
                        </span>
                        <span>{book.entries.length} entries</span>
                    </div>
                </div>
            </div>
        </button>
    );
}

function FinishedBookCard({ book, readingDays, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-surface-raised border border-white/5 rounded-2xl p-4 hover:border-accent/30 transition-all cursor-pointer group opacity-80 hover:opacity-100"
        >
            <div className="flex gap-4">
                <div
                    className="w-2 h-full min-h-[60px] rounded-full shrink-0"
                    style={{ backgroundColor: book.coverColor }}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">{book.title}</h3>
                        <CheckCircle2 size={16} className="text-accent shrink-0" />
                    </div>
                    {book.author && (
                        <p className="text-sm text-muted mt-0.5">{book.author}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                        <span className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    size={12}
                                    className={
                                        s <= (book.rating || 0)
                                            ? 'text-star fill-star'
                                            : 'text-muted/30'
                                    }
                                />
                            ))}
                        </span>
                        <span>{readingDays} days</span>
                        <span>{book.entries.length} entries</span>
                    </div>
                </div>
            </div>
        </button>
    );
}
