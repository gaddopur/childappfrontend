import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import App from './App';                // your existing homepage
import MathTutor from './MathTutor';    // new page #1
import BookSummarizer from './BookSummarizer'; // new page #2
import SchoolBookSummary from './SchoolBookSummary';

export default function Router() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 10, borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: 10 }}>Home</Link>
        <Link to="/math" style={{ marginRight: 10 }}>Math Tutor</Link>
        <Link to="/summarizer">Book Summarizer</Link>
        <Link to="/school-summary" style={{ marginLeft: 10 }}>School Summary</Link>
      </nav>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/math" element={<MathTutor />} />
        <Route path="/summarizer" element={<BookSummarizer />} />
        <Route path="/school-summary" element={<SchoolBookSummary />} />
      </Routes>
    </BrowserRouter>
  );
}
