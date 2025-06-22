import axios from 'axios';

// Create a configured Axios instance
const API = axios.create({
  baseURL: 'http://localhost:8000/',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor
API.interceptors.request.use(config => {
  console.log(`Sending ${config.method.toUpperCase()} request to: ${config.url}`);
  return config;
}, error => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Add response interceptor
API.interceptors.response.use(response => {
  console.log(`Received response from: ${response.config.url}`, response.data);
  return response;
}, error => {
  if (error.response) {
    // Server responded with error status
    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      url: error.response.config.url
    });
  } else if (error.request) {
    // Request was made but no response received
    console.error('API No Response:', {
      message: error.message,
      url: error.config.url
    });
  } else {
    // Other errors
    console.error('API Setup Error:', error.message);
  }
  return Promise.reject(error);
});

// Existing API functions
export const fetchAIResponse = async (query) => {
  const response = await API.post('querysolver/solvequery/', { query });
  return response.data;
};

export const solveMathExpression = async (expression, sessionId) => {
  const payload = { expression };
  if (sessionId) payload.session_id = sessionId;
  const { data } = await API.post('querysolver/math_solver/', payload);
  return data;
};

export const postLatencyMetric = async (page, latency) => {
  return API.post('metrics/latency/', {
    page,
    latency,
    timestamp: new Date().toISOString(),
  });
};

export const summarizePdf = async (file) => {
  const form = new FormData();
  form.append('file', file);
  const { data } = await API.post('querysolver/pdf_summerizer/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// New API functions for School Book Summary
export const fetchAvailableSummaryOptions = async () => {
  const response = await API.get('querysolver/available-summary-options/');
  return response.data;
};

export const fetchNestedOptions = async (path) => {
  const response = await API.get('querysolver/nested-options/', {
    params: { path }
  });
  return response.data;
};

export const fetchFileExplorer = async (path = '') => {
  const response = await API.get('querysolver/file-explorer/', {
    params: { path }
  });
  return response.data;
};

export const fetchSchoolBookSummary = async (params) => {
  const response = await API.get('querysolver/school-book-summary/', {
    params
  });
  return response.data;
};

// Export the API instance for custom requests
export default API;