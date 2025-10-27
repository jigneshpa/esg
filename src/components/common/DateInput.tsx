import React from 'react';
import { AiOutlineCalendar } from 'react-icons/ai';
import { Icon, Input, InputGroup, InputRightElement } from '@chakra-ui/react';

interface ICustomInput {
  value?: string;
  onClick?: () => void;
}

const DateInput = React.forwardRef<HTMLInputElement, ICustomInput>(({ value, onClick }, ref) => (
  <InputGroup>
    <Input onClick={onClick} ref={ref} value={value} readOnly border="1px solid var(--day-5, #D9D9D9);" />
    <InputRightElement
      bg="#FAFAFA"
      boxShadow="0px -1px 0px 0px #D9D9D9 inset, 0px 1px 0px 0px #D9D9D9 inset, -1px 0px 0px 0px #D9D9D9 inset"
      pointerEvents="none"
    >
      <Icon as={AiOutlineCalendar} color="#262626" />
    </InputRightElement>
  </InputGroup>
));

DateInput.displayName = 'DateInput';

export default DateInput;
