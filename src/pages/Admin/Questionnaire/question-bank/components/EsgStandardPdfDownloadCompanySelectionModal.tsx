import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalFooter,
    Input,
    InputGroup,
    InputLeftElement,
    Button,
    VStack,
    HStack,
    Text,
    Box,
    Flex,
    Spinner,
} from '@chakra-ui/react';
import { BiSearch } from 'react-icons/bi';
import { BsArrowRight } from 'react-icons/bs';
import { useRef, useState } from 'react';
import CustomModalHeader from '@/components/CustomModalHeader/CustomModalHeader';

  interface Company {
    id: string | number;
    name: string;
  }
  
  interface EsgStandardPdfDownloadCompanySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    companies: Company[];
    isLoading?: boolean;
    onCompanySelect: (companyId: string | number) => void;
  }

  const EsgStandardPdfDownloadCompanySelectionModal = ({
    isOpen,
    onClose,
    companies,
    isLoading = false,
    onCompanySelect,
  }: EsgStandardPdfDownloadCompanySelectionModalProps) => {
    const initialFocusRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    };
    
    const filteredCompanies = companies.filter((company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const handleCompanySelect = (companyId: string | number) => {
      onCompanySelect(companyId);
      onClose();
    };
    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered initialFocusRef={initialFocusRef}>
        <ModalOverlay />
        <ModalContent maxW="600px" borderRadius="16px" background={'white'} h={'70vh'} overflowY="auto">
          <CustomModalHeader title="Select Company/Subsidiary" />
          <ModalBody py={6} >
            {/* Search Input */}
            <InputGroup mb={4}>
              <InputLeftElement pointerEvents="none">
                <BiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                ref={initialFocusRef}
                placeholder="Search companies..."
                value={searchTerm}
                onChange={handleSearchChange}
                borderRadius="md"
              />
            </InputGroup>

            {isLoading ? (
              <Flex justify="center" py={4}>
                <Spinner />
              </Flex>
            ) : (
              <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company: any) => (
                    <HStack
                      key={company.id}
                      p={3}
                      borderRadius="md"
                      _hover={{ bg: 'gray.100' }}
                      justifyContent="space-between"
                      cursor="pointer"
                      onClick={() => handleCompanySelect(company.id)}
                      data-testid={`company-row-${company.id}`}
                      borderWidth="1px"
                      borderColor="gray.200"
                    >
                      <Text fontWeight="medium">{company.name}</Text>
                      <Box>
                        <BsArrowRight size={24} color="#3182CE" />
                      </Box>
                    </HStack>
                  ))
                ) : (
                  <Text color="gray.500" textAlign="center" py={4}>
                    {searchTerm ? 'No matching companies found' : 'No companies or subsidiaries available'}
                  </Text>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200" py={4}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }
  export default EsgStandardPdfDownloadCompanySelectionModal;

