//@ts-nocheck
import DatePicker from 'react-datepicker';
import { Box, Flex, HStack, Text } from '@chakra-ui/react';

import 'react-datepicker/dist/react-datepicker.css';

import { FC, useEffect, useRef, useState } from 'react';

interface IRadioItem {
  label: string;
  labelStyle: React.CSSProperties;
  isActive: boolean;
  onClick: () => void;
  isChecked: boolean;
}

const RadioItem: FC<IRadioItem> = ({ label, labelStyle, isActive, onClick, isChecked }) => {
  const textStyle = isChecked ? { color: '#237804', ...labelStyle } : labelStyle;
  const inactiveStyle = !isActive ? { opacity: 0.5 } : {};

  return (
    <Flex as="label" cursor="pointer" onClick={onClick} h="40px">
      <HStack
        alignItems="center"
        justifyContent="center"
        px={5}
        py={3}
        borderWidth="1px"
        bg="#fff"
        style={{ ...inactiveStyle, ...labelStyle }}
        transition="background-color 0.2s"
        border={isChecked ? '1px solid #137E59' : '1px solid #E2E8F0'}
      >
        <Text {...textStyle}>{label}</Text>
      </HStack>
    </Flex>
  );
};
interface ICustomRadio {
  value: string;
  onChange: (val: string | null) => void;
  options?: Array<{ label: string, value: string }>;
}

const CustomRadio: FC<ICustomRadio> = ({ value, onChange, options }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setDatePickerOpen] = useState<boolean>(false);
  const datePickerRef = useRef<HTMLElement | null>(null);
  const [isCustomDateRangeActive, setCustomDateRangeActive] = useState(false);

  const formatDateForDisplay = (date: Date | null): string =>
    date
      ? `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}.${date.getFullYear()}`
      : '';

  const formatDateRangeForReturn = (start: Date | null, end: Date | null): string => {
    if (start && end) {
      return `(${start.toISOString()},${end.toISOString()})`;
    }
    return '';
  };

  const formatDateRangeForLabel = (start: Date | null, end: Date | null): string => {
    if (start && end) {
      return `${formatDateForDisplay(start)} - ${formatDateForDisplay(end)}`;
    }
    return 'Custom Date Range';
  };

  const handleRadioChange = (val: string) => {
    if (value === val) {
      onChange(null);
      setDatePickerOpen(false);
      setCustomDateRangeActive(false);
    } else if (val !== 'customDateRange') {
      onChange(val);
      setCustomDateRangeActive(false);
    } else if (val === 'customDateRange') {
      setDatePickerOpen(true);
      setCustomDateRangeActive(true);
    }
  };
  const handleDateChange = (update: [Date | null, Date | null]) => {
    const [start, end] = update;
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      setDatePickerOpen(false);
      onChange(formatDateRangeForReturn(start, end));
      setCustomDateRangeActive(true);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
      setDatePickerOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const defaultOptions = [
    { label: 'Current Month', value: 'month' },
    { label: 'YTD', value: 'ytd' },
    {
      label: formatDateRangeForLabel(startDate, endDate),
      value: 'customDateRange',
      isChecked: isCustomDateRangeActive
    }
  ];

  return (
    <Flex sx={{ width: '100%', flexDirection: 'row' }}>
      {(options?.length ? options : defaultOptions).map(option => (
        <RadioItem
          key={option.value}
          label={option.label}
          isActive={true}
          onClick={() => handleRadioChange(option.value)}
          isChecked={value === option.value || option.isChecked}
        />
      ))}
      {isDatePickerOpen && (
        <Box position="absolute" zIndex="500" ref={datePickerRef}>
          <DatePicker selectsRange startDate={startDate} endDate={endDate} onChange={handleDateChange} inline />
        </Box>
      )}
    </Flex>
  );
};

export default CustomRadio;
