import { Box, Button, Text, Collapse } from '@chakra-ui/react';
import { useState } from 'react';
import { EditIcon, CheckIcon, CloseIcon, BellIcon, DeleteIcon } from '@chakra-ui/icons';

interface PendingReviewItemProps {
  companyName: string;
  assignedTo: string;
  esgStandard: string;
  department: string;
  country: string;
  manager: string;
  year: string;
  submissionDate: string;
  question: string;
  answer: string;
}

const PendingReviewItem: React.FC<PendingReviewItemProps> = ({ companyName, assignedTo, esgStandard, department, country, manager, year, submissionDate, question, answer }) => {
  const [showMore, setShowMore] = useState(true);

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb={4} bg="white">
      <Box p={4} display="flex" justifyContent="space-between" alignItems="center" bg="gray.100">
        <Text fontWeight="bold" color="teal.600">{companyName}</Text>
        <Box display="flex" gap={2}>
          <Button leftIcon={<BellIcon />} colorScheme="teal">Notify</Button>
          <Button leftIcon={<DeleteIcon />} colorScheme="red">Delete</Button>
        </Box>
      </Box>
      <Box p={4} bg="gray.50">
        <Text>Assigned To: {assignedTo}</Text>
        <Text>ESG Standard: {esgStandard}</Text>
        <Text>Department: {department}</Text>
        <Text>Country: {country}</Text>
        <Text>Manager: {manager}</Text>
        <Text>Year: {year}</Text>
        <Text>Submission Date: {submissionDate}</Text>
      </Box>
      <Collapse in={showMore} animateOpacity>
        <Box p={4} bg="gray.100">
          <Text>Q. {question}</Text>
          <Text>A. {answer}</Text>
          <Box display="flex" gap={2} mt={2}>
            <Button leftIcon={<EditIcon />} colorScheme="blue">Edit</Button>
            <Button leftIcon={<CheckIcon />} colorScheme="green">Approve</Button>
            <Button leftIcon={<CloseIcon />} colorScheme="red">Reject</Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default PendingReviewItem;