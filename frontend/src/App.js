import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { ApiService } from './services/ApiService';

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.gray100};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.gray300};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.gray400};
  }
`;

// Theme configuration
const theme = {
  colors: {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceHover: '#F1F5F9',
    text: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    gray50: '#F8FAFC',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
    gray400: '#94A3B8',
    gray500: '#64748B',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1E293B',
    gray900: '#0F172A',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.3s ease-in-out',
    slow: '0.5s ease-in-out'
  }
};

// Styled components
const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: ${props => props.theme.colors.background};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

function App() {
  const [dataPath, setDataPath] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [appStatus, setAppStatus] = useState('idle');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'agent',
      content: 'Hello! I\'m your Marketing Campaign Data Quality Agent. I can help you validate, fix, and analyze your campaign data. To get started, please upload a CSV file with your marketing campaign data.',
      timestamp: new Date().toISOString(),
      components: []
    }
  ]);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      setAppStatus('connecting');
      await ApiService.healthCheck();
      setAppStatus('connected');
    } catch (error) {
      console.error('Backend health check failed:', error);
      setAppStatus('disconnected');
    }
  };

  const handleDataUpload = async (filePath) => {
    try {
      setAppStatus('loading');
      await ApiService.uploadData(filePath);
      setDataPath(filePath);
      setIsDataLoaded(true);
      setAppStatus('connected');
      
      // Add success message
      const successMessage = {
        id: Date.now(),
        type: 'agent',
        content: `Great! I've loaded your data from "${filePath}". I can now help you validate, analyze, and fix any issues in your marketing campaign data. What would you like me to do first?`,
        timestamp: new Date().toISOString(),
        components: [
          {
            type: 'button',
            text: 'Validate Data Quality',
            action: 'validate_data',
            style: 'primary'
          },
          {
            type: 'button', 
            text: 'Detect Anomalies',
            action: 'detect_anomalies',
            style: 'secondary'
          },
          {
            type: 'button',
            text: 'Get Data Insights',
            action: 'get_insights',
            style: 'accent'
          }
        ]
      };
      
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      setAppStatus('error');
      console.error('Error uploading data:', error);
      
      const errorMessage = {
        id: Date.now(),
        type: 'agent',
        content: `Sorry, I couldn't load the data file. Please make sure the file path is correct and the file exists. Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        components: []
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSendMessage = async (message) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      setAppStatus('processing');
      const response = await ApiService.sendMessage(message);
      
      // Add agent response
      const agentMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: response.message,
        timestamp: new Date().toISOString(),
        components: response.components || [],
        toolResults: response.tool_results || []
      };
      
      setMessages(prev => [...prev, agentMessage]);
      setAppStatus('connected');
    } catch (error) {
      setAppStatus('error');
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: `Sorry, I encountered an error processing your request: ${error.message}`,
        timestamp: new Date().toISOString(),
        components: []
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleQuickAction = async (action) => {
    const actionMap = {
      'validate_data': 'Please validate my data quality',
      'detect_anomalies': 'Please detect any anomalies in my data',
      'get_insights': 'Please give me insights about my campaign data',
      'fix_data': 'Please fix the data quality issues',
      'fix_anomalies': 'Please fix the detected anomalies'
    };
    
    const message = actionMap[action] || action;
    await handleSendMessage(message);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Sidebar 
          onDataUpload={handleDataUpload}
          dataPath={dataPath}
          isDataLoaded={isDataLoaded}
          appStatus={appStatus}
        />
        <MainContent>
          <Header 
            title="Marketing Campaign Data Quality Agent"
            status={appStatus}
          />
          <ContentArea>
            <ChatInterface 
              messages={messages}
              onSendMessage={handleSendMessage}
              onQuickAction={handleQuickAction}
              isLoading={appStatus === 'processing'}
              isDataLoaded={isDataLoaded}
            />
          </ContentArea>
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;