// src/App.js
import React, { useState } from 'react';
import { fetchAIResponse } from './Api';

function App() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchAIResponse(query);
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

      {loading ? <p>Loading...</p> : <p>Response: {response}</p>}
    </div>
  );
}

export default App;
