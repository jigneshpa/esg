import React from 'react';
import { Box, Text, List, ListItem } from '@chakra-ui/react';

interface Remark {
  remarks: string;
  reviewer: string;
}

interface RejectionRemarksProps {
  // Accept either a JSON string or an already parsed array of remark objects.
  remarks: string | Remark[];
  status: 'Rejected' | 'Pending' | 'Approved' | string;
  previousAnswer: any;
}

const RejectionRemarks: React.FC<RejectionRemarksProps> = ({ remarks, status, previousAnswer }) => {
  let parsedRemarks: Remark[] = [];

  // If remarks is a string, try to parse it. Otherwise, use it directly.
  if (typeof remarks === 'string') {
    try {
      const tempRemarks = JSON.parse(remarks);

      if (!Array.isArray(tempRemarks)) {
        parsedRemarks = [tempRemarks];
      }
    } catch (error) {
      console.error('Failed to parse remarks JSON:', error);
      parsedRemarks = [];
    }
  } else if (Array.isArray(remarks)) {
    parsedRemarks = remarks;
  } else if (typeof remarks === 'object' && 'remarks' in remarks) {
    parsedRemarks = [remarks as Remark];
  }


  // Only show remarks if status is 'Rejected' and there are parsed remarks.
  if (parsedRemarks.length === 0 || !parsedRemarks[0]?.remarks) {
    return null;
  }

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg="red.50"
      borderColor="red.300"
      w="inherit"
      boxShadow="sm"
      mt={4}
    >
      <Text fontSize="lg" fontWeight="bold" mb={2} color="red.700">
        Remarks
      </Text>
      <List spacing={2}>
        {parsedRemarks.map((remark, index) => (
          <React.Fragment key={index}>
            <ListItem display="flex" alignItems="center">
              {remark.remarks}{' '}
              <Text as="span" ml={2} color="gray.600">
                ({remark.reviewer})
              </Text>
            </ListItem>
            {previousAnswer && (
              <ListItem display="flex" alignItems="center">
                <Text as="span" fontWeight="bold" color="gray.600">Previous Answer:</Text>
                <Text as="span" color="gray.600" ml={1}>{previousAnswer}</Text>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default RejectionRemarks;
