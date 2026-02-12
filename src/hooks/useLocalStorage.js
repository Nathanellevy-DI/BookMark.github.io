import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'book-tracker-data';

const getInitialData = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse localStorage data:', e);
    }
    return { books: [] };
};

export function useLocalStorage() {
    const [data, setData] = useState(getInitialData);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }, [data]);

    const addBook = useCallback((book) => {
        const newBook = {
            id: crypto.randomUUID(),
            title: book.title,
            author: book.author,
            totalPages: Number(book.totalPages),
            coverColor: book.coverColor || generateCoverColor(),
            coverImage: book.coverImage || null,
            dateStarted: new Date().toISOString(),
            dateFinished: null,
            rating: null,
            review: null,
            entries: [],
        };
        setData((prev) => ({ ...prev, books: [newBook, ...prev.books] }));
        return newBook.id;
    }, []);

    const updateBook = useCallback((id, updates) => {
        setData((prev) => ({
            ...prev,
            books: prev.books.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
    }, []);

    const deleteBook = useCallback((id) => {
        setData((prev) => ({
            ...prev,
            books: prev.books.filter((b) => b.id !== id),
        }));
    }, []);

    const addEntry = useCallback((bookId, entry) => {
        const newEntry = {
            id: crypto.randomUUID(),
            page_number: Number(entry.page_number),
            note: entry.note,
            timestamp: new Date().toISOString(),
        };
        setData((prev) => ({
            ...prev,
            books: prev.books.map((b) =>
                b.id === bookId ? { ...b, entries: [newEntry, ...b.entries] } : b
            ),
        }));
    }, []);

    const deleteEntry = useCallback((bookId, entryId) => {
        setData((prev) => ({
            ...prev,
            books: prev.books.map((b) =>
                b.id === bookId
                    ? { ...b, entries: b.entries.filter((e) => e.id !== entryId) }
                    : b
            ),
        }));
    }, []);

    const finishBook = useCallback((id, rating, review) => {
        setData((prev) => ({
            ...prev,
            books: prev.books.map((b) =>
                b.id === id
                    ? { ...b, dateFinished: new Date().toISOString(), rating, review }
                    : b
            ),
        }));
    }, []);

    const getBook = useCallback(
        (id) => data.books.find((b) => b.id === id) || null,
        [data.books]
    );

    const getReadingDays = useCallback((book) => {
        if (!book) return 0;
        const start = new Date(book.dateStarted);
        const end = book.dateFinished ? new Date(book.dateFinished) : new Date();
        const diff = Math.abs(end - start);
        return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }, []);

    const getCurrentPage = useCallback((book) => {
        if (!book || !book.entries.length) return 0;
        return Math.max(...book.entries.map((e) => e.page_number));
    }, []);

    const getProgress = useCallback(
        (book) => {
            if (!book || !book.totalPages) return 0;
            const current = getCurrentPage(book);
            return Math.min(100, Math.round((current / book.totalPages) * 100));
        },
        [getCurrentPage]
    );

    return {
        books: data.books,
        addBook,
        updateBook,
        deleteBook,
        addEntry,
        deleteEntry,
        finishBook,
        getBook,
        getReadingDays,
        getCurrentPage,
        getProgress,
    };
}

function generateCoverColor() {
    const colors = ['#4338ca', '#0e7490', '#be185d', '#059669', '#d97706', '#7c3aed', '#0891b2', '#ca8a04'];
    return colors[Math.floor(Math.random() * colors.length)];
}

