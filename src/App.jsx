import { HashRouter, Routes, Route } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';
import Dashboard from './pages/Dashboard';
import BookDetail from './pages/BookDetail';

export default function App() {
  const {
    books,
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
  } = useLocalStorage();

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              books={books}
              addBook={addBook}
              getProgress={getProgress}
              getCurrentPage={getCurrentPage}
              getReadingDays={getReadingDays}
            />
          }
        />
        <Route
          path="/book/:id"
          element={
            <BookDetail
              getBook={getBook}
              addEntry={addEntry}
              deleteEntry={deleteEntry}
              finishBook={finishBook}
              deleteBook={deleteBook}
              getProgress={getProgress}
              getCurrentPage={getCurrentPage}
              getReadingDays={getReadingDays}
            />
          }
        />
      </Routes>
    </HashRouter>
  );
}
