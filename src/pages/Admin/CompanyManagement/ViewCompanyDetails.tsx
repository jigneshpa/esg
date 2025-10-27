import { FC, useState } from 'react';
import { BsEye } from 'react-icons/bs';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Text,
  VStack
} from '@chakra-ui/react';

import { submissions } from '@/store/api/submissions/submissions';
import { companyApi } from '@/store/api/company/companyApi';
import { Company } from '@/types/common';

import CustomModalHeader from '../../../components/CustomModalHeader/CustomModalHeader';
import DownloadStandardsModal from './DownloadStandardsModal';

export const ViewDetailsBox = ({ label, value, ...rest }: any) => (
  <Box {...rest}>
    <Text fontSize="sm" color="#595959">
      {label}
    </Text>
    <Text color="#262626" as="span">
      {value}
    </Text>
  </Box>
);

interface IViewCompanyDetails {
  company: Company;
}

const ViewCompanyDetails: FC<IViewCompanyDetails> = ({ company }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [selectedStandard, setSelectedStandard] = useState<any>(null);
  const [allCompanyIds, setAllCompanyIds] = useState<number[]>([company.id]);
  const handleModal = () => setIsModalOpen(!isModalOpen);

  // Fetch subsidiaries for this company to determine if it's a parent
  const { data: subsidiariesData, isLoading: isSubsidiariesLoading } = companyApi.useGetCompanyByFilterQuery(
    {
      parent_id: [company.id.toString()]
    },
    { skip: !company.id } // Remove modal dependency to always fetch subsidiaries
  );

  // Determine if this company is a parent (has subsidiaries)
  const isParentCompany = subsidiariesData?.data?.result && subsidiariesData.data.result.length > 0;
  const subsidiaries = subsidiariesData?.data?.result || [];
  
  // For parent companies: include subsidiaries data
  // For subsidiaries: only include their own data
  const allCompanyIdsForQuery = isParentCompany 
    ? [company.id, ...subsidiaries.map((sub: any) => sub.id)]
    : [company.id];

  // Fetch approved standards (runs in parallel with subsidiaries fetch)
  const { data: approvedStandardsData, isLoading: isApprovedStandardsLoading } =
    submissions.useGetCompanyApprovedStandardsQuery(
      {
        companyId: allCompanyIdsForQuery.join(','),
        page: 1,
        max_results: 1000
      },
      { skip: !company.id } // Remove modal dependency to fetch in parallel
    );



  const handleDownloadClick = (standard: any) => {
    handleModal();
    setSelectedStandard(standard);
    setAllCompanyIds(allCompanyIdsForQuery);
    setIsDownloadModalOpen(true);
  };

  return (
    <>
      <IconButton
        color="#004DA0"
        variant="ghost"
        icon={<BsEye fontSize={'1.2rem'} />}
        size="sm"
        bg={'gray.50'}
        _hover={{ bg: 'gray.200' }}
        aria-label="View"
        onClick={() => setIsModalOpen(true)}
      />

      <Drawer isOpen={isModalOpen} onClose={handleModal} placement="right" size="md">
        <DrawerOverlay />
        <DrawerContent bgColor="#fff" maxW="545px" w="100%" borderRadius={'16px 0 0 16px'}>
          <CustomModalHeader title="Subsidiary Details" />
          <DrawerBody mt="32px" ml="20px" mr="20px">
            <VStack w="100%" align="flex-start" gap="20px">
              {/* Company Details */}
              <Flex gap="80px">
                <ViewDetailsBox label="Subsidiary Name" value={company?.name || '-'} w="200px" />
                <ViewDetailsBox label="LEI ID / Reg. No." value={company?.leiId || '-'} w="200px" />
              </Flex>
              <Flex gap="80px">
                <ViewDetailsBox label="Country" value={company?.country?.name || '-'} w="200px" />
                <ViewDetailsBox label="Address" value={company?.address || '-'} w="200px" />
              </Flex>
              <Flex gap="80px">
                <ViewDetailsBox label="PostalCode" value={company?.postalCode || '-'} w="200px" />
              </Flex>

              {/* Download Report Section */}
              <Box w="100%" pt="20px" borderTop="1px solid #E0E0E0">
                <Heading size="md" color="#262626" mb="16px">
                  Download Report ({approvedStandardsData?.data?.metadata?.totalItem || 0})
                </Heading>

                {isApprovedStandardsLoading ? (
                  <Flex justify="center" w="100%" py={8}>
                    <Spinner size="lg" />
                  </Flex>
                ) : approvedStandardsData?.data?.items?.length > 0 ? (
                  <VStack w="100%" align="flex-start" gap="12px">
                    {approvedStandardsData.data.items.map((standard: any, index: number) => (
                      <Flex
                        key={standard.id}
                        w="100%"
                        p="12px 16px"
                        bg="gray.50"
                        borderRadius="8px"
                        border="1px solid #E0E0E0"
                        justify="space-between"
                        align="center"
                      >
                        <Text color="#262626" fontWeight="500" flex="1">
                          {standard.name}
                        </Text>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => handleDownloadClick(standard)}
                        >
                          Download
                        </Button>
                      </Flex>
                    ))}
                  </VStack>
                ) : (
                  <Flex justify="center" w="100%" py={8}>
                    <Text color="gray.500">
                      No unique approved standards with submitted answers found for this company.
                    </Text>
                  </Flex>
                )}
              </Box>
            </VStack>
          </DrawerBody>
          <DrawerFooter bgColor="#FAFAFA" borderTop="1px solid var(--day-5, #D9D9D9)"></DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Download Modal */}
      <DownloadStandardsModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        standard={selectedStandard}
        companyName={company.name}
        allCompanyIds={allCompanyIds}
        allCompanies={isParentCompany ? [company, ...subsidiaries] : [company]}
        isParentCompany={isParentCompany}
      />
    </>
  );
};

export default ViewCompanyDetails;
