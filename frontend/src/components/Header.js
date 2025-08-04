import React from 'react';
import styled from 'styled-components';
import { Activity, CheckCircle, AlertCircle, Loader, Wifi, WifiOff } from 'lucide-react';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.9rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'connected': return props.theme.colors.success + '20';
      case 'processing': return props.theme.colors.info + '20';
      case 'loading': return props.theme.colors.warning + '20';
      case 'error': return props.theme.colors.error + '20';
      case 'disconnected': return props.theme.colors.gray200;
      default: return props.theme.colors.gray100;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'connected': return props.theme.colors.success;
      case 'processing': return props.theme.colors.info;
      case 'loading': return props.theme.colors.warning;
      case 'error': return props.theme.colors.error;
      case 'disconnected': return props.theme.colors.gray600;
      default: return props.theme.colors.gray500;
    }
  }};
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: white;
`;

function Header({ title, status }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'connected':
        return {
          icon: <CheckCircle size={16} />,
          text: 'Connected',
          description: 'Ready to analyze your data'
        };
      case 'processing':
        return {
          icon: <Loader size={16} className="animate-spin" />,
          text: 'Processing',
          description: 'Analyzing your request'
        };
      case 'loading':
        return {
          icon: <Loader size={16} className="animate-spin" />,
          text: 'Loading',
          description: 'Loading data'
        };
      case 'error':
        return {
          icon: <AlertCircle size={16} />,
          text: 'Error',
          description: 'Something went wrong'
        };
      case 'disconnected':
        return {
          icon: <WifiOff size={16} />,
          text: 'Disconnected',
          description: 'Cannot connect to server'
        };
      case 'connecting':
        return {
          icon: <Wifi size={16} />,
          text: 'Connecting',
          description: 'Establishing connection'
        };
      default:
        return {
          icon: <Activity size={16} />,
          text: 'Ready',
          description: 'System ready'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <HeaderContainer>
      <TitleSection>
        <IconWrapper>
          <Activity size={18} />
        </IconWrapper>
        <Title>{title}</Title>
      </TitleSection>
      
      <StatusSection>
        <StatusIndicator status={status}>
          {statusConfig.icon}
          <div>
            <div>{statusConfig.text}</div>
          </div>
        </StatusIndicator>
      </StatusSection>
    </HeaderContainer>
  );
}

export default Header;