import React from 'react';
import { useFormContext } from 'react-hook-form';
import DynamicTableBuilder, { TableStructure } from './DynamicTableBuilder';

interface FormTableBuilderProps {
  name: string;
  onTableStructureChange?: (structure: TableStructure) => void;
  hideConfiguration?: boolean;
  allowEmptyCellEditing?: boolean;
}

const FormTableBuilder: React.FC<FormTableBuilderProps> = ({
  name,
  onTableStructureChange,
  hideConfiguration = false,
  allowEmptyCellEditing = false
}) => {
  const { setValue, watch } = useFormContext();

  // Get the current table structure from the form
  const currentTableData = watch(name);

  // Convert form data to TableStructure format
  const getInitialStructure = (): TableStructure => {
    if (currentTableData && typeof currentTableData === 'object') {
      // Use the data as-is - it should already be in the correct format
      return currentTableData as TableStructure;
    }

    // Default structure
    return {
      id: '1',
      name: 'New Table',
      description: '',
      columns: [],
      cells: [],
      rows: 3,
      cols: 3,
    };
  };

  // Handle table structure changes
  const handleTableStructureChange = (structure: TableStructure) => {
    setValue(name, structure);

    // Call the optional callback function if provided
    if (onTableStructureChange) {
      onTableStructureChange(structure);
    }
  };

  const initialStructure = getInitialStructure();

  return (
    <DynamicTableBuilder
      initialStructure={initialStructure}
      onTableStructureChange={handleTableStructureChange}
      isFormMode={true}
      hideConfiguration={hideConfiguration}
      allowEmptyCellEditing={allowEmptyCellEditing}
    />
  );
};

export default FormTableBuilder; 