import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { TableCell, TableStructure } from './DynamicTableBuilder';

interface TableContentProps {
  tableStructure: TableStructure;
  tableCells: (TableCell | null)[][];
  selectedCell: { row: number; col: number } | null;
  isInlineEditing: boolean;
  inlineEditCell: { row: number; col: number } | null;
  inlineEditValue: string;
  hideConfiguration: boolean;
  allowEmptyCellEditing: boolean;
  originalCellContentRef: React.MutableRefObject<Record<string, string>>;
  onInlineEditChange: (value: string) => void;
  onInlineEditKeyPress: (e: React.KeyboardEvent) => void;
  onInlineEditBlur: () => void;
  onCellClick: (row: number, col: number) => void;
  isFormMode?: boolean;
}

const TableContent: React.FC<TableContentProps> = ({
  tableStructure,
  tableCells,
  selectedCell,
  isInlineEditing,
  inlineEditCell,
  inlineEditValue,
  hideConfiguration,
  allowEmptyCellEditing,
  originalCellContentRef,
  onInlineEditChange,
  onInlineEditKeyPress,
  onInlineEditBlur,
  onCellClick,
  isFormMode
}) => {
  // Render table cell
  const renderTableCell = (rowIndex: number, colIndex: number) => {
    const cell = tableCells[rowIndex][colIndex];
    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
    const isInlineEditingThisCell = isInlineEditing && inlineEditCell?.row === rowIndex && inlineEditCell?.col === colIndex;

    // Check if this cell is covered by a spanning cell
    const isCoveredBySpan = (tableStructure.cells || []).some(spanCell =>
      // Check if current cell position falls within the span range
      rowIndex >= spanCell.rowIndex &&
      rowIndex < spanCell.rowIndex + spanCell.rowSpan &&
      colIndex >= spanCell.colIndex &&
      colIndex < spanCell.colIndex + spanCell.colSpan &&
      // Don't consider the spanning cell itself as covered
      !(rowIndex === spanCell.rowIndex && colIndex === spanCell.colIndex)
    );

    if (isCoveredBySpan) {
      return null; // Don't render this cell as it's covered by a spanning cell
    }

    const hasSpanning = cell && (cell.rowSpan > 1 || cell.colSpan > 1);
    const isHeaderCell = cell?.isHeader || cell?.isQuestion;
    const isFirstRow = rowIndex === 0;
    const isFirstCol = colIndex === 0;
    const isEmptyCell = !cell?.content || cell.content.trim() === '';

    // Check if this cell has original content (from table structure creation)
    const cellKey = `${rowIndex}-${colIndex}`;
    const hasOriginalContent = originalCellContentRef.current[cellKey] && originalCellContentRef.current[cellKey].trim() !== '';
    const hasUserContent = cell?.content && cell.content.trim() !== '' && !hasOriginalContent;

    // Determine cell type for styling
    let cellBg = 'white';
    let cellBorder = 'gray.300';
    let cellTextColor = 'black';

    if (isSelected) {
      cellBg = 'blue.50';
      cellBorder = 'blue.300';
    } else if (hasSpanning) {
      // cellBg = 'green.50';
      // cellBorder = 'green.300';
    } else if (isHeaderCell) {
      // cellBg = 'purple.50';
      // cellBorder = 'purple.300';
      // cellTextColor = 'purple.800';
    } else if (isFirstRow || isFirstCol) {
      // cellBg = 'gray.50';
      // cellBorder = 'gray.400';
    }

    // Allow editing based on conditions:
    // 1. Not a header cell
    // 2. If configuration is hidden (answer mode):
    //    - Allow editing if cell is empty OR has user-entered content
    //    - Don't allow editing if cell has original content from table structure
    // 3. If configuration is visible (edit mode), allow editing any non-header cell
    const canEdit = !isHeaderCell && (
      !hideConfiguration ||
      (hideConfiguration && (
        (allowEmptyCellEditing && isEmptyCell) || hasUserContent
      ))
    );

    return (
      <Box
        as="td"
        key={`${rowIndex}-${colIndex}`}
        border="1px solid"
        borderColor={cellBorder}
        p={4}
        minW="120px"
        minH="60px"
        bg={cellBg}
        cursor={canEdit ? "pointer" : "not-allowed"}
        onClick={() => canEdit && onCellClick(rowIndex, colIndex)}
        _hover={{
          bg: isHeaderCell
            ? cellBg
            : hasSpanning
              ? 'green.100'
              : 'gray.50'
        }}
        rowSpan={cell?.rowSpan || 1}
        colSpan={cell?.colSpan || 1}
        position="relative"
      >
        {isInlineEditingThisCell ? (
          // Inline editing input
          <input
            value={inlineEditValue}
            onChange={(e) => onInlineEditChange(e.target.value)}
            onKeyDown={onInlineEditKeyPress}
            onBlur={onInlineEditBlur}
            autoFocus
            style={{
              width: '100%',
              height: '100%',
              border: '2px solid #3182ce',
              borderRadius: '0',
              padding: '4px',
              backgroundColor: 'white',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
          />
        ) : (
          // Normal cell content
          <VStack align="start" spacing={1}>
            <Text color={cellTextColor} fontWeight={isHeaderCell ? "semibold" : "normal"}>
              {cell?.content || ''}
            </Text>
            {isHeaderCell && cell?.questionText && (
              <Text fontSize="xs" color="purple.600" fontStyle="italic">
                {cell.questionText}
              </Text>
            )}
          </VStack>
        )}

        {!isFormMode && hasSpanning && (
          <Box
            position="absolute"
            top="2px"
            right="2px"
            bg="green.500"
            color="white"
            fontSize="xs"
            px="2px"
            py="1px"
            borderRadius="sm"
          >
            {cell.rowSpan > 1 && cell.colSpan > 1
              ? `${cell.rowSpan}×${cell.colSpan}`
              : cell.rowSpan > 1
                ? `${cell.rowSpan}R`
                : `${cell.colSpan}C`
            }
          </Box>
        )}

        {isHeaderCell && (
          <Box
            position="absolute"
            top="2px"
            left="2px"
            bg="purple.500"
            color="white"
            fontSize="xs"
            px="2px"
            py="1px"
            borderRadius="sm"
          >
            Header
          </Box>
        )}

        {/* Show indicator for editable empty cells in answer mode */}
        {hideConfiguration && isEmptyCell && !isHeaderCell && !isInlineEditingThisCell && canEdit && (
          <Box
            position="absolute"
            bottom="2px"
            right="2px"
            bg="blue.500"
            color="white"
            fontSize="xs"
            px="2px"
            py="1px"
            borderRadius="sm"
          >
            Click to answer
          </Box>
        )}

        {/* Show indicator for user-entered content that can be edited */}
        {hideConfiguration && hasUserContent && !isHeaderCell && !isInlineEditingThisCell && canEdit && (
          <Box
            position="absolute"
            bottom="2px"
            right="2px"
            bg="green.500"
            color="white"
            fontSize="xs"
            px="2px"
            py="1px"
            borderRadius="sm"
          >
            Click to edit
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box overflowX="auto">
      <Box
        as="table"
        border="1px solid"
        borderColor="gray.300"
        borderRadius="md"
        width="100%"
      >
        <Box as="tbody">
          {Array.from({ length: tableStructure.rows }, (_, rowIndex) => (
            <Box as="tr" key={rowIndex}>
              {Array.from({ length: tableStructure.cols }, (_, colIndex) =>
                renderTableCell(rowIndex, colIndex)
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TableContent; 