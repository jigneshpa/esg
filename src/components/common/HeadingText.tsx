import React, { FC, ReactNode } from 'react';
import { Heading } from '@chakra-ui/react';

interface IHeadingText {
  children: ReactNode;
  [key: string]: any;
}

const HeadingText: FC<IHeadingText> = ({ children, ...rest }) => {
  return (
    <Heading fontSize={{ base: '20px', md: '2xl' }} lineHeight={'2rem'} {...rest}>
      {children}
    </Heading>
  );
};

export default HeadingText;
