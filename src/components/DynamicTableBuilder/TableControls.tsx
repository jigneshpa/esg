import React from 'react';
import { Button, HStack } from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';
import { TableStructure } from './DynamicTableBuilder';

interface TableControlsProps {
  isFormMode: boolean;
  tableStructure: TableStructure;
  onSaveTableStructure: () => void;
  onDebugStructure: () => void;
}

const TableControls: React.FC<TableControlsProps> = ({
  isFormMode,
  tableStructure,
  onSaveTableStructure,
  onDebugStructure,
}) => {
  // Render save buttons (only for non-form mode)
  if (isFormMode) return null;
  
  return (
    <HStack justify="center" spacing={4}>
      <Button
        size="lg"
        colorScheme="blue"
        onClick={onDebugStructure}
      >
        Debug Structure
      </Button>
      <Button
        size="lg"
        colorScheme="green"
        onClick={onSaveTableStructure}
        leftIcon={<ViewIcon />}
      >
        Save Table Structure
      </Button>
    </HStack>
  );
};

export default TableControls; 