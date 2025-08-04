import React, { useState } from 'react';
import styled from 'styled-components';
import { Upload, Database, FileText, CheckCircle, AlertCircle, Info, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarContainer = styled.div`
  width: 300px;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  font-weight: 600;
  font-size: 1.1rem;
  color: ${props => props.theme.colors.text};
`;

const SidebarContent = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing.lg};
  overflow-y: auto;
`;

const Section = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DataUploadArea = styled.div`
  border: 2px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}05;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const PathInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.9rem;
  margin-bottom: ${props => props.theme.spacing.md};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const LoadButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.gray300};
    cursor: not-allowed;
  }
`;

const DataStatus = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => {
    if (props.isLoaded) return props.theme.colors.success + '20';
    return props.theme.colors.gray50;
  }};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => {
    if (props.isLoaded) return props.theme.colors.success;
    return props.theme.colors.textSecondary;
  }};
  font-size: 0.9rem;
`;

const DataInfo = styled.div`
  margin-top: ${props => props.theme.spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm} 0;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  
  &:last-child {
    border-bottom: none;
  }
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

const StatCard = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gray50};
  border-radius: ${props => props.theme.borderRadius.md};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.xs};
`;

function Sidebar({ onDataUpload, dataPath, isDataLoaded, appStatus }) {
  const [inputPath, setInputPath] = useState('/c:/Project/AIEngg/DataQualityAgentNew/sample_data/marketing_campaigns.csv');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoad = async () => {
    if (!inputPath.trim()) return;
    
    setIsLoading(true);
    try {
      await onDataUpload(inputPath.trim());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLoad();
    }
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Logo>
          <Database size={24} />
          Data Quality Agent
        </Logo>
      </SidebarHeader>
      
      <SidebarContent>
        <Section>
          <SectionTitle>Data Source</SectionTitle>
          
          {!isDataLoaded ? (
            <div>
              <PathInput
                type="text"
                placeholder="Enter CSV file path..."
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <LoadButton 
                onClick={handleLoad}
                disabled={!inputPath.trim() || isLoading}
              >
                {isLoading ? 'Loading...' : 'Load Data'}
              </LoadButton>
            </div>
          ) : (
            <DataStatus
              isLoaded={isDataLoaded}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle size={16} />
              Data Loaded Successfully
            </DataStatus>
          )}
          
          {isDataLoaded && (
            <DataInfo>
              <InfoItem>
                <span>File Path:</span>
                <span>{dataPath.split('/').pop()}</span>
              </InfoItem>
              <InfoItem>
                <span>Status:</span>
                <span style={{ color: appStatus === 'connected' ? '#10B981' : '#EF4444' }}>
                  {appStatus}
                </span>
              </InfoItem>
            </DataInfo>
          )}
        </Section>

        <Section>
          <SectionTitle>Available Tools</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: 'Data Validation', icon: <CheckCircle size={16} />, description: 'Check schema & quality' },
              { name: 'Anomaly Detection', icon: <AlertCircle size={16} />, description: 'Find statistical outliers' },
              { name: 'Data Fixing', icon: <Settings size={16} />, description: 'Auto-repair issues' },
              { name: 'Insights & Analytics', icon: <Info size={16} />, description: 'Query & visualize data' }
            ].map((tool, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ color: '#3B82F6' }}>{tool.icon}</div>
                <div>
                  <div style={{ fontWeight: '500', color: '#1E293B' }}>{tool.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{tool.description}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <SectionTitle>Quick Actions</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              style={{
                padding: '10px',
                background: 'transparent',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                cursor: isDataLoaded ? 'pointer' : 'not-allowed',
                opacity: isDataLoaded ? 1 : 0.5,
                fontSize: '0.9rem',
                color: '#1E293B'
              }}
              disabled={!isDataLoaded}
              onClick={() => isDataLoaded && onDataUpload && onDataUpload('')}
            >
              Run Full Analysis
            </button>
            <button
              style={{
                padding: '10px',
                background: 'transparent',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#1E293B'
              }}
            >
              View Documentation
            </button>
          </div>
        </Section>
      </SidebarContent>
    </SidebarContainer>
  );
}

export default Sidebar;