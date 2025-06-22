import React, { useState, useEffect, useCallback } from 'react';
import FileExplorer from './FileExplorer';
import api from './Api';

export default function SchoolBookSummary() {
  // State for options data
  const [boards, setBoards] = useState([]);
  
  // State for form selections
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // State for nested options
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [languages, setLanguages] = useState([]);

  // State for explorer view
  const [explorerVisible, setExplorerVisible] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [basePath, setBasePath] = useState('');
  
  // Shared state
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('explorer');
  const [error, setError] = useState('');
  
  // Wrap handleBasePath in useCallback to prevent unnecessary re-renders
  const handleBasePath = useCallback((path) => {
    setBasePath(path);
  }, []);

  // Fetch initial options for form
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setError('');
        const response = await api.get(
          'http://localhost:8000/querysolver/available-summary-options/'
        );
        
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        
        if (!response.data.boards) {
          throw new Error('Invalid response structure');
        }
        
        setBoards(response.data.boards);
      } catch (err) {
        console.error('Error fetching options:', err);
        
        const backendError = err.response?.data?.error;
        const errorMsg = backendError 
          ? `Backend error: ${backendError}`
          : 'Failed to load form options. Using file explorer instead.';
        
        setError(errorMsg);
        setActiveTab('explorer');
      }
    };

    fetchOptions();
  }, []);

  // Fetch nested options when selection changes
  useEffect(() => {
  const fetchNestedOptions = async () => {
    if (!selectedBoard && !selectedClass && !selectedSubject && 
        !selectedBook && !selectedChapter) return;
    
    try {
      setError('');
      
      // Build path based on current selections
      const pathParts = [
        selectedBoard,
        selectedClass,
        selectedSubject,
        selectedBook,
        selectedChapter
      ].filter(Boolean).join('/');
      
      const response = await api.get(
        'http://localhost:8000/querysolver/nested-options/',
        { params: { path: pathParts } }
      );
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Update appropriate state based on current selection level
      if (selectedBoard && !selectedClass) {
        setClasses(response.data.options || []);
      } 
      else if (selectedClass && !selectedSubject) {
        setSubjects(response.data.options || []);
      } 
      else if (selectedSubject && !selectedBook) {
        setBooks(response.data.options || []);
      } 
      else if (selectedBook && !selectedChapter) {
        setChapters(response.data.options || []);
      } 
      else if (selectedChapter) { // Removed selectedLanguage check
        setLanguages(response.data.options || []);
      }
    } catch (err) {
      console.error('Error fetching nested options:', err);
      setError(`Error loading options: ${err.message}`);
    }
  };

  fetchNestedOptions();
}, [selectedBoard, selectedClass, selectedSubject, selectedBook, selectedChapter]);

  // Reset lower levels when higher level changes
  useEffect(() => {
    if (selectedBoard) {
      setClasses([]);
      setSubjects([]);
      setBooks([]);
      setChapters([]);
      setLanguages([]);
      setSelectedClass('');
      setSelectedSubject('');
      setSelectedBook('');
      setSelectedChapter('');
      setSelectedLanguage('');
    }
  }, [selectedBoard]);

  useEffect(() => {
    if (selectedClass) {
      setSubjects([]);
      setBooks([]);
      setChapters([]);
      setLanguages([]);
      setSelectedSubject('');
      setSelectedBook('');
      setSelectedChapter('');
      setSelectedLanguage('');
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSubject) {
      setBooks([]);
      setChapters([]);
      setLanguages([]);
      setSelectedBook('');
      setSelectedChapter('');
      setSelectedLanguage('');
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedBook) {
      setChapters([]);
      setLanguages([]);
      setSelectedChapter('');
      setSelectedLanguage('');
    }
  }, [selectedBook]);

  useEffect(() => {
    if (selectedChapter) {
      setLanguages([]);
      setSelectedLanguage('');
    }
  }, [selectedChapter]);

  // Handle file selection from explorer
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    fetchSummary(file.path);
  };

  // Fetch summary from file path
  const fetchSummary = async (filePath) => {
    setLoading(true);
    setSummary('');
    setError('');
    
    try {
      if (!basePath) {
        throw new Error('Base path not loaded yet');
      }
      
      // Extract relative path
      const relativePath = filePath.replace(basePath, '').replace(/^[\\/]/, '');
      const pathParts = relativePath.split(/[\\/]/);
      
      // Ensure we have enough path segments
      if (pathParts.length < 6) {
        throw new Error(`Invalid file path structure: ${relativePath} (${pathParts.length} parts)`);
      }
      
      const params = {
        board: pathParts[0],
        class: pathParts[1],
        subject: pathParts[2],
        book_name: pathParts[3],
        chapter: pathParts[4],
        lang: pathParts[5],
        file: pathParts[6]
      };
      
      console.log("Sending params to summary endpoint:", params);
      
      const response = await api.get(
        'http://localhost:8000/querysolver/school-book-summary/', 
        { params }
      );
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      setSummary(response.data.summary);
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError(`Error: Could not fetch the summary. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Form handler
  const handleFetchSummary = async () => {
    if (!selectedBoard || !selectedClass || !selectedSubject || 
        !selectedBook || !selectedChapter || !selectedLanguage) {
      setError('Please select all fields.');
      return;
    }

    setLoading(true);
    setSummary('');
    setError('');
    setSelectedFile(null);

    try {
      const params = {
        board: selectedBoard,
        class: selectedClass,
        subject: selectedSubject,
        book_name: selectedBook,
        chapter: selectedChapter,
        lang: selectedLanguage,
      };

      console.log("Sending form params to summary endpoint:", params);
      
      const response = await api.get(
        'http://localhost:8000/querysolver/school-book-summary/', 
        { params }
      );
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      setSummary(response.data.summary);
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError(`Error: Could not fetch the summary. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>School Book Summary</h1>
      
      {/* Tab selector */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '20px',
        borderBottom: '1px solid #ddd'
      }}>
        <button 
          onClick={() => setActiveTab('explorer')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'explorer' ? '#4CAF50' : 'transparent',
            color: activeTab === 'explorer' ? 'white' : '#333',
            border: 'none',
            cursor: 'pointer',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px'
          }}
        >
          File Explorer
        </button>
        <button 
          onClick={() => setActiveTab('form')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'form' ? '#4CAF50' : 'transparent',
            color: activeTab === 'form' ? 'white' : '#333',
            border: 'none',
            cursor: 'pointer',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px'
          }}
        >
          Form Selection
        </button>
      </div>
      
      {/* Error display */}
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffeeee', 
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      {/* Explorer Tab */}
      {activeTab === 'explorer' && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* File Explorer Panel */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ marginRight: '10px', marginBottom: 0 }}>Summary Explorer</h2>
              <button 
                onClick={() => setExplorerVisible(!explorerVisible)}
                style={{
                  padding: '5px 10px',
                  background: '#e0e0e0',
                  border: '1px solid #ccc',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                {explorerVisible ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {explorerVisible && (
              <div style={{ 
                border: '1px solid #ddd', 
                padding: '10px', 
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}>
                <FileExplorer 
                  onFileSelect={handleFileSelect} 
                  onBasePath={handleBasePath}
                />
              </div>
            )}
          </div>

          {/* Summary View Panel */}
          <div style={{ flex: 2, minWidth: '300px' }}>
            {selectedFile && (
              <div style={{ 
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#f0f7ff',
                borderRadius: '4px',
                borderLeft: '4px solid #4dabf7'
              }}>
                <h3 style={{ marginTop: 0 }}>Selected File: {selectedFile.name}</h3>
                <p style={{ 
                  fontSize: '0.9em', 
                  color: '#555', 
                  wordBreak: 'break-all',
                  marginBottom: 0
                }}>
                  Path: {selectedFile.path}
                </p>
              </div>
            )}
            
            <div>
              <h2 style={{ marginTop: 0 }}>Summary:</h2>
              {loading ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <p>Loading summary...</p>
                </div>
              ) : summary ? (
                <div style={{
                  border: '1px solid #ddd',
                  padding: '20px',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}>
                  {summary}
                </div>
              ) : (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center',
                  color: '#666',
                  border: '1px dashed #ddd',
                  borderRadius: '4px'
                }}>
                  <p>Select a file to view its summary</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Form Tab */}
      {activeTab === 'form' && (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label>Board:</label>
              <select 
                value={selectedBoard} 
                onChange={(e) => setSelectedBoard(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">--Select Board--</option>
                {boards.map((board) => (
                  <option key={board} value={board}>{board}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Class:</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={!selectedBoard}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">--Select Class--</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Subject:</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedClass}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">--Select Subject--</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Book:</label>
              <select 
                value={selectedBook} 
                onChange={(e) => setSelectedBook(e.target.value)}
                disabled={!selectedSubject}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">--Select Book--</option>
                {books.map((book) => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Chapter:</label>
              <select 
                value={selectedChapter} 
                onChange={(e) => setSelectedChapter(e.target.value)}
                disabled={!selectedBook}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">--Select Chapter--</option>
                {chapters.map((chapter) => (
                  <option key={chapter} value={chapter}>{chapter}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Language:</label>
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={!selectedChapter}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">--Select Language--</option>
                {languages.map((language) => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={handleFetchSummary} 
            disabled={loading || !selectedLanguage}
            style={{
              padding: '12px 24px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'block',
              margin: '0 auto',
              opacity: selectedLanguage ? 1 : 0.5
            }}
          >
            {loading ? (
              <span>
                <span style={{ verticalAlign: 'middle' }}>Fetching Summary</span>
                <span className="spinner" style={{
                  display: 'inline-block',
                  marginLeft: '10px',
                  width: '16px',
                  height: '16px',
                  border: '3px solid rgba(255,255,255,.3)',
                  borderRadius: '50%',
                  borderTopColor: '#fff',
                  animation: 'spin 1s ease-in-out infinite'
                }}></span>
              </span>
            ) : 'Fetch Summary'}
          </button>

          <div style={{ marginTop: '30px' }}>
            <h2>Summary:</h2>
            {summary ? (
              <div style={{
                border: '1px solid #ddd',
                padding: '20px',
                borderRadius: '4px',
                backgroundColor: '#fff',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                minHeight: '200px',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                {summary}
              </div>
            ) : (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center',
                color: '#666',
                border: '1px dashed #ddd',
                borderRadius: '4px'
              }}>
                <p>No summary available yet. Select options and click "Fetch Summary"</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add spinner animation */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}