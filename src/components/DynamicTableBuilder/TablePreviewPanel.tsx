import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { TableCell, TableStructure } from './DynamicTableBuilder';
import TableContent from './TableContent';

interface TablePreviewPanelProps {
  tableStructure: TableStructure;
  tableCells: (TableCell | null)[][];
  selectedCell: { row: number; col: number } | null;
  isInlineEditing: boolean;
  inlineEditCell: { row: number; col: number } | null;
  inlineEditValue: string;
  hideConfiguration: boolean;
  allowEmptyCellEditing?: boolean;
  originalCellContentRef: React.MutableRefObject<Record<string, string>>;
  onInlineEditChange: (value: string) => void;
  onInlineEditKeyPress: (e: React.KeyboardEvent) => void;
  onInlineEditBlur: () => void;
  onCellClick: (row: number, col: number) => void;
}

const TablePreviewPanel: React.FC<TablePreviewPanelProps> = ({
  tableStructure,
  tableCells,
  selectedCell,
  isInlineEditing,
  inlineEditCell,
  inlineEditValue,
  hideConfiguration,
  allowEmptyCellEditing = false,
  originalCellContentRef,
  onInlineEditChange,
  onInlineEditKeyPress,
  onInlineEditBlur,
  onCellClick,
}) => {
  return (
    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Table Preview
      </Text>
      <TableContent
        tableStructure={tableStructure}
        tableCells={tableCells}
        selectedCell={selectedCell}
        isInlineEditing={isInlineEditing}
        inlineEditCell={inlineEditCell}
        inlineEditValue={inlineEditValue}
        hideConfiguration={hideConfiguration}
        allowEmptyCellEditing={allowEmptyCellEditing}
        originalCellContentRef={originalCellContentRef}
        onInlineEditChange={onInlineEditChange}
        onInlineEditKeyPress={onInlineEditKeyPress}
        onInlineEditBlur={onInlineEditBlur}
        onCellClick={onCellClick}
      />
    </Box>
  );
};

export default TablePreviewPanel; 