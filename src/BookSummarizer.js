// b/src/BookSummarizer.js
import React, { useState } from 'react';
import { summarizePdf, postLatencyMetric } from './Api';

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
    const start = performance.now();
    try {
      const data = await summarizePdf(file);
      const took = ((performance.now() - start) / 1000).toFixed(2);
      setLatency(took);

      // record latency (reuse your helper)
      postLatencyMetric('pdf_summarizer', parseFloat(took)).catch(console.error);

      // note: your DRF view returns { message: ..., content: summary }
      setSummary(data.content);
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
