import React, { createRef, useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineDownload } from 'react-icons/ai';
import { BsCheck2 } from 'react-icons/bs';
import { IoBusinessSharp, IoCloseOutline } from 'react-icons/io5';
import { MdCheck, MdOutlineArrowBackIos } from 'react-icons/md';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Center, HStack, Icon, Radio, RadioGroup, Spinner, Stack, Text, VStack } from '@chakra-ui/react';
import axios from 'axios';

import { HeadingText } from '@/components';
import Pagination from '@/components/common/Pagination';
import { MESSAGE, QUESTION_FORM_PAGE_TYPE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { usePrint } from '@/hooks/usePrint';
import useReviewStatus from '@/hooks/useReviewStatus';
import { mediaApi } from '@/store/api/media/mediaApi';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser, selectUserId, selectUserRole } from '@/store/slices/user/userSelectors';
import { ErrorData } from '@/types/common';
import { Question } from '@/types/question';
import { organizeQuestions } from '@/utils';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { useSubmisionDownloader } from '../../../hooks/useSubmisionDownloader';
import QuestionForm from '../../Admin/Questionnaire/question-bank/components/QuestionForm';
import RejectionRemarks from './RejectionRemarks';

interface FormData {
  id?: string | number;
  title?: string;
  type?: string;
  departments?: any[];
  scope?: number;
  institutions?: any[];
  frameworks?: any[];
  industries?: any[];
  question_bank_id?: string | number;
  is_required?: boolean;
  has_attachment?: boolean;
  has_remarks?: boolean;
  answer?: string;
  files?: any[];
  content?: string;
  remarks?: string;
  parentId?: string | number;
  institutionsName?: string[];
  industriesName?: string[];
  frameworksNames?: string[];
}

