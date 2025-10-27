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
  VStack,
  useOutsideClick,
  useStyleConfig,
} from '@chakra-ui/react';
import { SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { BsChevronDown } from 'react-icons/bs';
import { MdOutlineClose } from 'react-icons/md';

/**
 * options: [{value: string, label: string}]
 * size: 'sm' | 'md
 * selection: 'single' | 'multiple'
 */

const SINGLE = 'single';
const MULTIPLE = 'multiple';



const optionStyle = {
  flex: 1,
  overflow: 'hidden',
  whiteSpace: 'wrap',
};

const InputDropdown = ({
  isLoading = false,
  placeholder,
  options,
  value,
  onChange,
  w = '180px',
  size = 'md',
  selection = 'single',
  borderRadius = '10px',
  isInvalid = false,
  isDisabled = false,
  background,
  borderNone,
  optionsColor,
  labelColor,
  optionsFontSize,
  optionsFontWeight,
  DropdownIndicator,
  labelPadding,
  transformOff,
  ...rest
}: any) => {
  const ref: any = useRef();
  const inputRef: any = useRef();
  const [optionList, setOptionList] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const [dropDownInpute, setDropDownInpute] = useState()
  const TextEllipsis = useStyleConfig('TextEllipsis');
  const [dropDownInputeDefaultValue, setDropDownInputeDefaultValue] = useState(true)
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
    handler: () => setOpen(false),
  });

  const dropdownButtonStyle = {
    w: '100%',
    h: '100%',
    border: '1px solid',
    bg: background ? background : 'white',
    fontWeight: 'inherit',
  };

  const buttonStyle = useMemo(() => {
    if (isInvalid) {
      return {
        border: '1px solid',
        borderColor: 'red.500',
      };
    }
    if (isDisabled) {
      return {
        border: '1px solid',
        borderColor: 'border',
        bg: 'grey.100',
        color: 'black',
        cursor: 'not-allowed',
      };
    }
    if (open) return {
      borderColor: 'primary'
    };
    return { borderColor: 'border' };
  }, [isInvalid, open]);

  const handleSearch = (e: any) => {
    const result = options.filter((item: { label: { toString: () => string; }; }) =>
      item.label.toString().toLowerCase().includes(e.target.value.toLowerCase())
    );
    setDropDownInpute(e.target.value)
    setOptionList(result);

    onChange(e.target.value.toLowerCase())
  };

  const handleSelectOption = (selected: SetStateAction<undefined>) => {
    if (selection === SINGLE) {
      onChange(selected);
      setDropDownInpute(selected)
      setOpen(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (value?.length === optionList.length) {
      onChange([]);
    } else {
      onChange(optionList.map((item: any) => item.value));
    }
  };

  useEffect(() => {
    if (dropDownInputeDefaultValue && optionList?.length > 0) {
      setDropDownInpute(optionList?.find((item: any) => item.value === value)?.label || '')
      setDropDownInputeDefaultValue(false)
    }
  }, [optionList])

  return (
    <Box
      ref={ref}
      position={'relative'}
      w={(size === 'sm' && '120px') || w || 'fit-content'}
      h={(size === 'sm' && '32px') || '40px'}
      borderRadius={(size === 'sm' && '6px') || '10px'}
      fontSize={size === 'sm' && '0.9em'}
      lineHeight={size === 'sm' && '1.5'}
      boxSizing={'border-box'}
      sx={
        isInvalid && {
          border: '1px solid',
          borderColor: 'red.500',
          boxShadow: '0 0 0 1px #EC4F5C',
        }
      }
      {...rest}>
      <Button
        fontSize="inherit"
        variant="unstyled"
        p={labelPadding ? labelPadding : (size === 'sm' && '6px 10px') || '6px 16px'}
        borderRadius={borderRadius}
        {...dropdownButtonStyle}
        title={optionList?.find((item: any) => item.value === value)?.label || placeholder}
        {...buttonStyle}
        border={isInvalid ? 'unset' : borderNone ? 'unset' : '1px solid'}
        onClick={() => !isDisabled && setOpen(!open)}
      >
        <Flex w={'100%'} justifyContent={'space-between'} alignItems={'center'}>
          <>
            <Input
              ref={inputRef}
              border={'unset'}
              flex={1}
              textAlign={'left'}
              overflow={'hidden'}
              fontWeight={'inherit'}
              whiteSpace={'nowrap'}
              textOverflow={'ellipsis'}
              fontSize="inherit"
              onChange={handleSearch}
              height={'auto'}
              placeholder={placeholder}
              _focus={{
                boxShadow: 'unset',
              }}
              p={"0px"}
              sx={{
                '&[aria-invalid=true]': { boxShadow: 'unset' },
              }}
              value={dropDownInpute}
            />


            <Icon
              flexBasis={'16px'}
              as={DropdownIndicator ? DropdownIndicator : BsChevronDown}
              transform={(open && !transformOff) ? `rotate(180deg)` : `rotate(0deg)`}
              color={
                optionList?.find((item: any) => item.value === value)?.label
                  ? 'currentColor'
                  : labelColor ? labelColor : 'grey.500'
              }
            />
          </>
        </Flex>
      </Button>
      <VStack
        className={'custom-scroll-bar'}
        position={'absolute'}
        borderRadius={'6px'}
        w={'100%'}
        maxH={'190px'}
        bg={'white'}
        py={'6px'}
        border={'1px solid'}
        borderColor={'border'}
        display={open ? 'block' : 'none'}
        boxShadow={'0px 0px 16px 0px #0000001A'}
        overflow={'auto'}
        color={optionsColor}
        fontSize={optionsFontSize}
        fontWeight={optionsFontWeight}
        zIndex={10}
      >
        {isLoading ? (
          <Center p={'10px 14px'} color={'grey'}>
            <Spinner />
          </Center>
        ) : (
          <>
            {!optionList?.length && (
              <Box p={'10px 14px'} color={'grey'}>
                No data
              </Box>
            )}
            {!!optionList?.length &&
              optionList.map((item: any, index: number) => (
                <HStack
                  key={`${item.value}-${index}`}
                  bg={value === item.value ? 'green.100' : 'white'}
                  _hover={!item?.disabled && value !== item.value ? { bg: 'green.100' } : undefined}
                  cursor={item?.disabled ? 'not-allowed' : 'pointer'}
                >
                  <Box
                    key={`${item.value}-${index}`}
                    sx={optionStyle}
                    color={item?.disabled ? 'grey.300' : 'inherit'}
                    onClick={() => item?.disabled || handleSelectOption(item.value)}>
                    {selection === SINGLE && (
                      <Box p={'10px 14px'} sx={TextEllipsis} title={item.label}>
                        {item.label}
                      </Box>
                    )}
                  </Box>
                  {item.actionButton && <Center h={'100%'}>{item.actionButton}</Center>}
                </HStack>
              ))}
          </>
        )}
      </VStack>
    </Box>
  );
};

export default InputDropdown;

