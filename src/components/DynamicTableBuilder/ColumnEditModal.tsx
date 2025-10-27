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
  Select,
  Text,
  VStack
} from '@chakra-ui/react';

import { TableColumn } from './DynamicTableBuilder';

interface ColumnEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingColumn: TableColumn | null;
  onEditingColumnChange: (column: TableColumn | null) => void;
  onSave: () => void;
}

const ColumnEditModal: React.FC<ColumnEditModalProps> = ({
  isOpen,
  onClose,
  editingColumn,
  onEditingColumnChange,
  onSave
}) => {
  if (!editingColumn) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="600px">
        <ModalHeader display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          Edit Column
          <ModalCloseButton onClick={onClose} position={'static'} />
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Column Header</FormLabel>
              <Input
                value={editingColumn.header}
                onChange={e => onEditingColumnChange({ ...editingColumn, header: e.target.value })}
                placeholder="Enter column header"
              />
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl>
                <FormLabel>Column Type</FormLabel>
                <Select
                  value={editingColumn.type}
                  onChange={e => onEditingColumnChange({ ...editingColumn, type: e.target.value as any })}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Width (px)</FormLabel>
                <NumberInput
                  value={editingColumn.width}
                  onChange={(_, value) => onEditingColumnChange({ ...editingColumn, width: value })}
                  min={50}
                  max={500}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Grid>

            <FormControl>
              <FormLabel>Question Text (for headers)</FormLabel>
              <Input
                value={editingColumn.questionText || ''}
                onChange={e => onEditingColumnChange({ ...editingColumn, questionText: e.target.value })}
                placeholder="Enter question text that will appear in the header"
              />
              <Text fontSize="sm" color="gray.600" mt={1}>
                This text will be displayed as a question in the table header
              </Text>
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl>
                <FormLabel>Column Role</FormLabel>
                <Select
                  value={editingColumn.isHeader ? 'header' : 'data'}
                  onChange={e =>
                    onEditingColumnChange({
                      ...editingColumn,
                      isHeader: e.target.value === 'header'
                    })
                  }
                >
                  <option value="data">Data Column (users fill)</option>
                  <option value="header">Header/Question (non-editable)</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Required Field</FormLabel>
                <Select
                  value={editingColumn.isRequired ? 'required' : 'optional'}
                  onChange={e =>
                    onEditingColumnChange({
                      ...editingColumn,
                      isRequired: e.target.value === 'required'
                    })
                  }
                >
                  <option value="optional">Optional</option>
                  <option value="required">Required</option>
                </Select>
              </FormControl>
            </Grid>

            {editingColumn.isHeader && (
              <Box p={3} bg="purple.50" borderRadius="md" w="100%">
                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                  📝 Header Column Preview:
                </Text>
                <Text fontSize="sm" color="gray.700">
                  • This column will be <strong>non-editable</strong> for users
                  <br />
                  • Users will see the header/question text but cannot modify it
                  <br />• Perfect for survey questions, labels, or instructions
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
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

export default ColumnEditModal;
