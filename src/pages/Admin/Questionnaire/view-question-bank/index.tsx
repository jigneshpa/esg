import { useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineDownload } from 'react-icons/ai';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Center,
  HStack,
  Icon,
  List,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  useDisclosure,
  VStack,
  Heading,
  Text as ChakraText,
  Badge
} from '@chakra-ui/react';
import axios from 'axios';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

import API from '@/api';
import { HeadingText } from '@/components';
import { USER_ROLE } from '@/constants';
import useDownloadQuestionnaire from '@/hooks/useDownloadQuestionnaire';
import useLoadOptions, { ApiType } from '@/hooks/useLoadOptions';
import { usePrint } from '@/hooks/usePrint';
import useSearchAndSelect, { BasicSearchAndSelectI } from '@/hooks/useSearchAndSelect';
import ManageCategories from '@/pages/Admin/Questionnaire/view-question-bank/components/ManageCategories';
import QuestionCategory from '@/pages/Admin/Questionnaire/view-question-bank/components/QuestionCategory';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { companyApi } from '@/store/api/company/companyApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectQuestionBankList } from '@/store/slices/refresh/refreshSelectors';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import { selectUserCompanyId, selectUserRole } from '@/store/slices/user/userSelectors';
import { QuestionStatus, Category } from '@/types/question';
import { organizeQuestions } from '@/utils';
import type { QuestionWithStatus } from '@/pages/Admin/Questionnaire/view-question-bank/components/QuestionCategory';
import YearSelectorCalendar from '@/components/YearSelectorCalendar';

interface UserMatch {
  username: string;
  companyId: number | null;
  userId?: number | null;
}

interface SubCategoryData {
  subCategoryName: string;
  questions: QuestionWithStatus[];
}

interface ThemeData {
  themeName: string;
  subCategories: SubCategoryData[];
}

