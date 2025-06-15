// b/src/BookSummarizer.js
import React, { useState } from 'react';
import axios from 'axios';

export default function BookSummarizer() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(null);

  const handleFileChange = e => setFile(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) return setSummary('Please choose a file first.');
    setLoading(true);
    let start = performance.now();
    const form = new FormData();
    form.append('file', file);

    try {
      const { data } = await axios.post(
        'http://localhost:8000/querysolver/pdf_summerizer/',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const took = ((performance.now() - start) / 1000).toFixed(2);
      setLatency(took);
      axios.post('http://localhost:8000/metrics/latency/', {
        page: 'home',           // use 'math' or 'summarizer' as appropriate
        latency: parseFloat(took),
        timestamp: new Date().toISOString()
      }).catch(console.error);
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      setSummary('Error: failed to summarize.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, position: 'relative' }}>
      {latency && <div className="latency-badge">Latency: {latency}s</div>}
      <h1>Book Summarizer</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.ppt" />
        <button type="submit">Upload & Summarize</button>
      </form>
      {loading ? <p>Processing...</p> : <pre style={{ whiteSpace: 'pre-wrap' }}>{summary}</pre>}
    </div>
  );
}
