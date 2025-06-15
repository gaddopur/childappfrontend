// b/src/MathTutor.js
import React, { useState } from 'react';
import { solverMathProblem } from './Api';
import axios from "axios";

export default function MathTutor() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const start = performance.now();              
      const data = await solverMathProblem(query);
      const took = ((performance.now() - start) / 1000).toFixed(2);
      setLatency(took);
      axios.post('http://localhost:8000/metrics/latency/', {
        page: 'home',
        latency: parseFloat(took),
        timestamp: new Date().toISOString()
      }).catch(console.error); 
      setResponse(data.response);
    } catch (err) {
      console.error(err);
      setResponse('Error: could not fetch response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, position: 'relative' }}>
      {latency && <div className="latency-badge">Latency: {latency}s</div>}
      <h1>Math Tutor</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter math problem..."
        />
        <button type="submit">Solve</button>
      </form>
      {loading
        ? <p>Loading…</p>
        : (
            <>
              <p>Answer: {response}</p>
              {latency && <p style={{ fontSize: '0.9em', color: '#666' }}>
                (Latency: {latency}s)
              </p>}
            </>
          )
      }
    </div>
  );
}
