import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { Download, Maximize2 } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ChartContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.gray50};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ChartTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const ChartControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

const ChartWrapper = styled.div`
  padding: ${props => props.theme.spacing.lg};
  height: 400px;
  position: relative;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${props => props.theme.colors.textSecondary};
  font-style: italic;
`;

function DataChart({ type = 'bar', title, data, options = {} }) {
  const chartRef = useRef(null);

  // Default chart options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748B',
          font: {
            size: 12,
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#64748B',
          font: {
            size: 12,
          }
        }
      }
    },
    ...options
  };

  // Prepare chart data
  const chartData = {
    labels: data?.x || [],
    datasets: [
      {
        label: title || 'Data',
        data: data?.y || [],
        backgroundColor: type === 'bar' ? 
          'rgba(59, 130, 246, 0.8)' : 
          'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        fill: type === 'line',
        tension: type === 'line' ? 0.4 : 0,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: type === 'line' ? 5 : 0,
        pointHoverRadius: type === 'line' ? 7 : 0,
      }
    ]
  };

  const handleDownload = () => {
    if (chartRef.current) {
      const canvas = chartRef.current.canvas;
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title?.replace(/\s+/g, '_').toLowerCase() || 'chart'}.png`;
      a.click();
    }
  };

  const handleFullscreen = () => {
    // This would typically open a modal with a larger chart
    console.log('Fullscreen chart not implemented yet');
  };

  if (!data || !data.x || !data.y || data.x.length === 0) {
    return (
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>{title || 'Chart'}</ChartTitle>
        </ChartHeader>
        <NoDataMessage>
          No data available for visualization
        </NoDataMessage>
      </ChartContainer>
    );
  }

  const ChartComponent = type === 'line' ? Line : Bar;

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>{title || 'Chart'}</ChartTitle>
        <ChartControls>
          <ActionButton onClick={handleDownload}>
            <Download size={16} />
            Download
          </ActionButton>
          <ActionButton onClick={handleFullscreen}>
            <Maximize2 size={16} />
            Fullscreen
          </ActionButton>
        </ChartControls>
      </ChartHeader>
      
      <ChartWrapper>
        <ChartComponent
          ref={chartRef}
          data={chartData}
          options={defaultOptions}
        />
      </ChartWrapper>
    </ChartContainer>
  );
}

export default DataChart;