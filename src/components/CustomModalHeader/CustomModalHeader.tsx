import React from 'react';
import { Flex, Image, ModalCloseButton, ModalHeader, Text } from '@chakra-ui/react';

import { OnlylogoGreen } from '@/assets/index';

interface CustomModalHeaderProps {
  title: string;
  iconSrc?: string;
  borderColor?: string;
  hideBorder?: boolean;
}

const CustomModalHeader: React.FC<CustomModalHeaderProps> = ({
  title,
  iconSrc,
  borderColor = '1px solid var(--day-5, #D9D9D9)',
  hideBorder = false
}) => {
  return (
    <ModalHeader
      display={'flex'}
      justifyContent={'space-between'}
      alignItems={'center'}
      borderBottom={hideBorder ? 'none' : borderColor}
    >
      <Flex alignItems="center" justifyContent="flex-start" gap={2}>
        <Image src={iconSrc || OnlylogoGreen} width="30px" height="30px" />
        <Text fontSize="lg" fontWeight="500">
          {title}
        </Text>
      </Flex>
      <ModalCloseButton position={'static'} />
    </ModalHeader>
  );
};

export default CustomModalHeader;
