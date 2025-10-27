import { FC, ReactElement } from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';

interface Props extends ButtonProps {
  withBorder?: boolean;
  leftIcon?: ReactElement;
  color?: 'red' | 'default';
}

const ActionButton: FC<Props> = ({ withBorder = true, leftIcon, children, color = 'default', ...props }) => {
  const borderStyles = withBorder
    ? {
        borderBottom: '1px solid',
        borderColor: 'gray.300',
        borderBottomRadius: 0
      }
    : {};

  const buttonColor = color === 'red' ? 'red.500' : 'gray.800';

  return (
    <Button
      fontSize="15px"
      fontWeight="500"
      justifyContent="flex-start"
      w="100%"
      h="40px"
      bg="white"
      _hover={{ bg: 'gray.50' }}
      color={buttonColor}
      leftIcon={leftIcon}
      {...borderStyles}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ActionButton;
