import { useState } from 'react';
import { BsCheck } from 'react-icons/bs';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import { MdCategory } from 'react-icons/md';
import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure
} from '@chakra-ui/react';

import { STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';

interface Category {
  id: number;
  name: string;
}

interface ManageCategoriesProps {
  categories: Category[];
  onAddCategory: (name: string) => Promise<void>;
  onUpdateCategory: (id: number, name: string) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
}

const ManageCategories = ({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }: ManageCategoriesProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [updatingCategoryId, setUpdatingCategoryId] = useState<number | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const { confirm, notify } = useAppContext();

  const handleAddCategory = async () => {
    if (isAddingCategory) {
      return;
    }
    if (!newCategoryName.trim()) {
      notify({
        type: STATUS.ERROR,
        message: 'Category name cannot be empty'
      });
      return;
    }
    if (categories.find(category => category?.name?.toLowerCase() === newCategoryName.toLowerCase())) {
      notify({
        type: STATUS.ERROR,
        message: 'Category already exists'
      });
      return;
    }

    try {
      setIsAddingCategory(true);
      await onAddCategory(newCategoryName);
      setNewCategoryName('');
      notify({
        type: STATUS.SUCCESS,
        message: 'Category added successfully'
      });
    } catch (error) {
      notify({
        type: STATUS.ERROR,
        message: 'Failed to add category'
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleUpdateCategory = async (id: number, newName: string) => {
    if (updatingCategoryId !== null) {
      return;
    }
    if (!newName.trim()) {
      notify({
        type: STATUS.ERROR,
        message: 'Category name cannot be empty'
      });
      return;
    }

    try {
      setUpdatingCategoryId(id);
      await onUpdateCategory(id, newName);
      setEditingCategory(null);
      notify({
        type: STATUS.SUCCESS,
        message: 'Category updated successfully'
      });
    } catch (error) {
      notify({
        type: STATUS.ERROR,
        message: 'Failed to update category'
      });
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (deletingCategoryId !== null) return;

    confirm({
      type: STATUS.ERROR,
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category?',
      okBtnLabel: 'Delete',
      onOk: async () => {
        try {
          setDeletingCategoryId(id);
          await onDeleteCategory(id);
          notify({
            type: STATUS.SUCCESS,
            message: 'Category deleted successfully'
          });
        } catch (error) {
          notify({
            type: STATUS.ERROR,
            message: 'Failed to delete category'
          });
        } finally {
          setDeletingCategoryId(null);
        }
      }
    });
  };

  return (
    <>
      <Button leftIcon={<MdCategory />} colorScheme="blue" onClick={onOpen}>
        Manage Categories
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalHeader display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
            Manage Categories
            <ModalCloseButton onClick={onClose} position={'static'} />
          </ModalHeader>
          <ModalBody pb={6}>
            <HStack mb={4}>
              <Input
                placeholder="New category name"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                isDisabled={isAddingCategory}
              />
              <IconButton
                aria-label="Add category"
                icon={isAddingCategory ? <Spinner size="sm" /> : <FaPlus />}
                colorScheme="green"
                onClick={handleAddCategory}
                isDisabled={isAddingCategory}
              />
            </HStack>

            <Box overflowX="auto" overflowY="auto" maxH="500px">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th width="150px">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {categories.map(category => (
                    <Tr key={category.id}>
                      <Td>
                        {editingCategory?.id === category.id ? (
                          <HStack>
                            <Input
                              value={editingCategory.name}
                              onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                              isDisabled={updatingCategoryId === category.id}
                              autoFocus
                            />
                            <IconButton
                              aria-label="Save changes"
                              icon={updatingCategoryId === category.id ? <Spinner size="sm" /> : <BsCheck />}
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleUpdateCategory(category.id, editingCategory.name)}
                              isDisabled={updatingCategoryId === category.id}
                            />
                            <IconButton
                              aria-label="Cancel edit"
                              icon={<IoCloseOutline />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => setEditingCategory(null)}
                              isDisabled={updatingCategoryId === category.id}
                            />
                          </HStack>
                        ) : updatingCategoryId === category.id ? (
                          <HStack>
                            <Spinner size="sm" />
                            <Box ml={2}>{category.name}</Box>
                          </HStack>
                        ) : (
                          category.name
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit category"
                            icon={<FaEdit />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => setEditingCategory(category)}
                            isDisabled={
                              editingCategory !== null ||
                              updatingCategoryId === category.id ||
                              deletingCategoryId === category.id
                            }
                          />
                          <IconButton
                            aria-label="Delete category"
                            icon={deletingCategoryId === category.id ? <Spinner size="sm" /> : <FaTrash />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteCategory(category.id)}
                            isDisabled={
                              editingCategory !== null ||
                              updatingCategoryId === category.id ||
                              deletingCategoryId === category.id
                            }
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ManageCategories;
