// b/src/App.js
import React, { useState } from 'react';
import { fetchAIResponse } from './Api';
import axios from 'axios';

function App() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('⏱️ handleSubmit fired');
      const start = performance.now();                // NEW
      const data = await fetchAIResponse(query);
      const took = ((performance.now() - start) / 1000).toFixed(2);
      console.log('⏱️ computed latency:', took);
      setLatency(took);
      axios.post('http://localhost:8000/metrics/latency/', {
        page: 'home',
        latency: parseFloat(took),
        timestamp: new Date().toISOString()
      }).catch(console.error);                              // NEW
      setResponse(data.response);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setResponse('Error: could not fetch response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {latency && <div className="latency-badge">Latency: {latency}s</div>}
      <h1>AI Chat</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask something..."
        />
        <button type="submit">Send</button>
      </form>

      {loading
        ? <p>Loading…</p>
        : (
            <>
              <p>Response: {response}</p>
              {latency && <p style={{ fontSize: '0.9em', color: '#666' }}>
                (Latency: {latency}s)
              </p>}
            </>
          )
      }
    </div>
  );
}

export default App;
