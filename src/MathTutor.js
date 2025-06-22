// src/MathTutor.js
import React, { useState } from 'react';
import { solveMathExpression, postLatencyMetric } from './Api';

export default function MathTutor() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(null);

  // ← Add sessionId state
  const [sessionId, setSessionId] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const start = performance.now();

      // ← Pass sessionId in, unpack both result & session_id
      const { result, session_id } = await solveMathExpression(query, sessionId);

      const took = ((performance.now() - start) / 1000).toFixed(2);
      setLatency(took);

      // ← record your metric
      postLatencyMetric('math_tutor', parseFloat(took)).catch(console.error);

      // ← update sessionId for next turn
      setSessionId(session_id);

      // ← show the actual answer
      setResponse(result);

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
        <button type="submit" disabled={loading}>
          {loading ? 'Solving…' : 'Solve'}
        </button>
      </form>

      {!loading && response && (
        <>
          <p>Answer: {response}</p>
          {latency && (
            <p style={{ fontSize: '0.9em', color: '#666' }}>
              (Latency: {latency}s)
            </p>
          )}
        </>
      )}
    </div>
  );
}
