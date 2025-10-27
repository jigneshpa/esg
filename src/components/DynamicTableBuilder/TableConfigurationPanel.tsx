import React from 'react';
import {
  Box, FormControl,
  FormLabel,
  Grid,
  HStack, Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text
} from '@chakra-ui/react';
import { TableColumn, TableStructure } from './DynamicTableBuilder';

interface TableConfigurationPanelProps {
  tableStructure: TableStructure;
  onTableStructureChange: (structure: TableStructure) => void;
  onEditColumn: (column: TableColumn) => void;
  onAddRow: () => void;
  onDeleteRow: () => void;
  onAddColumn: () => void;
  onDeleteColumn: (id?: string) => void;
}

const TableConfigurationPanel: React.FC<TableConfigurationPanelProps> = ({
  tableStructure,
  onTableStructureChange,
  onEditColumn,
  onAddRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn
}) => {
  return (
    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Table Configuration
      </Text>

      <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={4}>
        <FormControl>
          <FormLabel>Table Name</FormLabel>
          <Input
            value={tableStructure.name}
            onChange={(e) => onTableStructureChange({ ...tableStructure, name: e.target.value })}
            placeholder="Enter table name"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input
            value={tableStructure.description}
            onChange={(e) => onTableStructureChange({ ...tableStructure, description: e.target.value })}
            placeholder="Enter description"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Rows</FormLabel>
          <HStack>
            <NumberInput
              value={tableStructure.rows}
              onChange={(_, value) => onTableStructureChange({ ...tableStructure, rows: value })}
              min={1}
              max={20}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {/* <Button size="sm" onClick={onAddRow}>Add Row</Button> */}
            {/* <Button size="sm" onClick={onDeleteRow} colorScheme="red">Delete Row</Button> */}
          </HStack>
        </FormControl>
      </Grid>

      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
        <FormControl>
          <FormLabel>Columns</FormLabel>
          <HStack>
            <NumberInput
              value={tableStructure.cols}
              onChange={(_, value) => onTableStructureChange({ ...tableStructure, cols: value })}
              min={1}
              max={20}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {/* <Button size="sm" onClick={onAddColumn}>Add Column</Button>
            <Button size="sm" onClick={() => onDeleteColumn(tableStructure.columns[tableStructure.columns.length - 1]?.id)} colorScheme="red">Delete Column</Button> */}
          </HStack>
        </FormControl>

        {/* <FormControl>
          <FormLabel>Current Columns</FormLabel>
          <HStack spacing={2} flexWrap="wrap">
            {(tableStructure.columns || []).map((column, index) => (
              <Box
                key={column.id}
                p={1}
                bg={column.isHeader ? "purple.50" : "blue.50"}
                border="1px solid"
                borderColor={column.isHeader ? "purple.200" : "blue.200"}
                borderRadius="sm"
                fontSize="xs"
              >
                <HStack spacing={1}>
                  <Text fontWeight="semibold">{column.header}</Text>
                  {column.isHeader && (
                    <Box
                      bg="purple.500"
                      color="white"
                      fontSize="xs"
                      px="1px"
                      py="1px"
                      borderRadius="sm"
                    >
                      H
                    </Box>
                  )}
                  <IconButton
                    size="xs"
                    icon={<EditIcon />}
                    aria-label="Edit column"
                    onClick={() => onEditColumn(column)}
                  />
                </HStack>
              </Box>
            ))}
            {(!tableStructure.columns || tableStructure.columns.length === 0) && (
              <Text color="gray.500" fontSize="sm">
                No columns
              </Text>
            )}
          </HStack>
        </FormControl> */}
      </Grid>
    </Box>
  );
};

export default TableConfigurationPanel; 