const QuestionBank = () => {
  const dispatch = useAppDispatch();
  const { qbankId, companySelected } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorizedQuestions, setCategorizedQuestions] = useState<ThemeData[]>([]);
  const userRole = useAppSelector(selectUserRole);
  const companyId = useAppSelector(selectUserCompanyId);
  const [isChangingQuestionCategory, setIsChangingQuestionCategory] = useState(false);

  // selectedFormat should be typed as the allowed union
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'CSV' | 'XLSX' | 'DOCX'>('PDF');
  const handleFormatChange = (value: 'PDF' | 'CSV' | 'XLSX' | 'DOCX') => setSelectedFormat(value);

  const [matchingUsers, setMatchingUsers] = useState<UserMatch[]>(() => {
    const storedMatchingUsers = sessionStorage.getItem('matchingUsers');
    return storedMatchingUsers ? JSON.parse(storedMatchingUsers) : [];
  });
  const [userData, setUserData] = useState<{ [key: number]: any }>({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(userRole === 'user-admin');

  const subsidiaryId = useMemo(() => {
    const subsidiaryIdStr = sessionStorage.getItem('selectedSubsidiaryId');
    return subsidiaryIdStr ? parseInt(subsidiaryIdStr, 10) : companyId;
  }, [companyId]);

  const storedSubsidiaryIds = useMemo(() => {
    return JSON.parse(sessionStorage.getItem('subsidiaryIds') || '[]');
  }, []);

  // Initialize search and select state before using it in the query
  const {
    debouncedSearchTerm,
    institution,
    framework,
    industry,
    department,
    scope,
    handleSearchChange,
    handleInstitutionChange,
    handleFrameworkChange,
    handleIndustryChange,
    handleDepartmentChange,
    handleScopeChange
  } = useSearchAndSelect<BasicSearchAndSelectI>({
    // No initial state needed here
  });

  const { handleDownloadQuestionnaire, isDownloading } = useDownloadQuestionnaire({ title: 'Questionnaire Report' });
  const { componentRef, handlePrint } = usePrint();

  // Now use the initialized variables in the query
  const {
    data: queryData,
    refetch,
    isFetching,
    isLoading
  } = questionnaireApi.useGetQuestionBankListByIdQuery(
    {
      bankId: Number(qbankId),
      institution_id: institution ? [institution.value] : undefined,
      framework_id: framework ? [framework.value] : undefined,
      industry_id: industry ? [industry.value] : undefined,
      department_id: department ? [department.value] : undefined,
      scope_id: scope ? [scope.value] : undefined,
      search: debouncedSearchTerm,
      page: 1,
      max_results: 1000
    },
    { skip: !qbankId }
  );

  // Safely extract data from query result
  const data = queryData?.data || {};

  // Fetch company information if companySelected is provided
  const companySelectedNum = companySelected ? Number(companySelected) : undefined;
  const { data: companyData, isLoading: isLoadingCompany } = companyApi.useGetAllCompaniesQuery(
    { id: companySelectedNum },
    { skip: !companySelectedNum }
  );

  // Get company name and total questions count
  const companyName = useMemo(() => {
    if (companyData?.data && companyData.data.length > 0) {
      return companyData.data[0]?.name || 'Unknown Company';
    }
    return null;
  }, [companyData]);

  const totalQuestionsCount = useMemo(() => {
    if (data?.questions) {
      return data.questions.length;
    }
    return 0;
  }, [data?.questions]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch user data for user-admin
  useEffect(() => {
    const fetchUserData = async () => {
      if (!subsidiaryId || userRole !== 'user-admin' || isLoading || !data?.questions) {
        setIsLoadingUsers(false);
        return;
      }

      const userIds = (data.questions || [])
        .flatMap((question: any) => question.users || [])
        .map((user: any) => user.id)
        .filter((id: any, index: any, self: any) => self.indexOf(id) === index);

      if (userIds.length === 0) {
        setIsLoadingUsers(false);
        return;
      }

      let token: string | undefined;
      const greenFiTokenFromSession = sessionStorage.getItem('greenFiToken');
      const greenFiTokenFromLocal = localStorage.getItem('greenFiToken');

      if (greenFiTokenFromSession) {
        const parsedToken = JSON.parse(greenFiTokenFromSession);
        token = parsedToken?.accessToken;
      } else if (greenFiTokenFromLocal) {
        const parsedToken = JSON.parse(greenFiTokenFromLocal);
        token = parsedToken?.accessToken;
      }

      if (!token) {
        console.error('No valid token found');
        setIsLoadingUsers(false);
        return;
      }

      try {
        setIsLoadingUsers(true);
        const fetchPromises = userIds.map(async (id: any) => {
          const response = await axios.post(
            'https://aogx4497ue.execute-api.ap-southeast-1.amazonaws.com/dev/getSingleUser',
            // 'http://localhost:3005/getSingleUser',
            { userId: id },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
          );
          return { id, data: response.data };
        });

        const results = await Promise.all(fetchPromises);
        const userDataMap = results.reduce((acc: any, { id, data }: any) => {
          acc[id] = data;
          return acc;
        }, {});

        setUserData(userDataMap);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (userRole === 'user-admin') {
      fetchUserData();
    }
  }, [userRole, subsidiaryId, data?.questions, isLoading]);

  // Compute matchingUsers for user-admin
  useEffect(() => {
    if (userRole !== 'user-admin' || !data) return;

    let subsidiaryIdsArray: number[] = [];
    let matchedUsers: UserMatch[] = [];

    if (Object.keys(userData).length > 0) {
      if (subsidiaryId === companyId) {
        subsidiaryIdsArray = Array.isArray(storedSubsidiaryIds) ? storedSubsidiaryIds : [storedSubsidiaryIds];
        Object.values(userData).forEach((userObj: any) => {
          const userCompanyId = userObj?.user?.company_id;
          const userId = userObj?.user?.id;
          if (userCompanyId && subsidiaryIdsArray.map(Number).includes(userCompanyId)) {
            matchedUsers.push({
              username: userObj.user.user_name,
              companyId: userCompanyId,
              userId: userId
            });
          }
        });
      } else {
        subsidiaryIdsArray = typeof subsidiaryId === 'number' ? [subsidiaryId] : [];
        Object.values(userData).forEach((userObj: any) => {
          const userCompanyId = userObj?.user?.company_id;
          const userId = userObj?.user?.id;
          if (userCompanyId && subsidiaryIdsArray[0] === userCompanyId) {
            matchedUsers.push({
              username: userObj.user.user_name,
              companyId: userCompanyId,
              userId: userId
            });
          }
        });
      }
    }

    if (JSON.stringify(matchedUsers) !== JSON.stringify(matchingUsers)) {
      setMatchingUsers(matchedUsers);
      sessionStorage.setItem('matchingUsers', JSON.stringify(matchedUsers));
    }
  }, [userData, userRole, subsidiaryId, companyId, storedSubsidiaryIds, data]);

  // Filter questions based on userRole and matchingUsers
  const filteredQuestions = useMemo(() => {
    if (!data?.questions) return [];
    if (userRole === 'user-admin' && matchingUsers.length > 0) {
      return data.questions.map((question: any) => {
        const content = question.content ? JSON.parse(question.content) : [];
        const filteredContent = Array.isArray(content)
          ? content.filter((answer: any) => matchingUsers.some(match => match.userId === answer.user_id))
          : [];
        return {
          ...question,
          content: JSON.stringify(filteredContent),
          hasAnswer: filteredContent.length > 0
        };
      });
    }
    return data.questions;
  }, [data?.questions, userRole, matchingUsers]);

  // Format answers like QuestionnairePDFPreview
  const formatAnswers = (questions: any[]) => {
    return questions.map(question => {
      let answerText = 'No answer provided';
      try {
        if (question.type === 'textBox') {
          const parsedContent = JSON.parse(question.content);
          answerText = parsedContent.map((item: { answer: string }) => item.answer).join(', ');
        } else if (question.type === 'checkbox' || question.type === 'radio' || question.type === 'dropDown') {
          const contentArray = JSON.parse(question.content);
          if (contentArray.length > 0) {
            const parsedAnswer = JSON.parse(contentArray[0].answer);
            if (question.type === 'checkbox' && parsedAnswer.checkboxOptions) {
              const selectedOptions = parsedAnswer.checkboxOptions
                .filter((opt: any) => opt.isChecked)
                .map((opt: any) => opt.text)
                .join(', ');
              answerText = selectedOptions || 'No options selected';
            } else if ((question.type === 'radio' || question.type === 'dropDown') && parsedAnswer.radioOptions) {
              const selectedOption = parsedAnswer.radioOptions.find((opt: any) => opt.isChecked);
              answerText = selectedOption ? selectedOption.text : 'No option selected';
            }
          }
        } else if (question.type === 'table') {
          const contentObj = JSON.parse(question.content);
          if (contentObj.tableOptions) {
            answerText = 'Table data provided';
          }
        }
      } catch (error) {
        console.error('Error formatting answer:', error);
      }
      return { ...question, formattedAnswer: answerText };
    });
  };

  // Generate XLSX file
  const generateXLSX = (questions: any[], fileName: string) => {
    const formattedQuestions = formatAnswers(questions);
    const worksheetData = formattedQuestions.map((q, index) => ({
      'Question Number': `${index + 1}.`,
      'Question': q.title,
      'Answer': q.formattedAnswer
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questionnaire');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  };

  // Generate DOCX file
  const generateDOCX = (questions: any[], fileName: string) => {
    const formattedQuestions = formatAnswers(questions);
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: data?.name || 'Questionnaire Report', bold: true, size: 24 })]
            }),
            ...formattedQuestions
              .map((q, index) => [
                new Paragraph({
                  children: [new TextRun({ text: `${index + 1}. ${q.title}`, bold: true })]
                }),
                new Paragraph({
                  children: [new TextRun({ text: q.formattedAnswer })]
                })
              ])
              .flat()
          ]
        }
      ]
    });
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, fileName);
    });
  };

  const handleDownload = (fileType: 'CSV' | 'XLSX' | 'PDF' | 'DOCX') => {
    const fileName = `${data?.name || 'Questionnaire'}.${fileType.toLowerCase()}`;
    if (fileType === 'PDF') {
      handlePrint();
    } else if (fileType === 'XLSX') {
      generateXLSX(filteredQuestions, fileName);
    } else if (fileType === 'DOCX') {
      generateDOCX(filteredQuestions, fileName);
    } else {
      handleDownloadQuestionnaire({
        questionBankId: Number(qbankId),
        type: fileType.toLowerCase(),
        fileName
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { loadOptions: loadInstitutionOptions } = useLoadOptions(ApiType.Institution);
  const { loadOptions: loadFrameworkOptions } = useLoadOptions(ApiType.Framework);
  const { loadOptions: loadIndustryOptions } = useLoadOptions(ApiType.Industry);
  const { loadOptions: loadDepartmentOptions } = useLoadOptions(ApiType.Department);
  const { loadOptions: loadScopeOptions } = useLoadOptions(ApiType.Scope);
  const { loadOptions: loadUsersOptions } = useLoadOptions(ApiType.Users);

  const refetchQueries = useAppSelector(selectQuestionBankList);
  useEffect(() => {
    if (refetchQueries) {
      refetch();
      dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: false }));
    }
  }, [refetchQueries, refetch, dispatch]);

  const getQuestionStatus = (question: any): QuestionStatus => {
    let status: QuestionStatus = 'PENDING';
    if (question?.hasAnswer) {
      status = 'COMPLETED';
    }
    return status;
  };

  const organizedQuestions = useMemo(() => {
    if (filteredQuestions.length > 0) {
      return organizeQuestions(filteredQuestions);
    } else {
      return [];
    }
  }, [filteredQuestions, isChangingQuestionCategory]);

  function getCategorizedQuestions() {
    // Group by theme, then by category
    const themeMap = new Map<string, Map<string, QuestionWithStatus[]>>();
    organizedQuestions.forEach((question: any) => {
      const themeName = question.theme?.label || question.theme || 'No Theme';
      const categoryName = question.category?.name || 'Uncategorized';
      const status = getQuestionStatus(question);
      const questionWithStatus: QuestionWithStatus = { ...question, status };
      if (!themeMap.has(themeName)) {
        themeMap.set(themeName, new Map());
      }
      const categoryMap = themeMap.get(themeName)!;
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, []);
      }
      categoryMap.get(categoryName)!.push(questionWithStatus);
    });
    let categorizedData: ThemeData[] = Array.from(themeMap.entries())
      .map(([themeName, categoryMap]) => ({
        themeName,
        subCategories: Array.from(categoryMap.entries())
          .map(([subCategoryName, questions]) => ({ subCategoryName, questions }))
          .sort((a, b) => {
            if (a.subCategoryName === 'Uncategorized') return 1;
            if (b.subCategoryName === 'Uncategorized') return -1;
            return a.subCategoryName.localeCompare(b.subCategoryName);
          })
      }));
    // Move 'No Theme' to the end
    categorizedData = [
      ...categorizedData.filter(t => t.themeName !== 'No Theme'),
      ...categorizedData.filter(t => t.themeName === 'No Theme')
    ];
    categorizedData = categorizedData.sort((a, b) => {
      if (a.themeName === 'No Theme') return 1;
      if (b.themeName === 'No Theme') return -1;
      return a.themeName.localeCompare(b.themeName);
    });
    setCategorizedQuestions(categorizedData);
  }

  useEffect(() => {
    getCategorizedQuestions();
  }, [organizedQuestions]);

  // Update hasAllQuestionsAnswered based on filteredQuestions
  const hasAllQuestionsAnswered = useMemo(() => {
    if (userRole === 'user-admin' && isLoadingUsers) return false;
    return filteredQuestions.every((question: any) => question.hasAnswer);
  }, [filteredQuestions, userRole, isLoadingUsers]);

  const fetchCategories = async () => {
    try {
      const response = await API.getQuestionCategory();
      setCategories(response?.items || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddCategory = async (name: string) => {
    try {
      const response = await API.createQuestionCategory(name);
      if (response.name && response.id) {
        setCategories([...categories, response]);
      }
    } catch (error) {
      throw new Error('Failed to add category');
    }
  };

  const handleUpdateCategory = async (id: number, name: string) => {
    try {
      await API.updateQuestionCategory(id, name);
      await fetchCategories();
      setCategories(categories.map(cat => (cat.id === id ? { ...cat, name } : cat)));
    } catch (error) {
      throw new Error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await API.deleteQuestionCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (error) {
      throw new Error('Failed to delete category');
    }
  };

  const handleUpdateQuestionCategory = async (questionId: number, categoryId: number) => {
    try {
      setIsChangingQuestionCategory(true);
      await API.assignCategoryToQuestion(questionId, categoryId);
      await refetch();
      getCategorizedQuestions();
      setIsChangingQuestionCategory(false);
    } catch (error) {
      console.error('Failed to update question category:', error);
      throw new Error('Failed to update question category');
    }
  };

  const isViewPage = useMemo(() => {
    // Check if URL matches admin/view-question-bank/{id} but not admin/view-question-bank/{id}/{companyId}
    const pathSegments = location.pathname.split('/');
    const isViewQuestionBankPath = pathSegments.includes('view-question-bank');
    const hasId = pathSegments.length >= 4 && pathSegments[3] && !isNaN(Number(pathSegments[3]));
    const hasCompanyId = pathSegments.length >= 5 && pathSegments[4] && !isNaN(Number(pathSegments[4]));
    
    return Boolean(isViewQuestionBankPath && hasId && !hasCompanyId);
  }, [location.pathname]);

  return (
    <Box w="100%">
      <HStack justify="space-between" align="end" pt="20px" px="35px">
        <VStack align="start" spacing={1}>
          <HStack align="end" spacing={4}>
            <HeadingText>{data?.name || 'Loading...'}</HeadingText>
            {!isViewPage && data?.name && <YearSelectorCalendar selectedYear={selectedYear} setSelectedYear={setSelectedYear} />}
          </HStack>
          {companyName && (
            <HStack spacing={2} align="center" mt={1}>
              <ChakraText fontSize="xl" fontWeight="bold" color="green.700" lineHeight="1.2">
                {companyName}
              </ChakraText>
              <Badge colorScheme="green" variant="subtle" fontSize="md" ml={2} px={3} py={1} borderRadius="md">
                {totalQuestionsCount} {totalQuestionsCount === 1 ? 'Question' : 'Questions'}
              </Badge>
            </HStack>
          )}
        </VStack>
        <HStack align={'end'} spacing={4}>
          {!isViewPage && userRole === USER_ROLE.ADMIN && !isFetching && !isLoading && (
            <ManageCategories
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}
          {!isViewPage && !isFetching && !isLoading && hasAllQuestionsAnswered && (
            <Box border="1px solid black" borderRadius="5px" background="#FAFAFA" p="20px">
              <VStack>
                <RadioGroup size="sm" onChange={handleFormatChange} value={selectedFormat}>
                  <Stack direction="row">
                    <Radio size="sm" fontSize="14px" value="XLSX">
                      XLSX
                    </Radio>
                    <Radio fontSize="14px" value="PDF">
                      PDF
                    </Radio>
                    <Radio fontSize="14px" value="DOCX">
                      DOCX
                    </Radio>
                  </Stack>
                </RadioGroup>
                <Button
                  mt="16px"
                  border="1px solid #135200"
                  variant="downloadReport"
                  onClick={() => handleDownload(selectedFormat)}
                  isLoading={isDownloading}
                  leftIcon={<Icon as={AiOutlineDownload} fontSize={'20px'} fill={'rgba(19, 82, 0, 1)'} />}
                >
                  Download Report
                </Button>
              </VStack>
            </Box>
          )}
        </HStack>
      </HStack>

      <List spacing={3} mt="20px" px="35px" pb="20px">
        {isFetching || isLoading ? (
          <Center>
            <Spinner />
          </Center>
        ) : (
          categorizedQuestions.map(theme => (
            <Box key={theme.themeName} mb={8} p={4} borderRadius="md" boxShadow="md" bg="white">
              <Heading as="h2" fontSize="2xl" mb={3} color="green.700" fontWeight="bold" letterSpacing="wide">
                {theme.themeName}
              </Heading>
              {theme.subCategories.map(sub => (
                <Box key={sub.subCategoryName} ml={[0, 4]} mb={6} p={3} borderLeft="4px solid #135200" bg="gray.50" borderRadius="md">
                  <Heading as="h3" fontSize="lg" mb={2} color="green.900" fontWeight="semibold" letterSpacing="wider">
                    {sub.subCategoryName}
                  </Heading>
                  <QuestionCategory
                    category={sub.subCategoryName}
                    questions={sub.questions}
                    categories={categories}
                    onUpdateQuestionCategory={handleUpdateQuestionCategory}
                    year={selectedYear}
                    isViewPage={isViewPage}
                  />
                </Box>
              ))}
            </Box>
          ))
        )}
      </List>


    </Box>
  );
};

export default QuestionBank;
