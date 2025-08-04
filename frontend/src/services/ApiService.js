import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiServiceClass {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`Response from ${response.config.url}:`, response.status);
        return response;
      },
      (error) => {
        console.error('Response error:', error);
        if (error.response) {
          // Server responded with error status
          throw new Error(error.response.data?.detail || error.response.data?.message || `Server error: ${error.response.status}`);
        } else if (error.request) {
          // Request made but no response received
          throw new Error('Cannot connect to server. Please make sure the backend is running.');
        } else {
          // Something else happened
          throw new Error(error.message || 'An unexpected error occurred');
        }
      }
    );
  }

  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }

  async uploadData(filePath) {
    const response = await this.api.post('/upload-data', {
      file_path: filePath
    });
    return response.data;
  }

  async sendMessage(message) {
    const response = await this.api.post('/chat', {
      message: message
    });
    return response.data;
  }

  async getAvailableTools() {
    const response = await this.api.get('/tools');
    return response.data;
  }

  async executeTool(toolName, params = {}) {
    const response = await this.api.post(`/tool/${toolName}`, {
      params: params
    });
    return response.data;
  }
}

export const ApiService = new ApiServiceClass();