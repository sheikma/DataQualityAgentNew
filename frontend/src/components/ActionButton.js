import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Button = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => {
    switch (props.size) {
      case 'small': return `${props.theme.spacing.sm} ${props.theme.spacing.md}`;
      case 'large': return `${props.theme.spacing.lg} ${props.theme.spacing.xl}`;
      default: return `${props.theme.spacing.md} ${props.theme.spacing.lg}`;
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '0.85rem';
      case 'large': return '1.1rem';
      default: return '0.95rem';
    }
  }};
  font-weight: 500;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-decoration: none;
  outline: none;
  position: relative;
  overflow: hidden;
  
  background: ${props => {
    switch (props.variant) {
      case 'primary':
        return props.theme.colors.primary;
      case 'secondary':
        return props.theme.colors.secondary;
      case 'accent':
        return props.theme.colors.accent;
      case 'success':
        return props.theme.colors.success;
      case 'warning':
        return props.theme.colors.warning;
      case 'error':
        return props.theme.colors.error;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      default:
        return props.theme.colors.gray200;
    }
  }};
  
  color: ${props => {
    switch (props.variant) {
      case 'primary':
      case 'secondary':
      case 'accent':
      case 'success':
      case 'warning':
      case 'error':
        return 'white';
      case 'outline':
        return props.theme.colors.primary;
      case 'ghost':
        return props.theme.colors.textSecondary;
      default:
        return props.theme.colors.text;
    }
  }};
  
  border: ${props => {
    if (props.variant === 'outline') {
      return `1px solid ${props.theme.colors.primary}`;
    }
    return 'none';
  }};
  
  &:hover:not(:disabled) {
    background: ${props => {
      switch (props.variant) {
        case 'primary':
          return props.theme.colors.primaryDark;
        case 'secondary':
          return '#059669';
        case 'accent':
          return '#D97706';
        case 'success':
          return '#059669';
        case 'warning':
          return '#D97706';
        case 'error':
          return '#DC2626';
        case 'outline':
          return props.theme.colors.primary + '10';
        case 'ghost':
          return props.theme.colors.gray100;
        default:
          return props.theme.colors.gray300;
      }
    }};
    
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: ${props => props.theme.shadows.sm};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  &:focus-visible {
    box-shadow: 0 0 0 3px ${props => {
      switch (props.variant) {
        case 'primary':
          return props.theme.colors.primary + '30';
        case 'secondary':
          return props.theme.colors.secondary + '30';
        default:
          return props.theme.colors.primary + '30';
      }
    }};
  }
`;

const ButtonIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function ActionButton({ 
  text, 
  onClick, 
  style: variant = 'default',
  size = 'medium',
  icon = null,
  loading = false,
  disabled = false,
  children,
  ...props 
}) {
  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {loading ? (
        <ButtonIcon>
          <LoadingSpinner />
        </ButtonIcon>
      ) : icon ? (
        <ButtonIcon>
          {icon}
        </ButtonIcon>
      ) : null}
      {text || children}
    </Button>
  );
}

export default ActionButton;