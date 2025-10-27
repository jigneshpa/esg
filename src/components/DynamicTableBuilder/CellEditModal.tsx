import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  VStack
} from '@chakra-ui/react';

import { TableCell, TableStructure } from './DynamicTableBuilder';

interface CellEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCell: TableCell | null;
  cellEditValue: string;
  onCellEditValueChange: (value: string) => void;
  onEditingCellChange: (cell: TableCell | null) => void;
  onSave: () => void;
  tableStructure: TableStructure;
}

const CellEditModal: React.FC<CellEditModalProps> = ({
  isOpen,
  onClose,
  editingCell,
  cellEditValue,
  onCellEditValueChange,
  onEditingCellChange,
  onSave,
  tableStructure
}) => {
  if (!editingCell) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxW="600px" bg="white">
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          bg="gray.50"
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          Edit Cell Content & Spanning
          <ModalCloseButton position={'static'} />
        </ModalHeader>
        <ModalBody bg="white" p={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Cell Content</FormLabel>
              <Input
                value={cellEditValue}
                onChange={e => onCellEditValueChange(e.target.value)}
                placeholder="Enter cell content"
                bg="white"
                border="1px solid"
                borderColor="gray.300"
              />
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
              <FormControl>
                <FormLabel>Row Span</FormLabel>
                <NumberInput
                  value={editingCell.rowSpan}
                  onChange={(_, value) => onEditingCellChange({ ...editingCell, rowSpan: value })}
                  min={1}
                  max={tableStructure.rows - editingCell.rowIndex}
                >
                  <NumberInputField bg="white" border="1px solid" borderColor="gray.300" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Column Span</FormLabel>
                <NumberInput
                  value={editingCell.colSpan}
                  onChange={(_, value) => onEditingCellChange({ ...editingCell, colSpan: value })}
                  min={1}
                  max={tableStructure.cols - editingCell.colIndex}
                >
                  <NumberInputField bg="white" border="1px solid" borderColor="gray.300" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Grid>

            <Box p={3} bg="blue.50" borderRadius="md" w="100%" border="1px solid" borderColor="blue.200">
              <Text fontSize="sm" fontWeight="semibold" mb={2}>
                Spanning Preview:
              </Text>
              <Text fontSize="sm" color="gray.700">
                This cell will span {editingCell.rowSpan} row(s) and {editingCell.colSpan} column(s)
              </Text>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.200">
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={onSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CellEditModal;
