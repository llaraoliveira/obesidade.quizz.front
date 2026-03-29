// Configuração da API
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
};

// Helper para construir URLs completas da API
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.baseURL;
  // Remove barras duplicadas
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};

// Endpoints da API
export const API_ENDPOINTS = {
  // Resultados
  RESULTS: '/api/results',
  
  // Perguntas
  QUESTIONS: '/api/questions',
  QUESTION_RESPONSES: '/api/question-responses',
  TEST_DIFFICULTY: '/api/test-difficulty',
  
  // Dicas
  DICAS: '/api/dicas',
  
  // Backoffice
  BACKOFFICE_LOGIN: '/api/backoffice/login',
  BACKOFFICE_DASHBOARD: '/api/backoffice/dashboard',
  BACKOFFICE_QUESTIONS: '/api/backoffice/questions',
  BACKOFFICE_USERS: '/api/backoffice/users',
  BACKOFFICE_RESULTS: '/api/backoffice/results',
  BACKOFFICE_DICAS: '/api/backoffice/dicas',
};
