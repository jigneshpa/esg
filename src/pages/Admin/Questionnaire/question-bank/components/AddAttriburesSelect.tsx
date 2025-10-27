import React, { useEffect, useState } from 'react';
import { BiEdit, BiSave, BiTrash } from 'react-icons/bi';
import { components } from 'react-select';
import AsyncCreatableSelect from 'react-select/creatable';
import { Button, Flex, HStack, Input, Text, Tooltip } from '@chakra-ui/react';

import { customDraftInputStyles } from '@/components/common/InputOption';

interface DataItem {
  value: number;
  label: string;
}

interface SelectProps {
  data: DataItem[];
  addHook: any;
  editHook: any;
  deleteHook: any;
  standardType: string;
  placeholder?: string;
}

interface Option {
  id: number;
  label: string;
  value: string;
}

const transformedData = (data: DataItem[]) => {
  return data.map(item => ({
    id: item.value,
    label: item.label,
    value: item.label.toLowerCase().replace(/\s+/g, '')
  }));
};
const getNextId = (data: DataItem[]) => {
  const maxId = data.length ? Math.max(...data.map(item => item.value)) : 0;
  return maxId + 1;
};

const createOption = (label: string, data: DataItem[]) => ({
  id: getNextId(data),
  label,
  value: label.toLowerCase().replace(/\W/g, '')
});
const updateOptions = (options: Option[], id: number, label: string): Option[] => {
  return options.map(option =>
    option.id === id ? { ...option, label, value: label.toLowerCase().replace(/\W/g, '') } : option
  );
};

export const Select: React.FC<SelectProps> = ({
  data,
  addHook,
  editHook,
  deleteHook,
  standardType,
  placeholder = ''
}) => {
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState<false | true | undefined>(undefined);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [options, setOptions] = useState(transformedData(data));
  const [value, setValue] = useState<Option | null>();
  // const dispatch = useAppDispatch();
  const {
    handleSubmit: addHandleSubmit,
    onSubmit: addOnSubmit,

    isLoading: isLoadingAdd
  } = addHook;
  const {
    handleSubmit: editHandleSubmit,
    onSubmit: editOnSubmit,

    isLoading: isLoadingEdit
  } = editHook;
  const { handleDelete: handleDeleteHook, isLoading: isLoadingDelete } = deleteHook;

  useEffect(() => {
    setIsLoadingState(isLoadingDelete || isLoadingAdd || isLoadingEdit);
  }, [isLoadingDelete, isLoadingAdd, isLoadingEdit]);

  useEffect(() => {
    setOptions(transformedData(data));
  }, [data]);
  // Implement create functionality here
  const handleCreate = async (inputValue: string) => {
    try {
      await addHandleSubmit(addOnSubmit({ [standardType]: inputValue }));
      // dispatch(setRefetchQuery({ queryKey: standardType, value: true }));
      const newOption = createOption(inputValue, data);
      setOptions(prev => [...prev, newOption]);
      setValue(newOption);
    } catch (error) {
      console.error(error);
    }
  };
  // Implement delete functionality here
  const handleDelete = async (id: number) => {
    setOptions(prev => prev.filter(option => option.id !== id));
    await handleDeleteHook(id);
  };
  // Implement edit functionality here
  const handleEdit = (id: number, label: string) => {
    setEditingId(id);
    setEditValue(label);
  };
  const handleSaveEdit = async (id: number, label: string): Promise<void> => {
    setOptions(prevOptions => {
      const updatedOptions = updateOptions(prevOptions, id, label);
      return updatedOptions;
    });
    try {
      const data = { [standardType]: label };
      await editHandleSubmit(editOnSubmit({ id, data }));
    } catch (error) {
      console.log(error);
    } finally {
      setEditingId(null);
      setEditValue('');
    }
  };

  // Custom option component with buttons
  const CustomOption = (props: any) => {
    const { data } = props;
    return (
      <components.Option {...props}>
        <HStack justify="space-between" w="100%">
          {editingId === data.id ? (
            <Input
              autoFocus
              value={editValue}
              onChange={e => {
                setEditValue(e.target.value);
              }}
              onKeyDown={e => {
                e.stopPropagation();
              }}
              size="xm"
              width="auto"
              flex={1}
            />
          ) : (
            <span>{data.label}</span>
          )}
          <HStack spacing={2}>
            {editingId === data.id ? (
              <Button
                size="xs"
                leftIcon={<BiSave />}
                colorScheme="green"
                onClick={() => {
                  setIsMenuOpen(undefined);
                  if (editingId !== null) {
                    handleSaveEdit(editingId, editValue);
                  }
                }}
              >
                Save
              </Button>
            ) : (
              <Button
                size="xs"
                leftIcon={<BiEdit />}
                colorScheme="green"
                variant="ghost"
                onClick={() => {
                  setIsMenuOpen(true);
                  handleEdit(data.id, data.label);
                }}
              >
                Edit
              </Button>
            )}

            <Button
              size="xs"
              leftIcon={<BiTrash />}
              colorScheme="red"
              variant="ghost"
              onClick={event => {
                event.stopPropagation();
                handleDelete(data.id);
              }}
            >
              Delete
            </Button>
          </HStack>
        </HStack>
      </components.Option>
    );
  };
  const CustomValueContainer = (props: any) => {
    const { children, getValue } = props;
    const selectedValues = getValue();

    const selectedLabels = selectedValues.map((value: { label: any }) => value.label).join(', ');

    return (
      <components.ValueContainer {...props}>
        <Flex alignItems="center" maxWidth="100%px">
          {selectedValues.length > 0 ? (
            <Tooltip label={selectedLabels} aria-label="Selected values">
              <Text isTruncated maxWidth="100%">
                {selectedLabels}
              </Text>
            </Tooltip>
          ) : (
            children
          )}
        </Flex>
      </components.ValueContainer>
    );
  };

  return (
    <AsyncCreatableSelect
      isClearable={true}
      backspaceRemovesValue={true}
      isDisabled={isLoadingState}
      placeholder={placeholder || ''}
      isLoading={isLoadingState}
      onChange={newValue => setValue(newValue)}
      onCreateOption={handleCreate}
      options={options}
      menuIsOpen={isMenuOpen}
      styles={customDraftInputStyles}
      components={{ ValueContainer: CustomValueContainer, Option: CustomOption }}
      value={value}
    />
  );
};
