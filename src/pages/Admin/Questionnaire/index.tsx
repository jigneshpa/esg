import { useEffect, useMemo, useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import { IoInformationCircleOutline } from 'react-icons/io5';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  ListItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  UnorderedList,
  useDisclosure
} from '@chakra-ui/react';
import { skipToken } from '@reduxjs/toolkit/query/react';

import { DropDown } from '@/components';
import DownloadQuestionnaireDialog from '@/components/common/DownloadQuestionnaireDialog';
import ExportDropDown from '@/components/common/ExportDropDown';
import HeadingText from '@/components/common/HeadingText';
import Pagination from '@/components/common/Pagination';
import Table from '@/components/common/Table';
import { questionBankColumns } from '@/constants/coloumns/questionBankColumns';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import useDownloadQuestionnaire from '@/hooks/useDownloadQuestionnaire';
import useExport from '@/hooks/useExport';
import { usePrint } from '@/hooks/usePrint';
import { useRefreshCompanyAccess } from '@/hooks/useRefreshCompanyAccess';
import useTableParams from '@/hooks/useTableParams';
import AssignStandard from '@/pages/Admin/Questionnaire/question-bank/components/AssignStandard';
import BulkAssignStandard from '@/pages/Admin/Questionnaire/question-bank/components/BulkAssignStandard';
import BulkUnassignStandard from '@/pages/Admin/Questionnaire/question-bank/components/BulkUnassignStandard';
import CreateReportsBank from '@/pages/Admin/Questionnaire/question-bank/components/CreateReportsBank';
import EsgStandardPdfDownloadCompanySelectionModal from '@/pages/Admin/Questionnaire/question-bank/components/EsgStandardPdfDownloadCompanySelectionModal';
import UnassignStandard from '@/pages/Admin/Questionnaire/question-bank/components/UnassignStandard';
import QuestionnairePDFPreview from '@/pages/Admin/Questionnaire/view-question-bank/components/QuestionnairePDFPreview';
import { companyApi } from '@/store/api/company/companyApi';
import { frameworkApi } from '@/store/api/framework/frameworkApi';
import { industryApi } from '@/store/api/industry/industryApi';
import { institutionApi } from '@/store/api/institution/institutionApi';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { submissions } from '@/store/api/submissions/submissions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectQuestionBankList } from '@/store/slices/refresh/refreshSelectors';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import { selectUserCompanyId, selectUserRole } from '@/store/slices/user/userSelectors';
import { useDebounce } from '@uidotdev/usehooks';

interface Subsidiary {
  id: number;
  name: string;
}

interface QuestionBank {
  id: number;
  name: string;
  [key: string]: any;
}