//TODO: Needed to be refactor/split logic for submit, view
const SurveyList = () => {
  const { confirm, notify } = useAppContext();
  const { componentRef, handlePrint } = usePrint();
  const { generateCsv, downloadCsv } = useSubmisionDownloader();
  const [errors, setHasErrors] = useState<null | boolean>(null);
  // const { companyId, frameworkId, industryId } = useParams();
  const { userQuestionnaireId } = useParams();
  const [searchParams] = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const companyIdQueryParam = searchParams.get('companyId');
  const status1 = searchParams.get('status');
  const userRole = useAppSelector(selectUserRole);
  const [getMediaLink] = mediaApi.useLazyGetMediaLinkQuery();
  const { hasPermissions, handleReviewStatusChange, isChangingStatus, status, RejectionModal } = useReviewStatus(
    submissionId,
    companyIdQueryParam
  );
  const navigate = useNavigate();

  const userId = useAppSelector(selectUserId);
  const user = useAppSelector(selectUser);

  const [submit, setSubmit] = useState(true);
  const [refsInitialized, setRefsInitialized] = useState<boolean>(false);
  const formRefs = useRef<React.RefObject<HTMLFormElement>[]>([]);
  const [allFormData, setAllFormData] = useState<FormData[]>([]);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [successfulSubmissions, setSuccessfulSubmissions] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10); // Number of questions per page

  const yearOptions = [
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' }
  ];
  const handleFormatChange = (value: any) => setSelectedFormat(value);

  const [
    createSubmission,
    { isLoading: isSubmitting, isSuccess: isSubmitted, error: submitedError, data: submissionResponse }
  ] = questionnaireApi.useCreateSubmissionMutation();
  const [updateSubmission, { isLoading: isUpdating, isSuccess: isUpdated, error: updateSubmissionError }] =
    questionnaireApi.useUpdateSubmissionMutation();
  const {
    data: { data: { company = {}, questions = [], companyId = 0, frameworkId = 0 } = {} } = {},
    isLoading,
    isSuccess
  } = questionnaireApi.useGetQuestionsByCompanyAndFrameworkQuery(
    {
      userQuestionnaireId: userQuestionnaireId
    },
    { skip: !userQuestionnaireId || !!submissionId }
    // { skip: (!companyId && !frameworkId && !industryId) || !!submissionId }
  );

  const { data: { data: submitedData = {} } = {}, isLoading: isQuestionsLoading } =
    questionnaireApi.useGetSubmissionByIdQuery(
      { submissionId, year: selectedYear },
      {
        skip: !submissionId && !selectedYear,
        refetchOnMountOrArgChange: true
      }
    );

  const [submissionAnswers, setSubmissionAnswers] = useState([]);

  // 🎯 Helper function to get parent question title from question object
  const getParentQuestionTitle = (question: Question): string | undefined => {
    return question.parentTitle;
  };

  // Add a reset function
  const resetSubmissionState = () => {
    setSubmit(true);
    setAttemptedSubmit(false);
    setSuccessfulSubmissions(0);
    setHasErrors(null);
    setAllFormData([]);
  };

  // Call this when the component mounts or when submission status changes
  useEffect(() => {
    if (submitedData.reviewStatus === 'Rejected') {
      resetSubmissionState();
    }
  }, [submitedData.reviewStatus]);
  useEffect(() => {
    try {
      if (submitedData.answer) {
        const answers = JSON.parse(submitedData.answer);
        setSubmissionAnswers(answers);
      } else {
        setSubmissionAnswers([]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [submitedData.answer]);

  useEffect(() => {
    if (isSuccess) {
      console.log('Company:', company);
      console.log('Questions:', questions);
      console.log('Company ID:', companyId);
      console.log('Framework ID:', frameworkId);
    }
  }, [isSuccess, company, questions, companyId, frameworkId]);

  useEffect(() => {
    if (isSubmitted && submissionResponse?.data?.data?.id) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('submissionId', submissionResponse?.data?.data?.id);
      window.location.search = searchParams.toString();
    } else if (submitedError) {
      notify({
        type: STATUS.ERROR,
        message: ((submitedError as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [isSubmitted, navigate, notify, submitedError]);

  // Add new effect for update submission
  useEffect(() => {
    if (isUpdated) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Answers successfully updated'
      });
    } else if (updateSubmissionError) {
      notify({
        type: STATUS.ERROR,
        message:
          ((updateSubmissionError as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [isUpdated, navigate, notify, updateSubmissionError]);

  const handleSubmission = async () => {
    const formData = await Promise.all(
      allFormData.map(async (answer: any) => {
        return {
          ...answer,
          files: await Promise.all(
            answer.files.map(async (file: any) => {
              const { isSuccess, data: { data: { key: fileKey = '', url: signedUrl = '' } = {} } = {} } =
                await getMediaLink({
                  name: file.name
                });
              let image = {};
              if (isSuccess) {
                const result = await axios.put(signedUrl, file, {
                  headers: { 'Content-Type': file.type }
                });
                if (result.status === 200) {
                  image = {
                    name: file.name,
                    key: fileKey,
                    contentType: file.type,
                    size: file.size
                  };
                }
              }
              return image;
            })
          )
        };
      })
    );

    const submissionData = {
      submissions: [
        {
          company_id: companyId,
          submitted_by_id: userId,
          answer: JSON.stringify(formData),
          user_questionnaire_id: userQuestionnaireId,
          question_id: currentPageQuestions?.map((q: any) => q.id)[0],
          id: submissionId || null
        }
      ]
    };

    console.log('submissionData', submissionData);

    if (submitedData.reviewStatus === 'Rejected') {
      // Use update mutation for rejected status
      await updateSubmission(submissionData);
    } else {
      // Use create mutation for new submissions
      await createSubmission(submissionData);
    }
  };

  const handleFormSubmit = (formData: any) => {
    //@ts-ignore
    if (formData?.remarks && formData?.remarks?.trim() && !formData.has_remarks) formData.has_remarks = true;
    if (formData?.files && formData?.files?.length && !formData.has_attachment) formData.has_attachment = true;
    if (formData.type === 'textBox') {
      formData.answer = formData.content;
    }
    console.log('formData----', formData);
    setAllFormData(prevData => {
      //@ts-ignore
      const existingEntryIndex = prevData?.findIndex(data => data?.id === formData?.id);
      const selectedInstitutionsNames = questions?.[existingEntryIndex <= 0 ? 0 : existingEntryIndex]?.institutions
        ?.filter((institution: { id: { toString: () => any } }) =>
          formData?.institutions?.includes(institution.id.toString())
        )
        .map((institution: { name: any }) => institution?.name);

      const selectedIndustriesNames = questions?.[existingEntryIndex <= 0 ? 0 : existingEntryIndex]?.industries
        ?.filter((industries: { id: { toString: () => any } }) =>
          formData?.industries?.includes(industries.id.toString())
        )
        .map((industries: { name: any }) => industries?.name);

      const selectedFrameworksNames = questions?.[existingEntryIndex <= 0 ? 0 : existingEntryIndex]?.frameworks
        ?.filter((frameworks: { id: { toString: () => any } }) =>
          formData?.frameworks?.includes(frameworks.id.toString())
        )
        .map((frameworks: { name: any }) => frameworks?.name);

      if (existingEntryIndex >= 0) {
        return [
          ...prevData.slice(0, existingEntryIndex),
          {
            ...formData,
            institutionsName: selectedInstitutionsNames,
            industriesName: selectedIndustriesNames,
            frameworksNames: selectedFrameworksNames
          },
          ...prevData.slice(existingEntryIndex + 1)
        ];
      } else {
        return [
          ...prevData,
          {
            ...formData,
            institutionsName: selectedInstitutionsNames,
            industriesName: selectedIndustriesNames,
            frameworksNames: selectedFrameworksNames
          }
        ];
      }
    });
  };
  const [isFormsSubmitted, setIsFormsSubmitted] = useState(false);

  useEffect(() => {
    if (formRefs.current.every(ref => ref.current && ref.current.isFormSubmitted)) {
      setIsFormsSubmitted(true);
    }
  }, [allFormData]);

  useEffect(() => {
    // Use organized questions length for proper validation
    const questionsToUse = questions.length > 0 ? questions : submissionAnswers;
    const organized = organizeQuestions(questionsToUse);
    const totalQuestionsCount = organized.length || questions.length;

    if (
      successfulSubmissions === totalQuestionsCount &&
      allFormData.length !== 0 &&
      submit &&
      errors === false &&
      attemptedSubmit
    ) {
      let foundErrors = false;

      for (const ref of formRefs.current) {
        if (ref.current && Object.keys(ref.current.errors || {}).length > 0) {
          foundErrors = true;
          break;
        }
      }

      !foundErrors &&
        confirm({
          title: submitedData.reviewStatus === 'Rejected' ? 'Update answers' : 'Submit answers',
          type: STATUS.ERROR,
          message: submitedData.reviewStatus === 'Rejected' ? 'Please confirm update' : 'Please confirm submission',
          onOk: () => {
            handleSubmission();
            setSubmit(false);
          }
        });
    }
  }, [
    isFormsSubmitted,
    allFormData,
    questions,
    submissionAnswers,
    confirm,
    errors,
    submit,
    handleSubmission,
    successfulSubmissions,
    attemptedSubmit,
    submitedData.reviewStatus
  ]);

  useEffect(() => {
    // Initialize refs when either questions or submissionAnswers are available
    const questionsToUse = questions.length > 0 ? questions : submissionAnswers;

    if (questionsToUse.length > 0 && !refsInitialized) {
      // Initialize refs for ALL questions, not just current page
      const organizedQuestions = organizeQuestions(questionsToUse);
      formRefs.current = organizedQuestions.map(() => createRef());
      setRefsInitialized(true);
    }
  }, [questions, submissionAnswers, refsInitialized]);

  const submitAllForms = async () => {
    let foundErrors = false;

    for (const ref of formRefs.current) {
      if (ref.current && Object.keys(ref.current.errors || {}).length > 0) {
        foundErrors = true;
        break;
      }
    }

    if (!foundErrors) {
      setSubmit(true);
      formRefs.current.forEach(ref => {
        ref.current?.submit();
      });
      // Calculate total questions count properly
      const questionsToUse = questions.length > 0 ? questions : submissionAnswers;
      const organized = organizeQuestions(questionsToUse);
      setSuccessfulSubmissions(organized.length);
      setHasErrors(false);
    } else {
      setHasErrors(true);
    }
    setAttemptedSubmit(true);
  };

  useEffect(() => {
    if (submissionAnswers.length > 0) {
      generateCsv(submissionAnswers);
    } else {
      generateCsv([]);
    }
  }, [submissionAnswers, generateCsv]);

  const handleCsvDownload = () => {
    downloadCsv('submission_report.csv');
  };
  console.log('userRole----', userRole);
  const organizedQuestions = useMemo(() => {
    if (questions.length > 0) {
      return organizeQuestions(questions);
    } else if (submissionAnswers.length > 0) {
      return organizeQuestions(submissionAnswers);
    } else {
      return [];
    }
  }, [questions, submissionAnswers]);

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return organizedQuestions;
    return organizedQuestions.filter(
      (q: Question) =>
        (q.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [organizedQuestions, searchQuery]);

  // Calculate pagination values
  const totalQuestions = filteredQuestions.length;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;

  // Get questions for current page
  const currentPageQuestions = useMemo(() => {
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, startIndex, endIndex]);
  console.log("currentPageQuestions", JSON.stringify(currentPageQuestions));
  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMaxResultsChange = (maxResults: number) => {
    // This could be implemented later if needed for dynamic page sizes
  };

  // Reset to first page when questions change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredQuestions.length]);

  const previousAnswer = useMemo(() => {
    if (submitedData?.answer) {
      if (typeof submitedData?.answer === 'string') {
        return JSON.parse(submitedData?.answer)[0].previousAnswer;
      }
      return submitedData?.answer;
    }
    return [];
  }, [submitedData?.answer]);
  // @ts-ignore
  return (
    <VStack p="26px 36px 118px 20px" w="100%" ref={componentRef}>
      {isLoading || isQuestionsLoading ? (
        <Center borderRadius={'10px'} bg={'white'}>
          <Spinner />
        </Center>
      ) : (
        <HStack h="238px" w="100%" mb="10px">
          <HStack h="100%" bgColor="#FFFF" w="100%" border="1px solid #E2E4E9" borderRadius="5px">
            <Button
              mt="12px"
              ml="11px"
              mb="auto"
              className="no-print"
              leftIcon={<Icon as={MdOutlineArrowBackIos} fontSize={'14px'} />}
              variant="outline"
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                const companyId = urlParams.get('companyId');
                navigate(`/admin/reporting-status/company/${companyId}`);
                if (userRole === 'manager') {
                  navigate(`/manager/reporting-status`);
                }
              }}
            >
              Back
            </Button>
            <VStack mx="auto">
              <Icon as={IoBusinessSharp} w="78px" h="78px" />
              <HeadingText color="001724" fontSize="30px" fontWeight="700" lineHeight="38px">
                {company?.name || submitedData?.company?.name || ''}
              </HeadingText>
              <Text fontSize="14px" fontWeight="500" lineHeight="22px">
                {(company?.address && company?.postalCode) ||
                  `${submitedData?.company?.address || ''} ${submitedData?.company?.address ? ',' : ''}  ${submitedData?.company?.postalCode || ''
                  }` ||
                  ''}
              </Text>
              <Text color="#66747C" fontSize="12px">
                {company?.country?.name || submitedData?.company?.country?.name || ''}
              </Text>
            </VStack>
          </HStack>
          {submissionId && (
            <VStack
              className="no-print"
              h="100%"
              bgColor="#FFFF"
              w="292px"
              border="1px solid #E2E4E9"
              borderRadius="5px"
            >
              <HStack bgColor="#FAFAFA" w="100%" borderBottom="1px solid #DEDEDE" mb="23px">
                <Text fontWeight="700" h="55px" p="15px 20px">
                  Reports
                </Text>
              </HStack>
              <VStack w="100%">
                {/* <Select
                  styles={customStyles}
                  options={yearOptions}
                  value={yearOptions.find(option => option.value === selectedYear)}
                  //@ts-ignore
                  onChange={option => setSelectedYear(option.value)}
                /> */}
                <RadioGroup size="sm" onChange={handleFormatChange} value={selectedFormat}>
                  <Stack direction="row">
                    <Radio size="sm" fontSize="14px" value="CSV">
                      CSV
                    </Radio>
                    <Radio fontSize="14px" value="PDF">
                      PDF
                    </Radio>
                  </Stack>
                </RadioGroup>
                <Button
                  mt="16px"
                  border="1px solid#135200"
                  variant="downloadReport"
                  onClick={selectedFormat === 'CSV' ? handleCsvDownload : handlePrint}
                  leftIcon={<Icon as={AiOutlineDownload} fontSize={'20px'} fill={'rgba(19, 82, 0, 1)'} />}
                >
                  Download Report
                </Button>
              </VStack>
            </VStack>
          )}
        </HStack>
      )}

      {submitedData.reviewStatus !== 'Approved' && <RejectionRemarks previousAnswer={previousAnswer} remarks={submitedData?.remarks} status={status || ''} />}

      {submissionId &&
        submitedData.reviewStatus !== 'Rejected' &&
        currentPageQuestions?.map((question: Question, index: number) => (
          <QuestionForm
            index={startIndex + index}
            ref={formRefs.current[startIndex + index]}
            key={question.id}
            question={question}
            mode="view"
            onFormSubmit={handleFormSubmit}
            displayIndex={question.displayNo}
            isSubQuestion={!!question.parentId}
            hasAiAnswerSuggestion={question.ai_suggested_answers && question.ai_suggested_answers.length > 0}
            pageType={QUESTION_FORM_PAGE_TYPE.SUBMISSION_REVIEW}
            parentQuestion={getParentQuestionTitle(question)}
          />
        ))}
      {status1 !== 'Approved' &&
        status1 !== 'Rejected' &&
        submissionId &&
        hasPermissions &&
        submissionAnswers.length > 0 ? (
        <HStack ml="auto" className="no-print">
          <Button
            w={'120px'}
            leftIcon={<Icon as={MdCheck} fontSize={'18px'} />}
            onClick={() => handleReviewStatusChange('Approved')}
            isLoading={status === 'Approved' ? isChangingStatus : false}
          >
            Approve
          </Button>
          <Button
            w={'120px'}
            variant="reject"
            color="#FFFF"
            bgColor="#FF4D4F"
            leftIcon={<Icon as={IoCloseOutline} fontSize={'18px'} />}
            onClick={() => handleReviewStatusChange('Rejected')}
            isLoading={(status === 'Reject' ? isChangingStatus : false) || isUpdating}
          >
            Reject
          </Button>
          <RejectionModal />
        </HStack>
      ) : null}
      {(submitedData.reviewStatus === 'Rejected' || !submissionId) &&
        currentPageQuestions?.map((question: Question, index: number) => (
          <QuestionForm
            index={startIndex + index}
            ref={formRefs.current[startIndex + index]}
            key={`${question.id}-${companyId}-${frameworkId}`}
            question={question}
            parentQuestion={getParentQuestionTitle(question)}
            onFormSubmit={handleFormSubmit}
            mode="answer"
            displayIndex={question.displayNo}
            isSubQuestion={!!question.parentId}
            pageType={QUESTION_FORM_PAGE_TYPE.USER_ANSWER}
          />
        ))}
      {/* Pagination Controls */}
      {totalQuestions > questionsPerPage && (
        <HStack w="100%" justify="center" mt={6} mb={4}>
          <Pagination
            totalItems={totalQuestions}
            totalPage={totalPages}
            currentPage={currentPage}
            maxResults={questionsPerPage}
            onMaxResultsChange={handleMaxResultsChange}
            onPageChange={handlePageChange}
          />
        </HStack>
      )}

      {(submissionId || questions.length > 0) &&
        (!submissionId || (submissionId && submitedData.reviewStatus === 'Rejected')) &&
        userRole === 'user' ? (
        <HStack w="100%">
          <Button
            ml="auto"
            isLoading={isSubmitting || isUpdating}
            leftIcon={<Icon as={BsCheck2} fontSize={'14px'} />}
            onClick={submitAllForms}
          >
            Submit
          </Button>
        </HStack>
      ) : null}
    </VStack>
  );
};

export default SurveyList;
