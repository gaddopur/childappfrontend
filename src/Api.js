import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/', // Adjust for prod
});

export const fetchAIResponse = async (query) => {
  const response = await API.post('querysolver/solvequery/', { query });
  return response.data;
};

export const solverMathProblem = async (equation) => {
  const response = await API.post('querysolver/math_solver/', { equation });
  return response.data;
};

export const pdfSummarizer = async (equation) => {
  const response = await API.post('querysolver/pdf_summerizer/', { equation });
  return response.data;
};