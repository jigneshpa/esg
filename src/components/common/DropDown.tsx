//@ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { BsChevronDown } from 'react-icons/bs';
import { MdOutlineClose } from 'react-icons/md';
import { components } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import {
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Text,
  useOutsideClick,
  useStyleConfig,
  VStack
} from '@chakra-ui/react';

/**
 * options: [{value: string, label: string}]
 * size: 'sm' | 'md
 * selection: 'single' | 'multiple'
 */

const SINGLE = 'single';
const MULTIPLE = 'multiple';

const dropdownButtonStyle = {
  w: '100%',
  h: '100%',
  border: '1px solid',
  bg: 'white',
  fontWeight: 'inherit'
};

const optionStyle = {
  flex: 1,
  overflow: 'hidden',
  whiteSpace: 'wrap',
  color: '#6C757D'
};

const CustomValueContainer = (props: any) => {
  const { children, getValue } = props;
  const numValues = getValue().length;
  const label = `${numValues} selected`;

  return <components.ValueContainer {...props}>{numValues > 0 ? label : children}</components.ValueContainer>;
};

const CheckboxOption = (props: any) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        style={{ marginRight: '5px', accentColor: '#137E59' }}
      />
      {props.children}
    </components.Option>
  );
};

const CustomInput = props => {
  const { innerRef, children, ...rest } = props;

  return (
    <Box style={{ position: 'relative', borderBottom: '1px solid #D9D9D9' }}>
      <InputGroup>
        <InputLeftElement top={'-10px'} ml="2px" justifyContent={'start'}>
          <Icon as={BiSearch} color="primary" fontSize="1.3em" />
        </InputLeftElement>
        <Input
          border={'unset'}
          _focus={{
            boxShadow: 'unset'
          }}
          ref={innerRef}
          {...rest}
          sx={{
            '&[aria-invalid=true]': { boxShadow: 'unset' },
            color: '#6C757D',
            padding: '0 0 5px 25px'
          }}
        />
      </InputGroup>
    </Box>
  );
};

const CustomDropdownIndicator = () => null; // Custom component to replace default dropdown indicator

const DropdownIndicatorCom = (props: any) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <AiFillFilter style={{ color: props.isFocused ? '#B7EB8F' : '#ffff' }} />
      </components.DropdownIndicator>
    )
  );
};

const AsyncDropDownCustomStyles = {
  control: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    backgroundColor: 'transparent',
    border: 'none',
    minWidth: '100%',
    cursor: 'pointer',
    color: '#6C757D',
    boxShadow: 'none !important'
  }),
  option: (
    baseStyles: Record<string, any>,
    { isFocused, isSelected }: { isFocused: boolean, isSelected: boolean }
  ) => ({
    ...baseStyles,
    backgroundColor: isSelected ? '#fff' : isFocused ? '#fff' : '#fff',
    color: '#6C757D !important'
  }),

  placeholder: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    color: 'white'
  }),

  noOptionsMessage: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    color: '#6C757D'
  }),
  indicatorSeparator: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    display: 'none'
  }),

  IndicatorsContainer2: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    color: '#FFF !important'
  }),
  container: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    width: '100%'
  }),

  menu: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    backgroundColor: 'white',
    border: '0px solid',
    boxShadow: 'none'
  }),
  menuList: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    maxHeight: '130px'
  }),
  input: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    color: 'white'
  })
};

