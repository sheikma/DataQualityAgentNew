import React from 'react';
import styled from 'styled-components';
import { Bot, User, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import DataTable from './DataTable';
import DataChart from './DataChart';
import ActionButton from './ActionButton';

const MessageContainer = styled(motion.div)`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: flex-start;
  ${props => props.isUser && `
    flex-direction: row-reverse;
  `}
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${props => props.isUser ? props.theme.colors.primary : props.theme.colors.secondary};
  color: white;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const MessageContent = styled.div`
  flex: 1;
  max-width: calc(100% - 60px);
  ${props => props.isUser && `
    max-width: 70%;
  `}
`;

const MessageBubble = styled.div`
  background: ${props => props.isUser ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.isUser ? 'white' : props.theme.colors.text};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.isUser ? 'transparent' : props.theme.colors.border};
  
  ${props => props.isUser && `
    margin-left: auto;
  `}
`;

const MessageText = styled.div`
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;

  p {
    margin-bottom: ${props => props.theme.spacing.sm};
    &:last-child {
      margin-bottom: 0;
    }
  }

  ul, ol {
    margin: ${props => props.theme.spacing.sm} 0;
    padding-left: ${props => props.theme.spacing.lg};
  }

  li {
    margin-bottom: ${props => props.theme.spacing.xs};
  }

  strong {
    font-weight: 600;
  }

  code {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 0.9em;
  }
`;

const ComponentsContainer = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const TimestampContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
  font-size: 0.8rem;
  color: ${props => props.isUser ? 'rgba(255, 255, 255, 0.7)' : props.theme.colors.textMuted};
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: 0.8rem;
  color: ${props => {
    switch (props.status) {
      case 'success': return props.theme.colors.success;
      case 'warning': return props.theme.colors.warning;
      case 'error': return props.theme.colors.error;
      default: return props.theme.colors.info;
    }
  }};
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

function MessageBubbleComponent({ message, onQuickAction }) {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={12} />;
      case 'warning':
        return <AlertTriangle size={12} />;
      case 'error':
        return <AlertTriangle size={12} />;
      default:
        return <Info size={12} />;
    }
  };

  const renderComponent = (component, index) => {
    switch (component.type) {
      case 'table':
        return (
          <DataTable
            key={index}
            title={component.title}
            headers={component.headers}
            rows={component.rows}
          />
        );
      
      case 'chart':
        return (
          <DataChart
            key={index}
            type={component.chart_type || 'bar'}
            title={component.title}
            data={component.data}
          />
        );
      
      case 'button':
        return (
          <ActionButton
            key={index}
            text={component.text}
            onClick={() => onQuickAction(component.action)}
            style={component.style}
          />
        );
      
      default:
        return null;
    }
  };

  // Check if message has tool results for status indication
  const getMessageStatus = () => {
    if (message.toolResults) {
      const hasErrors = message.toolResults.some(result => result.result?.status === 'error');
      const hasWarnings = message.toolResults.some(result => 
        result.result?.result?.issues?.some(issue => issue.severity === 'warning')
      );
      
      if (hasErrors) return 'error';
      if (hasWarnings) return 'warning';
      return 'success';
    }
    return null;
  };

  const messageStatus = getMessageStatus();

  return (
    <MessageContainer
      isUser={message.type === 'user'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Avatar isUser={message.type === 'user'}>
        {message.type === 'user' ? <User size={20} /> : <Bot size={20} />}
      </Avatar>
      
      <MessageContent isUser={message.type === 'user'}>
        <MessageBubble isUser={message.type === 'user'}>
          <MessageText>
            {message.content}
          </MessageText>
          
          <TimestampContainer isUser={message.type === 'user'}>
            <span>{formatTimestamp(message.timestamp)}</span>
            {messageStatus && (
              <StatusIndicator status={messageStatus}>
                {getStatusIcon(messageStatus)}
                {messageStatus}
              </StatusIndicator>
            )}
          </TimestampContainer>
        </MessageBubble>

        {message.components && message.components.length > 0 && (
          <ComponentsContainer>
            {message.components.map((component, index) => renderComponent(component, index))}
          </ComponentsContainer>
        )}

        {/* Render quick action buttons from components */}
        {message.components && message.components.filter(c => c.type === 'button').length > 0 && (
          <ButtonGroup>
            {message.components
              .filter(c => c.type === 'button')
              .map((button, index) => (
                <ActionButton
                  key={index}
                  text={button.text}
                  onClick={() => onQuickAction(button.action)}
                  style={button.style}
                  size="small"
                />
              ))}
          </ButtonGroup>
        )}
      </MessageContent>
    </MessageContainer>
  );
}

export default MessageBubbleComponent;