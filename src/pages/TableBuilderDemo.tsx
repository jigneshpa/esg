import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { DynamicTableBuilder } from '../components/DynamicTableBuilder';

const TableBuilderDemo: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            Dynamic Table Builder Demo
          </Heading>
          <Text color="gray.600">
            Operations team can use this interface to create dynamic tables
          </Text>
        </Box>
        
        <DynamicTableBuilder />
      </VStack>
    </Container>
  );
};

export default TableBuilderDemo; 