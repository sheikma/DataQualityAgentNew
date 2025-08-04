import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, ChevronUp, Download, Search } from 'lucide-react';

const TableContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.gray50};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const TableTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const TableControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SearchInput = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.9rem;
  width: 200px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
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

const TableWrapper = styled.div`
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: ${props => props.theme.colors.gray50};
  position: sticky;
  top: 0;
  z-index: 1;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: ${props => props.theme.colors.gray50};
  }
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const TableHeaderCell = styled.th`
  padding: ${props => props.theme.spacing.md};
  text-align: left;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  cursor: ${props => props.sortable ? 'pointer' : 'default'};
  user-select: none;
  
  &:hover {
    background: ${props => props.sortable ? props.theme.colors.surfaceHover : 'transparent'};
  }
`;

const TableCell = styled.td`
  padding: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text};
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  font-size: 0.9rem;
  
  &:first-child {
    font-weight: 500;
  }
`;

const SortIcon = styled.span`
  margin-left: ${props => props.theme.spacing.xs};
  opacity: 0.5;
  
  &.active {
    opacity: 1;
    color: ${props => props.theme.colors.primary};
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.gray50};
  border-top: 1px solid ${props => props.theme.colors.border};
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const NoDataMessage = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-style: italic;
`;

function DataTable({ title, headers, rows, searchable = true, sortable = true, downloadable = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter rows based on search term
  const filteredRows = rows.filter(row =>
    row.some(cell => 
      String(cell).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort rows if sort configuration is set
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Paginate rows
  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = sortedRows.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (columnIndex) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === columnIndex && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnIndex, direction });
  };

  const handleDownload = () => {
    if (!downloadable) return;
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <TableContainer>
      <TableHeader>
        <TableTitle>{title}</TableTitle>
        <TableControls>
          {searchable && (
            <SearchInput
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
          {downloadable && (
            <ActionButton onClick={handleDownload}>
              <Download size={16} />
              Export
            </ActionButton>
          )}
        </TableControls>
      </TableHeader>
      
      {paginatedRows.length === 0 ? (
        <NoDataMessage>
          {searchTerm ? `No results found for "${searchTerm}"` : 'No data available'}
        </NoDataMessage>
      ) : (
        <>
          <TableWrapper>
            <Table>
              <TableHead>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHeaderCell
                      key={index}
                      sortable={sortable}
                      onClick={() => handleSort(index)}
                    >
                      {header}
                      {sortable && (
                        <SortIcon className={sortConfig.key === index ? 'active' : ''}>
                          {sortConfig.key === index && sortConfig.direction === 'desc' ? 
                            <ChevronDown size={14} /> : 
                            <ChevronUp size={14} />
                          }
                        </SortIcon>
                      )}
                    </TableHeaderCell>
                  ))}
                </TableRow>
              </TableHead>
              <tbody>
                {paginatedRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>
                        {String(cell)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
          
          {totalPages > 1 && (
            <PaginationContainer>
              <span>
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedRows.length)} of {sortedRows.length} entries
              </span>
            </PaginationContainer>
          )}
        </>
      )}
    </TableContainer>
  );
}

export default DataTable;