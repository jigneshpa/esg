import { useEffect, useRef, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { BsArrowRight } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react';

import CustomModalHeader from '@/components/CustomModalHeader/CustomModalHeader';
import EllipsisBox from '@/components/EllipsisBox/EllipsisBox';
import { URLS } from '@/constants';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import useInitializeUser from '@/hooks/useInitializeUser';
import { useRefreshCompanyAccess } from '@/hooks/useRefreshCompanyAccess';
import { useAppSelector } from '@/store/hooks';
import {
  selectUserCountryId,
  selectUserFullAccess,
  selectUserId,
  selectUserRole
} from '@/store/slices/user/userSelectors';
import { replaceString } from '@/utils';

interface ESGStandardsColumnProps {
  questionBank: any;
  companySelected: number | null;
}

const ESGStandardsColumn: React.FC<ESGStandardsColumnProps> = ({ questionBank, companySelected }) => {
  const navigate = useNavigate();
  const userRole = useAppSelector(selectUserRole);
  const userFullAccess = useAppSelector(selectUserFullAccess);
  const userId = useAppSelector(selectUserId);
  const userCountryId = useAppSelector(selectUserCountryId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');
  const initialFocusRef = useRef(null);

  // Initialize user and company access data
  useInitializeUser();

  // Get company data using the useCompanyAccess hook
  const companyId = Number(sessionStorage.getItem('companyId'));
  const { companies: companyData, isLoading: isCompanyLoading } = useCompanyAccess();
  // Hook to handle refreshing company access data
  useRefreshCompanyAccess();
  const filteredCompanies =
    companyData?.filter((item: any) => {
      // First filter by search term
      const matchesSearch = searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase());

      // If user is user-admin without full access, also filter by country_id
      if (userRole === 'user-admin' && !userFullAccess) {
        return matchesSearch && (item.country?.id === userCountryId || item.countryId === userCountryId);
      }

      // For other roles or user-admin with full access, only filter by search term
      return matchesSearch;
    }) || [];

  // Reset search term when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Redirect for View
  const redirectById = (companyId?: number) => {
    if (!questionBank?.id) return;
    const mapObj = {
      ':qbankId': questionBank.id,
      ':companySelected': companyId !== undefined ? companyId : companySelected !== null ? companySelected : ''
    };
    const redirectUrl =
      userRole === 'manager'
        ? replaceString(URLS.MANAGER_QUESTION_BANK_VIEW, mapObj)
        : replaceString(URLS.ADMIN_QUESTION_BANK_VIEW, mapObj);

    navigate(redirectUrl, { replace: true });
    onClose();
  };

  // Redirect for Edit
  const redirectToEdit = () => {
    if (!questionBank?.id) return;
    const mapObj = { ':qbankId': questionBank.id };
    const editUrl =
      userRole === 'manager'
        ? replaceString(URLS.MANAGER_QUESTION_BANK, mapObj)
        : replaceString(URLS.QUESTION_BANK, mapObj);

    navigate(editUrl, { replace: true });
  };

  // Check if in edit mode
  const isEditMode =
    companySelected === 0 && (userRole == 'user-admin' || userRole == 'admin' || userRole == 'manager');
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isEditMode) {
      onOpen();
    } else {
      redirectById();
    }
  };

  // Handle direct company selection
  const handleCompanySelect = (companyId: number) => {
    redirectById(companyId);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <div onClick={handleClick} style={{ cursor: 'pointer', width: '100%' }} data-testid="esg-standard-clickable">
        <EllipsisBox>{questionBank?.name && !questionBank?.draft ? questionBank?.name : '-'}</EllipsisBox>
      </div>

      {/* Company Selection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered initialFocusRef={initialFocusRef}>
        <ModalOverlay />
        <ModalContent maxW="600px" borderRadius="16px" background={'white'} h={'70vh'} overflowY="auto">
          <CustomModalHeader title="Select Company/Subsidiary" />
          <ModalBody py={6}>
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

            {isCompanyLoading ? (
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
    </>
  );
};

export default ESGStandardsColumn;
