import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  useDisclosure,
  useToast
} from '@chakra-ui/react';

// Import the new components
import TableContent from './TableContent';
import TableConfigurationPanel from './TableConfigurationPanel';
import TablePreviewPanel from './TablePreviewPanel';
import ColumnEditModal from './ColumnEditModal';
import CellEditModal from './CellEditModal';
import TableControls from './TableControls';

// Types
export interface TableColumn {
  id: string;
  header: string;
  width: number;
  type: 'text' | 'number' | 'date';
  isHeader: boolean;
  isRequired: boolean;
  questionText?: string;
}

export interface TableCell {
  id: string;
  rowIndex: number;
  colIndex: number;
  rowSpan: number;
  colSpan: number;
  content: string;
  isHeader: boolean;
  isQuestion: boolean;
  questionText?: string;
}

export interface TableStructure {
  id: string;
  name: string;
  description: string;
  columns: TableColumn[];
  cells: TableCell[];
  rows: number;
  cols: number;
}

interface DynamicTableBuilderProps {
  onTableStructureChange?: (structure: TableStructure) => void;
  initialStructure?: TableStructure;
  isFormMode?: boolean;
  hideConfiguration?: boolean;
  allowEmptyCellEditing?: boolean;
}

// Main Component
const DynamicTableBuilder: React.FC<DynamicTableBuilderProps> = ({
  onTableStructureChange,
  initialStructure,
  isFormMode = false,
  hideConfiguration = false,
  allowEmptyCellEditing = false
}) => {
  const originalCellContentRef = useRef<Record<string, string>>({});

  const [tableStructure, setTableStructure] = useState<TableStructure>(
    initialStructure || {
      id: '1',
      name: 'New Table',
      description: '',
      columns: [],
      cells: [],
      rows: 3,
      cols: 3,
    }
  );
  // console.log('initialStructure 123', JSON.stringify(initialStructure));
  // Notify parent component when table structure changes
  useEffect(() => {
    if (onTableStructureChange) {
      onTableStructureChange(tableStructure);
    }
  }, [tableStructure, onTableStructureChange]);

  // Track original cell content to distinguish between original and user-entered content
  useEffect(() => {
    // Only set original content if it hasn't been set yet (initial load)
    if (Object.keys(originalCellContentRef.current).length === 0) {
      const originalContent: Record<string, string> = {};
      (tableStructure.cells || []).forEach(cell => {
        const key = `${cell.rowIndex}-${cell.colIndex}`;
        originalContent[key] = cell.content || '';
      });
      originalCellContentRef.current = originalContent;
    }
  }, [tableStructure.cells, originalCellContentRef]);

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isEditingCell, setIsEditingCell] = useState(false);
  const [cellEditValue, setCellEditValue] = useState('');
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [inlineEditValue, setInlineEditValue] = useState('');
  const [inlineEditCell, setInlineEditCell] = useState<{ row: number; col: number } | null>(null);

  const { isOpen: isColumnModalOpen, onOpen: onColumnModalOpen, onClose: onColumnModalClose } = useDisclosure();
  const { isOpen: isCellModalOpen, onOpen: onCellModalOpen, onClose: onCellModalClose } = useDisclosure();
  const [editingColumn, setEditingColumn] = useState<TableColumn | null>(null);
  const [editingCell, setEditingCell] = useState<TableCell | null>(null);

  const toast = useToast();

  // Generate table cells
  const tableCells = useMemo(() => {
    const cells: (TableCell | null)[][] = [];

    for (let row = 0; row < tableStructure.rows; row++) {
      cells[row] = [];
      for (let col = 0; col < tableStructure.cols; col++) {
        const existingCell = (tableStructure.cells || []).find(
          cell => cell.rowIndex === row && cell.colIndex === col
        );

        cells[row][col] = existingCell || {
          id: `${row}-${col}`,
          rowIndex: row,
          colIndex: col,
          rowSpan: 1,
          colSpan: 1,
          content: '',
          isHeader: false,
          isQuestion: false,
        };
      }
    }

    return cells;
  }, [tableStructure]);

  // Add new column
  const addColumn = () => {
    const newColumn: TableColumn = {
      id: `col-${Date.now()}`,
      header: `Column ${tableStructure.columns.length + 1}`,
      width: 150,
      type: 'text',
      isHeader: false,
      isRequired: false,
    };

    setTableStructure(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn],
      cols: prev.cols + 1,
    }));

    toast({
      title: 'Column added',
      status: 'success',
      duration: 2000,
    });
  };

  // Edit column
  const editColumn = (column: TableColumn) => {
    setEditingColumn(column);
    onColumnModalOpen();
  };

  // Delete column
  const deleteColumn = (id?: string) => {
    if (!id && tableStructure.columns.length === 0) return;

    const columnId = id || tableStructure.columns[tableStructure.columns.length - 1]?.id;
    if (!columnId) return;

    setTableStructure(prev => ({
      ...prev,
      columns: prev.columns.filter(col => col.id !== columnId),
      cols: Math.max(1, prev.cols - 1),
    }));

    toast({
      title: 'Column deleted',
      status: 'success',
      duration: 2000,
    });
  };

  // Save column changes
  const saveColumn = () => {
    if (!editingColumn) return;

    setTableStructure(prev => ({
      ...prev,
      columns: prev.columns.map(col =>
        col.id === editingColumn.id ? editingColumn : col
      ),
    }));

    onColumnModalClose();
    setEditingColumn(null);
  };

  // Add row
  const addRow = () => {
    setTableStructure(prev => ({
      ...prev,
      rows: prev.rows + 1,
    }));
  };

  // Delete row
  const deleteRow = () => {
    setTableStructure(prev => ({
      ...prev,
      rows: Math.max(1, prev.rows - 1),
    }));
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    const cell = tableCells[row][col];
    if (!cell) return;

    if (hideConfiguration) {
      // Answer mode: Use inline editing
      setInlineEditCell({ row, col });
      setInlineEditValue(cell.content || '');
      setIsInlineEditing(true);
    } else {
      // Edit mode: Use modal editing
      setSelectedCell({ row, col });
      setCellEditValue(cell.content || '');
      setEditingCell(cell);
      onCellModalOpen();
    }
  };

  // Save cell changes
  const saveCell = () => {
    if (!editingCell) return;

    const updatedCell = { ...editingCell, content: cellEditValue };

    setTableStructure(prev => ({
      ...prev,
      cells: [
        ...(prev?.cells || []).filter(cell =>
          !(cell.rowIndex === editingCell.rowIndex && cell.colIndex === editingCell.colIndex)
        ),
        updatedCell,
      ],
    }));

    onCellModalClose();
    setEditingCell(null);
    setCellEditValue('');
  };

  // Save table structure
  const saveTableStructure = () => {
    // Store the exact same structure as tableStructure
    const databaseStructure = {
      id: tableStructure.id,
      name: tableStructure.name,
      description: tableStructure.description,
      columns: tableStructure.columns,
      cells: tableStructure.cells,
      rows: tableStructure.rows,
      cols: tableStructure.cols
    };

    toast({
      title: 'Table structure saved',
      description: `Structure logged to console. Ready for database storage.`,
      status: 'success',
      duration: 5000,
    });
  };

  // Save inline editing
  const saveInlineEdit = () => {
    if (!inlineEditCell) return;

    const { row, col } = inlineEditCell;
    const cell = tableCells[row][col];

    if (cell) {
      const updatedCell = { ...cell, content: inlineEditValue };

      setTableStructure(prev => ({
        ...prev,
        cells: [
          ...prev.cells.filter(c =>
            !(c.rowIndex === row && c.colIndex === col)
          ),
          updatedCell,
        ],
      }));
    }

    // Reset inline editing state
    setIsInlineEditing(false);
    setInlineEditCell(null);
    setInlineEditValue('');
  };

  // Cancel inline editing
  const cancelInlineEdit = () => {
    setIsInlineEditing(false);
    setInlineEditCell(null);
    setInlineEditValue('');
  };

  // Handle inline edit key press
  const handleInlineEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveInlineEdit();
    } else if (e.key === 'Escape') {
      cancelInlineEdit();
    }
  };

  // Debug structure
  const debugStructure = () => {
    console.log('=== CURRENT TABLE STRUCTURE ===');
    console.log('Table Structure:', tableStructure);
    console.log('Table Cells:', tableCells);
    toast({
      title: 'Structure logged',
      description: 'Check console for current table structure',
      status: 'info',
      duration: 3000,
    });
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">

        {/* Table Configuration */}
        {!hideConfiguration && (
          <TableConfigurationPanel
            tableStructure={tableStructure}
            onTableStructureChange={setTableStructure}
            onEditColumn={editColumn}
            onAddRow={addRow}
            onDeleteRow={deleteRow}
            onAddColumn={addColumn}
            onDeleteColumn={deleteColumn}
          />
        )}

        {/* Table Preview */}
        {!hideConfiguration && (
          <TablePreviewPanel
            tableStructure={tableStructure}
            tableCells={tableCells}
            selectedCell={selectedCell}
            isInlineEditing={isInlineEditing}
            inlineEditCell={inlineEditCell}
            inlineEditValue={inlineEditValue}
            hideConfiguration={hideConfiguration}
            allowEmptyCellEditing={allowEmptyCellEditing}
            originalCellContentRef={originalCellContentRef}
            onInlineEditChange={setInlineEditValue}
            onInlineEditKeyPress={handleInlineEditKeyPress}
            onInlineEditBlur={saveInlineEdit}
            onCellClick={handleCellClick}
          />
        )}

        {/* Table Content (always shown) */}
        {hideConfiguration && (
          <TableContent
            tableStructure={tableStructure}
            tableCells={tableCells}
            selectedCell={selectedCell}
            isInlineEditing={isInlineEditing}
            inlineEditCell={inlineEditCell}
            inlineEditValue={inlineEditValue}
            hideConfiguration={hideConfiguration}
            originalCellContentRef={originalCellContentRef}
            onInlineEditChange={setInlineEditValue}
            onInlineEditKeyPress={handleInlineEditKeyPress}
            onInlineEditBlur={saveInlineEdit}
            onCellClick={handleCellClick}
            allowEmptyCellEditing={allowEmptyCellEditing}
            isFormMode={isFormMode}
          />
        )}

        {/* Save Buttons */}
        {!hideConfiguration && (
          <TableControls
            isFormMode={isFormMode}
            tableStructure={tableStructure}
            onSaveTableStructure={saveTableStructure}
            onDebugStructure={debugStructure}
          />
        )}
      </VStack>

      {/* Modals */}
      {!hideConfiguration && (
        <ColumnEditModal
          isOpen={isColumnModalOpen}
          onClose={onColumnModalClose}
          editingColumn={editingColumn}
          onEditingColumnChange={setEditingColumn}
          onSave={saveColumn}
        />
      )}

      <CellEditModal
        isOpen={isCellModalOpen}
        onClose={onCellModalClose}
        editingCell={editingCell}
        cellEditValue={cellEditValue}
        onCellEditValueChange={setCellEditValue}
        onEditingCellChange={setEditingCell}
        onSave={saveCell}
        tableStructure={tableStructure}
      />
    </Box>
  );
};

export default DynamicTableBuilder; 