const DropDown = ({
  isLoading = false,
  table = false,
  placeholder,
  options,
  value,
  onChange,
  background,
  w = null,
  size = 'md',
  selection = 'single',
  borderRadius = '10px',
  isInvalid = false,
  customStyles,
  ClearIndicatorStyles,
  loadOptions,
  label,
  AsyncPage,
  borderColor,
  DropdownIndicator,
  ...rest
}: any) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement | null>();
  const [optionList, setOptionList] = useState([]);
  const [open, setOpen] = useState(false);
  const TextEllipsis = useStyleConfig('TextEllipsis');

  useEffect(() => {
    setOptionList(options);
  }, [options]);

  useEffect(() => {
    if (open && inputRef) {
      inputRef?.current?.focus();
    }
  }, [open, inputRef]);

  useOutsideClick({
    ref,
    handler: () => setOpen(false)
  });

  const buttonStyle = useMemo(() => {
    if (isInvalid) {
      return {
        border: '1px solid',
        borderColor: 'red.500'
      };
    }
    if (open) return { borderColor: 'primary', boxShadow: '0 0 0 1px primary' };
    return { borderColor: 'border' };
  }, [isInvalid, open]);

  const handleSearch = (e: any) => {
    const result = options.filter((item: any) =>
      item.label.toString().toLowerCase().includes(e.target.value.toLowerCase())
    );
    setOptionList(result);
  };

  const handleSelectOption = (selected: number) => {
    if (selection === SINGLE) {
      onChange(selected);
      setOpen(false);
    }
    if (selection === MULTIPLE) {
      const newValues = value ? [...value] : [];
      if (newValues.some(item => item === selected)) {
        newValues.splice(
          newValues?.findIndex(item => item === selected),
          1
        );
      } else {
        newValues.push(selected);
      }
      onChange(newValues);
    }
  };

  const handleToggleSelectAll = () => {
    if (value?.length === optionList.length) {
      onChange([]);
    } else {
      /* @ts-ignore */
      onChange(optionList.map(item => item.value));
    }
  };

  const getSelectedText = () => {
    if (!optionList || !value || value.length === 0) {
      return '';
    }
    const selectedOption = optionList.find(item => item.value === value[0]);
    if (value.length > 1) {
      return `${value.length} selected`;
    }
    return selectedOption ? selectedOption.label : '';
  };
  return (
    <VStack alignItems="flex-start" spacing={0} width={'-webkit-fill-available'}>
      {label && (
        <Text fontSize={14} color="#262626">
          {label}
        </Text>
      )}
      <Box
        ref={ref}
        position={'relative'}
        w={w ? w : 'fit-content'}
        h={table ? 'unset' : (size === 'sm' && '32px') || '40px'}
        borderRadius={(size === 'sm' && '6px') || '10px'}
        fontSize={size === 'sm' && '0.9em'}
        lineHeight={size === 'sm' && '1.5'}
        boxSizing={'border-box'}
        sx={
          isInvalid && {
            border: '1px solid',
            borderColor: 'red.500',
            boxShadow: '0 0 0 1px #EC4F5C'
          }
        }
        {...rest}
      >
        <Button
          fontSize="inherit"
          variant="unstyled"
          p={table ? 'unset' : (size === 'sm' && '6px 10px') || '6px 16px'}
          borderRadius={borderRadius}
          title={selection === SINGLE ? optionList?.find(item => item.value === value)?.label || placeholder : null}
          border={isInvalid ? 'unset' : '1px solid'}
          onClick={() => setOpen(!open)}
          {...buttonStyle}
          borderColor={table ? 'transparent' : borderColor ? borderColor : 'unset'}
          {...dropdownButtonStyle}
          bg={table ? 'transparent' : 'unset'}
        >
          {selection === SINGLE && (
            <Flex w={'100%'} justifyContent={'space-between'} alignItems={'center'}>
              <Text
                flex={1}
                textAlign={'left'}
                overflow={'hidden'}
                fontWeight={'inherit'}
                whiteSpace={'nowrap'}
                textOverflow={'ellipsis'}
                fontSize="inherit"
              >
                {optionList?.find(item => item.value === value)?.label || placeholder}
              </Text>
              <Icon
                flexBasis={'14px'}
                as={DropdownIndicator ? DropdownIndicator : BsChevronDown}
                transform={open && !DropdownIndicator ? `rotate(180deg)` : null}
                color={optionList?.find(item => item.value === value)?.label ? 'currentColor' : 'grey.500'}
              />
            </Flex>
          )}
          <Flex w={'100%'} justifyContent={'space-between'} alignItems={'center'} gap={2}>
            <Text fontSize="inherit">{placeholder}</Text>

            {selection === MULTIPLE && !!value?.length && (
              <>
                <HStack
                  w={'100%'}
                  maxW={'fit-content'}
                  px={(size === 'sm' && '2px') || '10px'}
                  // bg={'grey.100'}
                  bg={background ? background : 'grey.100'}
                  border={'1px solid'}
                  borderColor={'border'}
                >
                  <Text fontSize={size === 'sm' && '12px'} overflow={'hidden'} textOverflow={'ellipsis'}>
                    {getSelectedText()}
                  </Text>
                  <Icon as={MdOutlineClose} fontSize={'10px'} onClick={() => onChange([])} />
                </HStack>
              </>
            )}
            <Icon
              flexBasis={'14px'}
              as={DropdownIndicator ? DropdownIndicator : BsChevronDown}
              transform={open && !DropdownIndicator ? `rotate(180deg)` : null}
            />
          </Flex>
        </Button>
        {AsyncPage ? (
          <VStack
            className={'custom-scroll-bar'}
            position={'absolute'}
            borderRadius={'6px'}
            w={'100%'}
            minH={'190px'}
            bg={'white'}
            py={'6px'}
            border={'1px solid'}
            borderColor={'border'}
            display={open ? 'block' : 'none'}
            boxShadow={'0px 0px 16px 0px #0000001A'}
            overflow={'auto'}
            zIndex={10}
          >
            <AsyncPaginate
              isClearable
              placeholder={''}
              noOptionsMessage={() => 'No Companies Found'}
              onChange={e => onChange(e.map(item => item.value))}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              loadOptions={loadOptions}
              additional={{ page: 1 }}
              styles={{ ...AsyncDropDownCustomStyles, clearIndicator: ClearIndicatorStyles }}
              isMulti
              menuIsOpen={true}
              components={{
                Option: CheckboxOption,
                ValueContainer: CustomValueContainer,
                DropdownIndicatorCom,
                DropdownIndicator: CustomDropdownIndicator,
                Input: CustomInput
              }}
            />
          </VStack>
        ) : (
          <VStack
            className={'custom-scroll-bar'}
            position={'absolute'}
            borderRadius={'6px'}
            w={'100%'}
            maxH={'350px'}
            bg={'white'}
            py={'6px'}
            border={'1px solid'}
            borderColor={'border'}
            display={open ? 'block' : 'none'}
            boxShadow={'0px 0px 16px 0px #0000001A'}
            overflow={'auto'}
            zIndex={10}
          >
            {isLoading ? (
              <Center p={'10px 14px'} color={'grey'}>
                <Spinner />
              </Center>
            ) : (
              <>
                <Box borderBottom={'1px solid'} borderColor={'border'}>
                  <InputGroup>
                    <InputLeftElement w="40px" h="44px" ml="2px">
                      <Icon as={BiSearch} color="primary" fontSize="1.3em" />
                    </InputLeftElement>
                    <Input
                      ref={inputRef}
                      border={'unset'}
                      onChange={handleSearch}
                      _focus={{
                        boxShadow: 'unset'
                      }}
                      sx={{
                        '&[aria-invalid=true]': { boxShadow: 'unset' },
                        color: '#6C757D'
                      }}
                    />
                  </InputGroup>
                </Box>

                {selection === MULTIPLE && !!optionList?.length && (
                  <Box
                    sx={optionStyle}
                    onClick={handleToggleSelectAll}
                    borderBottom={'1px solid'}
                    borderColor={'border'}
                  >
                    <Checkbox
                      isChecked={value?.length === optionList?.length}
                      as={'div'}
                      w={'100%'}
                      h={'100%'}
                      p={'10px 14px'}
                    >
                      <p style={{ fontSize: '14px' }}>Select all</p>
                    </Checkbox>
                  </Box>
                )}
                {!optionList?.length && (
                  <Box p={'10px 14px'} color={'grey'}>
                    No data
                  </Box>
                )}
                {!!optionList?.length &&
                  optionList.map((item, index) => (
                    <HStack
                      key={`${item.value}-${index}`}
                      bg={value === item.value ? 'white' : 'white'}
                      _hover={item?.disabled || value === item.value ? null : { bg: 'white' }}
                      cursor={item?.disabled ? 'not-allowed' : 'pointer'}
                    >
                      <Box
                        key={`${item.value}-${index}`}
                        sx={optionStyle}
                        color={item?.disabled ? 'grey.300' : 'inherit'}
                        onClick={() => item?.disabled || handleSelectOption(item.value)}
                      >
                        {selection === SINGLE && (
                          <Box p={'10px 14px'} sx={TextEllipsis} title={item.label}>
                            {item.label}
                          </Box>
                        )}
                        {selection === MULTIPLE && (
                          <HStack width={'100%'} p={'10px 14px'} title={item.label}>
                            <Checkbox as={'div'} isChecked={value?.some(value => value === item.value)} />
                            <Box
                              px={{ base: '16px', md: 0 }}
                              sx={{
                                width: '100%',
                                display: 'table',
                                tableLayout: 'fixed'
                              }}
                            >
                              <Text display={'table-cell'} sx={TextEllipsis}>
                                {item.label}
                              </Text>
                            </Box>
                          </HStack>
                        )}
                      </Box>
                      {item.actionButton && <Center h={'100%'}>{item.actionButton}</Center>}
                    </HStack>
                  ))}
              </>
            )}
          </VStack>
        )}
      </Box>
    </VStack>
  );
};

export default DropDown;