const Questionnaire = () => {
  const initialParams = { page: 1, max_results: 10, sort_by: null, search: '' };
  const userRole = useAppSelector(selectUserRole);
  const companyId = useAppSelector(selectUserCompanyId);
  const { handleExportAsset, isDownloading: isExporting } = useExport({ title: 'Question' });
  const { handleDownloadQuestionnaire } = useDownloadQuestionnaire({ title: 'Questionnaire Report' });
  const { componentRef, handlePrint } = usePrint();

  const { params } = useTableParams(initialParams);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchItem, setSearcHItem] = useState(''); // Unused in your code, kept for consistency
  const [selectedSubsidiary, setSelectedSubsidiary] = useState('');
  const [exportPayload, setExportPayload] = useState<any>({});
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [selectedQuestionBank, setSelectedQuestionBank] = useState<QuestionBank | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCompanySelectionModalOpen, setIsCompanySelectionModalOpen] = useState(false);
  const [currentQuestionBank, setCurrentQuestionBank] = useState<QuestionBank | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | number | null>(null);

  // Add company access hooks for manager role
  const { companies: companyAccessData, isLoading: isCompanyAccessLoading } = useCompanyAccess();
  useRefreshCompanyAccess();

  const handleCompanySelect = (companyId: string | number) => {
    // After company is selected, open the download dialog
    if (currentQuestionBank) {
      setSelectedCompanyId(companyId);
      setSelectedQuestionBank(currentQuestionBank);
      onOpen();
    }
  };

  const {
    params: paramsQuestionBank,
    handleMaxResultsChange: handleMaxResultsChangeQuestionBank,
    handlePageChange: handlePageChangeQuestionBank
  } = useTableParams({ ...initialParams });

  const dispatch = useAppDispatch();

  const {
    data: questionBankData,
    isLoading: isLoadingQuestionBank,
    isFetching: isFetchingQuestionBank,
    refetch
  } = questionnaireApi.useGetQuestionnaireBankListQuery({ ...paramsQuestionBank, search: debouncedSearchTerm });
  const { refetch: refetchQuestionnaireList } = questionnaireApi.useGetQuestionnaireListQuery({
    ...params,
    search: debouncedSearchTerm
  });
  const { data: industryData } = industryApi.useGetAllIndustriesListQuery({});
  const { data: frameworkData } = frameworkApi.useGetAllFrameworksQuery({});
  const { data: institutionData } = institutionApi.useGetAllinstitutionsQuery({});
  const { data: companyData } = companyApi.useGetAllCompaniesQuery(
    { ...params, search: debouncedSearchTerm, ...(userRole === 'user-admin' ? { id: companyId } : {}) },
    { skip: userRole === 'user-admin' && !companyId }
  );
  console.log('companyData for admin', companyData);
  const [getCompanyByFilter, { data: subsidiariesData, isLoading: subsidiariesIsLoading }] =
    companyApi.useLazyGetCompanyByFilterQuery();

  const { data: reportingData } = companyApi.useGetAllCompaniesReportingSubmissionsQuery({ ...params });

  const {
    data: questionnaireData,
    isLoading: isLoadingQuestionnaire,
    isFetching: isFetchingQuestionnaire
  } = questionnaireApi.useGetQuestionBankListByIdQuery(
    { bankId: selectedQuestionBank?.id },
    { skip: !selectedQuestionBank }
  );

  // Subsidiary Logic - Updated to use company access for manager role
  const subsidiaries: Subsidiary[] = [];
  if (userRole === 'user-admin' && companyData?.data?.length > 0) {
    subsidiaries.push({ id: companyData.data[0].id, name: companyData.data[0].name });
  }

  if (userRole === 'manager' && companyAccessData?.length > 0) {
    // For manager role, use the company access data which is already filtered
    const managerCompanies = companyAccessData.map((item: any) => ({
      id: item.id,
      name: item.name
    }));
    subsidiaries.push(...managerCompanies);
  } else if (subsidiariesData?.data?.result?.length > 0) {
    // For other roles, use the subsidiaries data from getCompanyByFilter
    const formattedSubsidiaries = subsidiariesData.data.result.map((item: Subsidiary) => ({
      id: item.id,
      name: item.name
    }));
    subsidiaries.push(...formattedSubsidiaries);
  }
  console.log('subsidaries list is ', subsidiaries);
  const matchedCompany = reportingData?.data?.results?.find((company: { id: number }) => company.id === companyId);
  let subsidiaryIds: string[] = [];
  if (matchedCompany) {
    subsidiaryIds = subsidiaries.map(subsidiary => subsidiary.id.toString());
    sessionStorage.setItem('subsidiaryIds', JSON.stringify(subsidiaryIds));
  }
  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    error
  } = submissions.useGetAdminCompanyDisclosureListQuery(
    userRole === 'user-admin' && companyId && subsidiaryIds.length > 0
      ? { companyIds: subsidiaryIds, page: 1, max_results: 2000000 }
      : skipToken,
    { skip: userRole !== 'user-admin' || !companyId || subsidiaryIds.length === 0 }
  );
  console.log('submissionData', submissionsData);
  // Submission Parsing (from your code)
  const parseJSONSafely = (value: any) => {
    if (typeof value !== 'string') return value;
    const trimmedValue = value.trim();
    const isJSONString = trimmedValue.startsWith('{') || trimmedValue.startsWith('[');
    try {
      return isJSONString ? JSON.parse(trimmedValue) : { text: trimmedValue };
    } catch (error) {
      console.error('Error parsing JSON:', error, 'Invalid Value:', value);
      return { text: value };
    }
  };
  const parsedQuestions = submissionsData?.data?.items?.map((item: { answer: any }) => ({ ...item }));
  const answeredItems = parsedQuestions?.filter((item: { answer: any }) => item.answer !== null);
  if (answeredItems && answeredItems.length > 0) {
    sessionStorage.setItem('answeredItems', JSON.stringify(answeredItems));
    const answers = answeredItems.map((item: { answer: any }) => item.answer);
    if (answers && answers.length > 0) {
      localStorage.setItem('answers', JSON.stringify(answers));
    }
  }

  // Download Logic (from Bitbucket)
  const handleSingleDownload = async (fileType: string) => {
    if (!selectedQuestionBank) return;
    if (fileType === 'pdf') {
      if (isLoadingQuestionnaire || isFetchingQuestionnaire || !questionnaireData?.data?.questions) return;
      handlePrint();
    } else {
      setDownloadingId(selectedQuestionBank.id);
      handleDownloadQuestionnaire({
        questionBankId: selectedQuestionBank.id,
        type: fileType,
        fileName: `${selectedQuestionBank.name}.${fileType}`
      }).finally(() => {
        setDownloadingId(null);
        setSelectedQuestionBank(null);
      });
    }
  };

  // Enhanced Columns (from Bitbucket)
  const enhancedColumns = useMemo(() => {
    const columns = [
      ...(questionBankColumns({
        data: questionBankData,
        companySelected: Number(selectedSubsidiary),
        userRole,
        companyId
      }) || [])
    ];
    const actionColumnIndex = columns.findIndex(col => col.accessor === 'action');
    // ESG Report column removed as requested
    // if (actionColumnIndex !== -1) {
    // columns.splice(actionColumnIndex, 0, {
    //   label: 'ESG Report',
    //   accessor: 'download',
    //   sticky: true,
    //   render: (_: never, rowIndex: number) => {
    //     const questionBank = questionBankData?.data?.results[rowIndex];
    //     const isThisRowDownloading = downloadingId === questionBank?.id;
    //     const isThisRowLoading =
    //       selectedQuestionBank?.id === questionBank?.id && (isLoadingQuestionnaire || isFetchingQuestionnaire);
    //     const questionsCount = questionBank?.questions_count || 0;
    //     const answersCount = questionBank?.answers_count || 0;
    //     const hasAnsweredQuestions = answersCount > 0;
    //     return (
    //       <IconButton
    //         aria-label="Download options"
    //         icon={
    //           isThisRowDownloading || isThisRowLoading ? (
    //             <Spinner size="md" />
    //           ) : (
    //             <Icon as={AiFillFilePdf} color={hasAnsweredQuestions ? 'red.600' : 'gray.400'} fontSize="20px" />
    //           )
    //         }
    //         variant="ghost"
    //         size="md"
    //         _hover={{
    //           bg:
    //             isThisRowDownloading || !hasAnsweredQuestions || isThisRowLoading
    //               ? 'transparent'
    //               : hasAnsweredQuestions
    //                 ? 'gray.100'
    //                 : 'transparent',
    //           color: hasAnsweredQuestions ? 'green.700' : 'gray.400'
    //         }}
    //         _disabled={{ bg: 'transparent', border: 'none', opacity: 0.5 }}
    //         borderRadius="full"
    //         onClick={() => {
    //           if (hasAnsweredQuestions) {
    //             setCurrentQuestionBank(questionBank);
    //             setSelectedQuestionBank(questionBank);
    //             setIsCompanySelectionModalOpen(true); // Open company selection modal first
    //             // onOpen();
    //           }
    //         }}
    //         isDisabled={isThisRowDownloading || !hasAnsweredQuestions || isThisRowLoading}
    //         title={
    //           !hasAnsweredQuestions
    //             ? 'At least one question must be answered before downloading'
    //             : isThisRowLoading
    //               ? 'Loading...'
    //               : 'Download ESG Report'
    //         }
    //       />
    //     );
    //   }
    // });
    if (actionColumnIndex !== -1) {
      columns[actionColumnIndex].sticky = true;
    }
    // }
    return columns.length > 0 ? columns : [];
  }, [
    questionBankData,
    downloadingId,
    selectedQuestionBank,
    isLoadingQuestionnaire,
    isFetchingQuestionnaire,
    selectedSubsidiary,
    onOpen
  ]);

  const rowSelections = { onChange: setSelectedRows, selectedRowKeys: selectedRows };
  const refetchQueries = useAppSelector(selectQuestionBankList);

  useEffect(() => {
    if (refetchQueries) {
      refetch();
      refetchQuestionnaireList();
      dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: false }));
    }
  }, [refetchQueries, refetch, dispatch, refetchQuestionnaireList]);

  useEffect(() => {
    if (userRole === 'user-admin' && companyId) {
      getCompanyByFilter({ parent_id: [companyId] });
    } else if (userRole === 'manager') {
      // For manager role, use company access data instead of calling getCompanyByFilter({})
      // The company access data is already filtered for the manager's access
    } else {
      getCompanyByFilter({});
      console.log('subsidiarise data for admin', subsidiariesData);
    }
  }, [userRole, companyId, getCompanyByFilter]);

  useEffect(() => {
    setExportPayload({});
  }, [exportMenuOpen]);

  useEffect(() => {
    refetch();
  }, [debouncedSearchTerm, refetch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    handlePageChangeQuestionBank(1);
  };

  const handleSubsidiaryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    setSelectedSubsidiary(event.target.value);
    if (selectedId) {
      sessionStorage.setItem('selectedSubsidiaryId', selectedId);
    } else {
      sessionStorage.removeItem('selectedSubsidiaryId');
    }
  };

  const industryFilter = industryData?.data;
  const institutionFilter = institutionData?.data?.results;

  console.log('enhancedColumns----', enhancedColumns);
  return (
    <>
      <Flex
        flex={1}
        flexDir={'column'}
        gap={'22px'}
        p={{ base: 0, md: '20px' }}
        h={'100%'}
        w={'100%'}
        overflow={'scroll'}
      >
        <HeadingText>ESG Standards</HeadingText>
        <Flex flexDir={'row'} gap={'30px'} justifyContent={'space-between'} align={'center'}>
          <HStack gap={'10px'} align="center">
            <FormControl variant="floating">
              <InputGroup
                flex={1}
                minW={'150px'}
                maxW={{ base: '80%', xl: '280px' }}
                bg={'white'}
                borderRadius={'8px'}
                p={'1px'}
                color={'grey.800'}
              >
                <InputLeftElement>
                  <Icon as={BsSearch} />
                </InputLeftElement>
                <Input onChange={handleSearchChange} placeholder="" />
                <FormLabel>Search</FormLabel>
              </InputGroup>
            </FormControl>
          </HStack>

          {/* <HStack gap={'10px'} align="center">
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<BiChevronDown />}
                maxW="300px"
                bg="white"
                borderRadius="8px"
                border="1px solid #E2E4E9"
                color={selectedSubsidiary ? 'grey.800' : 'gray.500'}
                fontWeight="normal"
                textAlign="left"
                px="12px"
                height="40px"
                _hover={{ bg: 'white' }}
                _active={{ bg: 'white' }}
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
              >
                {selectedSubsidiary
                  ? subsidiaries.find(sub => sub.id.toString() === selectedSubsidiary)?.name
                  : 'Select Company/Subsidiaries'}
              </MenuButton>
              <MenuList
                maxW="300px"
                borderRadius="8px"
                border="1px solidrgb(218, 218, 219)"
                bg="white"
                py={0}
                zIndex={1000} // Added z-index
                maxH="300px"
                overflowY="auto"
              >
                {subsidiaries.map(subsidiary => (
                  <MenuItem
                    key={subsidiary.id}
                    maxW="300px"
                    value={subsidiary.id}
                    onClick={() => handleSubsidiaryChange({ target: { value: subsidiary.id.toString() } } as any)}
                    bg="white"
                    _hover={{ bg: '#137E59', color: 'white' }}
                    _focus={{ bg: '#137E59' }}
                    px="35px"
                    minH="40px"
                  >
                    {subsidiary.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </HStack> */}

          <Flex gap={'15px'}>
            <ExportDropDown
              setExportMenuOpen={setExportMenuOpen}
              exportMenuOpen={exportMenuOpen}
              display={{ base: 'none', md: 'flex' }}
              _hover={{ color: '#648332', fill: '#648332' }}
              color={'#3F6600'}
              fill={'rgba(19, 82, 0, 1)'}
              ExportBtn={
                // <Button variant="downloadReport" leftIcon={<Icon as={AiOutlineDownload} fontSize={'20px'} />} isLoading={isExporting}>
                //   Download ESG Standards
                // </Button>
                <></>
              }
              handleExport={(exportType: any) =>
                handleExportAsset({
                  endpoint: 'question',
                  type: exportType,
                  filter: { ...exportPayload, questionBankIds: selectedRows }
                })
              }
              Filters={
                <>
                  <Text display={'flex'} alignItems={'center'}>
                    Select Filter Type{' '}
                    <span style={{ marginLeft: '3px' }}>
                      <Popover trigger={'hover'} placement="top">
                        <PopoverTrigger>
                          <Box>
                            <IoInformationCircleOutline />
                          </Box>
                        </PopoverTrigger>
                        <PopoverContent bg={'grey.900'} color={'white'} w={'300px'}>
                          <PopoverArrow bg={'grey.900'} />
                          <PopoverBody userSelect={'text'} fontWeight={500}>
                            <UnorderedList>
                              <ListItem fontSize={'14px'}>To download all data - click download tab</ListItem>
                              <ListItem fontSize={'14px'}>To download specific data - choose filters below</ListItem>
                            </UnorderedList>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </span>
                  </Text>
                  <Box marginY={'20px'}>
                    <Text fontSize={'16px'}>
                      <DropDown
                        placeholder="Select Industry"
                        value={exportPayload?.industryIds || []}
                        selection="multiple"
                        w="100%"
                        options={
                          industryFilter?.map((item: { name: any, id: any }) => ({
                            value: item.id,
                            label: item.name
                          })) || []
                        }
                        borderRadius="10px"
                        borderColor="#E2E4E9"
                        onChange={(value: any) => setExportPayload({ ...exportPayload, industryIds: value || null })}
                        isDisabled={false}
                      />
                    </Text>
                  </Box>
                  <Box marginY={'20px'}>
                    <Text fontSize={'16px'}>
                      <DropDown
                        placeholder="Select Institution"
                        value={exportPayload?.institutionIds || []}
                        selection="multiple"
                        w="100%"
                        options={
                          institutionFilter?.map((item: { name: any, id: any }) => ({
                            value: item.id,
                            label: item.name
                          })) || []
                        }
                        borderRadius="10px"
                        borderColor="#E2E4E9"
                        onChange={(value: any) => setExportPayload({ ...exportPayload, institutionIds: value || null })}
                        isDisabled={false}
                      />
                    </Text>
                  </Box>
                </>
              }
            />

            {/* Show BulkAssignStandard for admin when one or more standards are selected */}
            {userRole === 'admin' && selectedRows.length >= 1 && (
              <BulkAssignStandard
                isDisabled={selectedRows.length < 1}
                selectedStandards={selectedRows as number[]}
                onClearSelection={() => setSelectedRows([])}
              />
            )}
            {/* Show BulkUnassignStandard for admin when one or more standards are selected */}
            {userRole === 'admin' && selectedRows.length >= 1 && (
              <BulkUnassignStandard
                isDisabled={selectedRows.length < 1}
                selectedStandards={selectedRows as number[]}
                onClearSelection={() => setSelectedRows([])}
              />
            )}
            {/* Show AssignStandard for non-admin users or when exactly one is selected */}
            <AssignStandard isDisabled={selectedRows.length !== 1} questionBankId={selectedRows[0]} />
            {/* Show UnassignStandard for non-admin users when exactly one is selected */}
            {userRole !== 'admin' && (
              <UnassignStandard isDisabled={selectedRows.length !== 1} questionBankId={selectedRows[0]} />
            )}
            <CreateReportsBank name={''} version={1} />
          </Flex>
        </Flex>
        <Flex flex={1} flexDir={'column'} backgroundColor={'#FFF'}>
          <Table
            loading={isLoadingQuestionBank || isFetchingQuestionBank}
            columns={enhancedColumns}
            dataSource={questionBankData?.data?.results || []}
            bg={'white'}
            overflowY={'auto'}
            TableContainerMinHeight={'260px'}
            rowSelections={rowSelections}
          />
          <HStack>
            {questionBankData?.data?.metadata?.totalItem > 10 && (
              <Pagination
                totalItems={questionBankData?.data?.metadata?.totalItem}
                totalPage={questionBankData?.data?.metadata?.totalPage}
                currentPage={questionBankData?.data?.metadata?.page}
                maxResults={params.max_results}
                onMaxResultsChange={handleMaxResultsChangeQuestionBank}
                onPageChange={handlePageChangeQuestionBank}
              />
            )}
          </HStack>
        </Flex>
      </Flex>

      <DownloadQuestionnaireDialog
        isOpen={isOpen}
        onClose={onClose}
        onDownload={handleSingleDownload}
        questionBank={selectedQuestionBank}
        isLoading={isLoadingQuestionnaire || isFetchingQuestionnaire}
      />

      {selectedQuestionBank && questionnaireData && (
        <QuestionnairePDFPreview
          name={selectedQuestionBank.name}
          questions={questionnaireData?.data?.questions}
          ref={componentRef}
          companyId={selectedCompanyId}
        />
      )}
      <EsgStandardPdfDownloadCompanySelectionModal
        isOpen={isCompanySelectionModalOpen}
        onClose={() => setIsCompanySelectionModalOpen(false)}
        companies={subsidiaries}
        onCompanySelect={handleCompanySelect}
      />
    </>
  );
};

export default Questionnaire;
