import { useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Text
} from '@chakra-ui/react';

interface QuestionBank {
  id: number;
  name: string;
  [key: string]: any;
}

interface DownloadQuestionnaireDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (fileType: string) => void;
  questionBank: QuestionBank | null;
  isLoading?: boolean;
}

const DownloadQuestionnaireDialog = ({
  isOpen,
  onClose,
  onDownload,
  questionBank,
  isLoading = false
}: DownloadQuestionnaireDialogProps) => {
  const [selectedFileType, setSelectedFileType] = useState('xlsx');

  const handleDownload = () => {
    onClose();
    onDownload(selectedFileType);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl" maxW="550px" bg="white">
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          borderBottomWidth="1px"
          pb={4}
        >
          Download Report
          {questionBank && (
            <Text fontSize="md" fontWeight="normal" mt={1}>
              {questionBank.name}
            </Text>
          )}
          <ModalCloseButton position={'static'} />
        </ModalHeader>
        <ModalBody py={6}>
          <Text fontWeight="medium" mb={4}>
            Select file type
          </Text>
          <RadioGroup onChange={setSelectedFileType} value={selectedFileType}>
            <Stack direction="row" spacing={6}>
              <Radio value="xlsx">xlsx</Radio>
              <Radio value="pdf">pdf</Radio>
              <Radio value="docx">docx</Radio>
            </Stack>
          </RadioGroup>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" pt={4} gap={3}>
          <Button variant="outline" onClick={onClose} flex="1" isDisabled={isLoading}>
            Cancel
          </Button>
          <Button colorScheme="green" flex="1" onClick={handleDownload} isLoading={isLoading} isDisabled={isLoading}>
            Download
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DownloadQuestionnaireDialog;
