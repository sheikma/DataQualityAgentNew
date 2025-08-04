import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Bot, User, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import QuickActions from './QuickActions';

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme.colors.surface};
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.lg};
  scroll-behavior: smooth;
`;

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
`;

const InputArea = styled.div`
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.lg};
`;

const InputContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gray50};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.md};
  transition: all ${props => props.theme.transitions.fast};

  &:focus-within {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: none;
  outline: none;
  min-height: 20px;
  max-height: 120px;
  color: ${props => props.theme.colors.text};

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.disabled ? props.theme.colors.gray300 : props.theme.colors.primary};
  color: white;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const LoadingIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  margin: 0 auto;
  background: ${props => props.theme.colors.gray50};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const WelcomeArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const WelcomeIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.lg};
`;

const WelcomeTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
  font-weight: 600;
`;

const WelcomeText = styled.p`
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

function ChatInterface({ messages, onSendMessage, onQuickAction, isLoading, isDataLoaded }) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const quickActionSuggestions = [
    { text: 'Validate Data Quality', action: 'validate_data' },
    { text: 'Detect Anomalies', action: 'detect_anomalies' },
    { text: 'Get Data Insights', action: 'get_insights' },
    { text: 'Check Completeness', action: 'check_completeness' }
  ];

  return (
    <ChatContainer>
      <MessagesArea>
        <MessagesList>
          {messages.length === 1 && !isDataLoaded ? (
            <WelcomeArea>
              <WelcomeIcon>
                <Bot size={40} color="white" />
              </WelcomeIcon>
              <WelcomeTitle>Marketing Campaign Data Quality Agent</WelcomeTitle>
              <WelcomeText>
                I'm here to help you validate, analyze, and fix issues in your marketing campaign data. 
                Upload a CSV file to get started, and I'll guide you through the data quality process.
              </WelcomeText>
            </WelcomeArea>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onQuickAction={onQuickAction}
                />
              ))}
              
              <AnimatePresence>
                {isLoading && (
                  <LoadingIndicator
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Loader size={16} className="animate-spin" />
                    Analyzing your data...
                  </LoadingIndicator>
                )}
              </AnimatePresence>
            </>
          )}
          <div ref={messagesEndRef} />
        </MessagesList>
      </MessagesArea>

      {!isDataLoaded && messages.length === 1 && (
        <QuickActions
          suggestions={[
            { text: 'Load Sample Data', action: () => onSendMessage('Load sample marketing campaign data for demonstration') },
            { text: 'How does this work?', action: () => onSendMessage('How does this data quality agent work?') },
            { text: 'What can you analyze?', action: () => onSendMessage('What types of data quality issues can you detect?') }
          ]}
        />
      )}

      {isDataLoaded && (
        <QuickActions
          suggestions={quickActionSuggestions.map(item => ({
            text: item.text,
            action: () => onQuickAction(item.action)
          }))}
        />
      )}

      <InputArea>
        <InputContainer>
          <form onSubmit={handleSubmit}>
            <InputWrapper>
              <MessageInput
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isDataLoaded ? "Ask me about your data quality..." : "Upload data first, then ask me anything..."}
                disabled={isLoading}
                rows={1}
              />
              <SendButton 
                type="submit" 
                disabled={!inputValue.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </SendButton>
            </InputWrapper>
          </form>
        </InputContainer>
      </InputArea>
    </ChatContainer>
  );
}

export default ChatInterface;