import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const FileExplorer = ({ onFileSelect, onBasePath }) => {
  const [currentPath, setCurrentPath] = useState('');
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [basePath, setBasePath] = useState('');

  useEffect(() => {
    const fetchBasePath = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching base path from backend...");
        const response = await api.get('/querysolver/file-explorer/');
        
        console.log("Backend response:", response);
        
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        
        if (response.data.basePath) {
          const normalizedPath = response.data.basePath.replace(/\\/g, '/');
          console.log("Received base path:", normalizedPath);
          setBasePath(normalizedPath);
          if (onBasePath) onBasePath(normalizedPath);
          fetchContents('');
        } else {
          throw new Error("Base path not found in response");
        }
      } catch (err) {
        console.error('Error fetching base path:', err);
        
        let errorMessage = 'Failed to load base directory: ';
        if (err.code === 'ECONNABORTED') {
          errorMessage += 'Request timed out. Check if backend is running.';
        } else if (err.response) {
          errorMessage += `Server error: ${err.response.status} ${err.response.statusText}`;
        } else if (err.request) {
          errorMessage += 'No response received. Check your network connection.';
          console.log("Request object:", err.request);
        } else {
          errorMessage += err.message || 'Unknown error';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBasePath();
  }, [onBasePath]);

  const fetchContents = async (path) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching contents for path: ${path}`);
      const response = await api.get('/querysolver/file-explorer/', {
        params: { path }
      });
      
      console.log(`Received ${response.data.contents?.length} items`);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      setCurrentPath(path);
      setContents(response.data.contents || []);
    } catch (err) {
      console.error('Error fetching contents:', err);
      setError(`Failed to load directory contents: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate breadcrumb path segments
  const getPathSegments = () => {
    if (!currentPath) return [];
    return currentPath.split('/').filter(segment => segment);
  };

  return (
    <div>
      {/* Path breadcrumbs */}
      <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={() => fetchContents('')}
          style={{ marginRight: '5px', padding: '3px 8px' }}
        >
          🏠 Root
        </button>
        <div style={{ flex: 1, overflowX: 'auto', display: 'flex', alignItems: 'center' }}>
          {getPathSegments().map((segment, i, segments) => (
            <React.Fragment key={i}>
              <span style={{ margin: '0 5px' }}>/</span>
              <button 
                onClick={() => fetchContents(segments.slice(0, i+1).join('/'))}
                style={{ 
                  padding: '3px 6px',
                  background: i === segments.length - 1 ? '#e0f0ff' : 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {segment}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Directory contents */}
      {loading && <p style={{ textAlign: 'center', padding: '10px' }}>Loading...</p>}
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffeeee', 
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {contents.map((item, index) => (
            <div 
              key={index}
              onClick={() => {
                if (item.isDir) {
                  fetchContents(item.path);
                } else {
                  const fullPath = basePath + '/' + item.path;
                  onFileSelect({ path: fullPath, name: item.name });
                }
              }}
              style={{
                padding: '8px',
                cursor: 'pointer',
                backgroundColor: item.isDir ? '#f0f8ff' : '#fff',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                ':hover': {
                  backgroundColor: '#e6f7ff'
                }
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '1.2em' }}>
                {item.isDir ? '📁' : '📄'}
              </span>
              <div>
                <div>{item.name}</div>
                {!item.isDir && (
                  <div style={{ fontSize: '0.8em', color: '#666' }}>
                    {Math.round(item.size / 1024)} KB
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {contents.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No files or folders found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileExplorer;