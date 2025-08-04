import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const QuickActionsContainer = styled(motion.div)`
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.borderLight};
  background: ${props => props.theme.colors.gray50};
`;

const QuickActionsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 500;
`;

const SuggestionsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  max-width: 1000px;
  margin: 0 auto;
`;

const SuggestionButton = styled(motion.button)`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-align: left;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  min-width: 0;
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const SuggestionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  flex-shrink: 0;
`;

const SuggestionText = styled.span`
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

function QuickActions({ suggestions = [] }) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <QuickActionsContainer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <QuickActionsHeader>
        <Zap size={16} />
        Quick Actions
      </QuickActionsHeader>
      
      <SuggestionsGrid>
        {suggestions.map((suggestion, index) => (
          <SuggestionButton
            key={index}
            onClick={suggestion.action}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <SuggestionIcon>
              <Zap size={12} />
            </SuggestionIcon>
            <SuggestionText>
              {suggestion.text}
            </SuggestionText>
          </SuggestionButton>
        ))}
      </SuggestionsGrid>
    </QuickActionsContainer>
  );
}

export default QuickActions;