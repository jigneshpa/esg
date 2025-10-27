// @ts-nocheck
//merge conflicts resolved
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { MdDeleteOutline } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import { AsyncPaginate } from 'react-select-async-paginate';
import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Text,
  VStack
} from '@chakra-ui/react';
import axios from 'axios';

import { customStyles, Placeholder } from '@/components/common/InputOption';
import { CustomValueContainer } from '@/components/common/SortableHeader';
import { InputOption } from '@/components/common/InputOption';
import FormTableBuilder from '@/components/DynamicTableBuilder/FormTableBuilder';
import { FieldNames, USER_ROLE } from '@/constants';
import { answerTypes } from '@/constants/mock';
import { useAttributes } from '@/context/AtrributesContext';
import useDeleteAnswers from '@/hooks/useDeleteAnswers';
import { ApiType } from '@/hooks/useLoadOptions';
import useQuestionSchema from '@/hooks/useQuestionSchema';
import useQuestionUserAssignment from '@/hooks/useQuestionUserAssignment';
import useSearchAndSelect from '@/hooks/useSearchAndSelect';
import useUpdateAnswer from '@/hooks/useUpdateAnswer';
import useUpdateQuestion from '@/hooks/useUpdateQuestion';
import AttachmentButtons from '@/pages/Admin/Questionnaire/view-question-bank/components/QuestionAttachmentButton';
import { useAppSelector } from '@/store/hooks';
import { selectUserCompanyId, selectUserId, selectUserRole } from '@/store/slices/user/userSelectors';
import { ISelect } from '@/types/common';
import { Category, Question, QuestionStatus } from '@/types/question';
import { getStatusColor } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';

import CheckboxOptions from './question-types/CheckboxOptions';
import CompareOptions from './question-types/CompareOptions';
import DropDownOptions from './question-types/DropDownOptions';
import RadioOptions from './question-types/RadioOptions';
import TextBox from './question-types/TextBox';

export type QuestionFormSubmit = {
  is_required?: boolean,
  has_attachment?: boolean,
  has_remarks?: boolean,
  type: string,
  title: string,
  department: string | string[],
  scope: number,
  institution: string | string[],
  framework: string | string[],
  industry: string | string[],
  answer?: string,
  checkboxOptions?: any[],
  dropDownOptions?: any[],
  radioOptions?: any[],
  content?: string,
  remarks?: string,
  files?: [],
  category?: Category | null,
  compare?:
  | {
    compareLeft: number,
    comparisonType: string,
    compareRight: number
  }
  | undefined,
  tableOptions?: any
};

interface UserMatch {
  username: string;
  companyId: number | null;
  userId?: number | null;
}

type QuestionFormProps = {
  parentQuestion?: Question | null,
  question?: Question,
  mode?: string,
  index?: number | undefined,
  displayIndex?: string,
  isSubQuestion?: boolean,
  categories?: Category[],
  matchingUsers?: UserMatch[],
  year?: number,
  onUpdateQuestionCategory?: (questionId: number, categoryId: number) => Promise<void>,
  onFormSubmit?: (data: QuestionFormSubmit, questionId: number | undefined) => void,
  pageType: string,
  isViewPage?: boolean,
  answerData: {
    answer: string,
    remarks: string,
    attachmentData: {
      name: string,
      key: string,
      contentType: string,
      size: number
    }[]
  }
};

// Common Question Display Component
interface QuestionDisplayProps {
  title: string;
  question?: boolean;
  parentQuestion?: any;
  mode?: string;
  displayIndex?: string | number;
  isDisabledOnEditMode?: boolean;
  files?: { url?: string, name?: string };
  dwonloadUrl: () => void;
  handleView: () => void;
  isRequired?: boolean;
  hasAttachment?: boolean;
  hasRemarks?: boolean;
  isQuestionEditMode?: boolean;
  questionData?: any;
  children?: React.ReactNode;
  // Assign Users props
  questions?: any;
  selectedUsers?: any[];
  onUserSelect?: (users: any[]) => void;
  onAssign: () => void;
  onUnassignUser?: (userId: string) => void;
  isAssigning?: boolean;
  adminUsers?: any[];
  loadUsersOptions?: (search: string, loadedOptions: any[], additional: { page: number }) => Promise<any>;
  isViewPage?: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  title,
  question,
  parentQuestion,
  mode,
  displayIndex,
  isDisabledOnEditMode,
  files,
  dwonloadUrl,
  handleView,
  isRequired,
  hasAttachment,
  hasRemarks,
  isQuestionEditMode,
  questionData,
  children,
  questions,
  selectedUsers = [],
  onUserSelect,
  onAssign,
  onUnassignUser,
  isAssigning,
  adminUsers = [],
  loadUsersOptions,
  isViewPage
}) => {
  const isAnswerMode = mode === 'answer' || mode === 'view';
  const isViewMode = mode === 'view';
  const { loadOptions } = useAttributes();
  const { loadOptions: defaultLoadUsersOptions } = loadOptions(ApiType.Users);
  const userRole = useAppSelector(selectUserRole);

  // Fallback loadOptions for non-user-admin
  const effectiveLoadUsersOptions = loadUsersOptions || defaultLoadUsersOptions;

  // Custom loadOptions for user-admin using adminUsers
  const adminLoadOptions = async (search: string, loadedOptions: any[], { page }: { page: number }) => {
    console.log('adminLoadOptions called with:', { search, page, adminUsers });
    const filteredOptions = adminUsers.filter(user => user.label.toLowerCase().includes(search.toLowerCase()));
    return {
      options: filteredOptions,
      hasMore: false,
      additional: { page: page + 1 }
    };
  };

  const labelStyles = {
    borderBottom: isAnswerMode ? '1px solid #DEDEDE' : undefined,
    height: isAnswerMode ? '100%' : undefined,
    backgroundColor: isAnswerMode ? '#FAFAFA' : undefined,
    fontSize: '16px',
    color: isAnswerMode ? '#1C3E57' : '#262626',
    opacity: '1 !important'
  };

  return (
    <VStack spacing={4}>
      <FormControl>
        <FormLabel {...labelStyles} mx={isAnswerMode && '0'}>
          {question && !isAnswerMode && isQuestionEditMode && !isDisabledOnEditMode ? (
            <Input defaultValue={title} autoFocus />
          ) : (
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
              bgColor="#FAFAFA"
              borderBottom="1px solid #DEDEDE"
            >
              <HStack
                w="100%"
                gap="11px"
                flexWrap="wrap"
                minHeight="55px"
                padding={question && mode !== 'answer' && mode !== 'view' ? '20px' : ''}
              >
                <Text>
                  {typeof parentQuestion === "object" ? parentQuestion?.title || '' : typeof parentQuestion === 'string' ? parentQuestion : ''}
                </Text>
                <Text w="90%" p={isAnswerMode ? '20px' : ''}>
                  {displayIndex ? `${displayIndex}. ` : ''}
                  {title}
                  {!questionData?.isNotQuestion && isRequired ? <span style={{ color: 'red' }}> *</span> : null}
                </Text>
              </HStack>

              <HStack>
                {!isViewPage && isViewMode && !questions?.isNotQuestion && (
                  <HStack spacing={4} mr={'20px'} my={'20px'}>
                    <FormControl w="auto" variant="floating">
                      <InputGroup zIndex={6} w="auto">
                        <AsyncPaginate
                          placeholder=""
                          debounceTimeout={800}
                          isMulti
                          loadOptions={userRole === 'user-admin' ? adminLoadOptions : effectiveLoadUsersOptions}
                          styles={customStyles}
                          components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                          onChange={selectedOptions => {
                            const newSelectedUsers = selectedOptions || [];
                            const previousUsers = selectedUsers || [];

                            // Get the actual assigned users from question.users for comparison
                            const actualAssignedUsers =
                              questions?.users?.map(user => ({
                                value: user.id,
                                label: user.name
                              })) || [];

                            // Check if users were removed by comparing against BOTH actual assigned users AND previous state
                            const currentUserCount = Math.max(actualAssignedUsers.length, previousUsers.length);
                            if (newSelectedUsers.length < currentUserCount) {
                              // Find removed users from BOTH sources (Redux store OR previous dropdown state)
                              const allCurrentUsers = [...actualAssignedUsers];

                              // Add users from previous state that might not be in Redux yet
                              previousUsers.forEach(prevUser => {
                                if (!allCurrentUsers.some(current => current.value === prevUser.value)) {
                                  allCurrentUsers.push(prevUser);
                                }
                              });

                              const removedUsers = allCurrentUsers.filter(
                                currentUser => !newSelectedUsers.some(newUser => newUser.value === currentUser.value)
                              );

                              // If users were removed, trigger unassign for each removed user
                              if (removedUsers.length > 0) {
                                // First update the UI immediately for better UX
                                onUserSelect?.(newSelectedUsers);

                                // Then trigger the API calls
                                removedUsers.forEach(removedUser => {
                                  if (onUnassignUser) {
                                    onUnassignUser(removedUser.value.toString());
                                  }
                                });
                                return;
                              }
                            }

                            // Only update selected users if this wasn't an unassign operation
                            onUserSelect?.(newSelectedUsers);
                          }}
                          hideSelectedOptions={false}
                          value={selectedUsers}
                          menuPosition="absolute"
                          menuPlacement="bottom"
                          maxMenuHeight={180}
                          closeMenuOnSelect={false}
                          closeMenuOnScroll={false}
                          isClearable={true}
                          onBlur={() => {
                            const menu = document.querySelector('.select__menu');
                            if (menu) {
                              menu.classList.remove('select__menu--is-open');
                            }
                          }}
                          additional={{ userRole, adminUsers }} // Pass userRole and adminUsers to InputOption
                        />
                        <Input placeholder="" value={selectedUsers} hidden />
                        <FormLabel>Assign Users</FormLabel>
                      </InputGroup>
                    </FormControl>
                    <Button
                      onClick={onAssign}
                      fontSize={'0.9em'}
                      fontWeight={700}
                      w="auto"
                      bg="#137E59"
                      _hover={{ opacity: 0.8 }}
                      isLoading={isAssigning}
                    >
                      Assign
                    </Button>
                  </HStack>
                )}
                {!isViewPage && !questionData?.isNotQuestion && files?.url ? (
                  <Box display="flex" gap={4} alignItems="center">
                    <Button onClick={dwonloadUrl} mr={'10px'} px={'20px'}>
                      Download Attachment
                    </Button>
                    <Button onClick={handleView} mr={'10px'} px={'20px'}>
                      View Attachment
                    </Button>
                  </Box>
                ) : null}
              </HStack>
            </Box>
          )}
        </FormLabel>
        <Box px={isAnswerMode ? '20px' : ''} margin="0">
          {children}
        </Box>
      </FormControl>
    </VStack>
  );
};

const QuestionForm = forwardRef(
  (
    {
      parentQuestion,
      question,
      mode,
      onFormSubmit,
      index,
      displayIndex,
      isSubQuestion,
      categories = [],
      matchingUsers = [],
      onUpdateQuestionCategory,
      year,
      pageType,
      answerData,
      isViewPage
    }: QuestionFormProps,
    ref
  ) => {
    const companyId = useAppSelector(selectUserCompanyId);
    const { qbankId, companySelected } = useParams<{
      qbankId: string,
      companySelected?: string
    }>();
    const companySelectedNum = companySelected ? Number(companySelected) : undefined;
    // console.log('parent question is ', parentQuestion);
    const [selectedType, setSelectedType] = useState<null | ISelect>(null);
    const [isUpload, setIsUpload] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const schema = useQuestionSchema(selectedType, mode, !!question?.isRequired, question?.hasAttachement);
    const [isEditMode, setIsEditMode] = useState(false);
    const isDisabledOnEditMode = mode === 'edit' && !isEditMode;
    const isDisabledOnViewMode = mode === 'view' && !isEditMode;

    const isAnswerMode = mode === 'answer';
    const isViewMode = mode === 'view';
    const [selectedUsers, setSelectedUsers] = useState<ISelect[]>([]); // For non-user-admin
    const [adminSelectedUsers, setAdminSelectedUsers] = useState<ISelect[]>([]); // For user-admin
    const [filteredUsers, setFilteredUsers] = useState<ISelect[]>([]);
    const { loadOptions } = useAttributes();
    const { loadOptions: loadUsersOptions } = loadOptions(ApiType.Users);

    const { updateAnswer, isUpdating: _isAnswerUpdating } = useUpdateAnswer({
      questionId: question?.id,
      setIsEditMode
    });
    const { updateQuestion, isUpdating: _isQuestionUpdating } = useUpdateQuestion({
      questionId: question?.id,
      qbankId,
      setIsEditMode
    });
    const { assignUsers, unassignUsers, isAssigning } = useQuestionUserAssignment({
      questionId: question?.id,
      setIsEditMode,
      bankId: qbankId, // Pass qbankId as bankId
      year // Pass year prop
    });
    const { handleDelete, isLoading } = useDeleteAnswers();
    const [updatingCategory, setUpdatingCategory] = useState(false);
    const userRole = useAppSelector(selectUserRole);
    const userId = useAppSelector(selectUserId);

    const [adjustedStatus, setAdjustedStatus] = useState<QuestionStatus | undefined>(question?.status);

    const methods = useForm<QuestionFormSubmit>({
      resolver: yupResolver(schema),
      mode: 'onChange',
      defaultValues: {
        title: '',
        scope: undefined,
        checkboxOptions: [{ text: '' }],
        radioOptions: question?.type === 'radio' ? answerData.answer : question?.questionContent ? JSON.parse(question?.questionContent)?.radioOptions : [{ text: '', isChecked: false, remarks: false }],
        dropDownOptions: [{ text: '' }],
        compare: { compareLeft: 0, comparisonType: '', compareRight: 0 },
        tableOptions: {
          id: '1',
          name: 'Table Question',
          description: '',
          columns: [],
          cells: [],
          rows: 3,
          cols: 3
        },
        files: [],
        content: typeof answerData.answer === 'string' ? answerData.answer : '',
        remarks: answerData.remarks || '',
        category: null
      }
    });

    const {
      handleSubmit,
      watch,
      getValues,
      register,
      setValue,
      formState: { errors }
    } = methods;

    const { handleInstitutionChange, handleFrameworkChange, handleIndustryChange, handleDepartmentChange } =
      useSearchAndSelect({ setValue });

    useEffect(() => {
      if (question) {
        const contentAnswer = question.content
          ? JSON.parse(question.content)
          : {};
        // const contentAnswer = question.content ? JSON.parse(question.content) : {};
        console.log('content Answer 1234', contentAnswer);
        let contentObj = [];

        if (Array.isArray(contentAnswer) && contentAnswer.length > 0) {
          contentObj = contentAnswer.map(contentEachAnswer => {
            if (contentEachAnswer.answer && typeof contentEachAnswer.answer === 'string') {
              try {
                return {
                  ...contentEachAnswer,
                  answer: JSON.parse(contentEachAnswer.answer)
                };
              } catch (error) {
                console.error('Error parsing answer:', contentEachAnswer.answer, error);
                return contentEachAnswer;
              }
            }
            return contentEachAnswer;
          });
        }

        if (question.type === 'radio') {
          const currentRadioOptions = getValues('radioOptions');
          if (!currentRadioOptions || currentRadioOptions.length === 0 || currentRadioOptions.filter((item: any) => item.text).length === 0) {
            const radioOptionsData = answerData.answer ? JSON.parse(answerData.answer)?.radioOptions : question?.questionContent ? JSON.parse(question?.questionContent)?.radioOptions : [{ text: '', isChecked: false, remarks: false }];
            setValue('radioOptions', radioOptionsData);
          }
        }
        if (question.type === 'table') {
          if (Array.isArray(contentAnswer)) {
            try {
              contentObj = JSON.parse(
                contentAnswer[0].answer || "{}"
              ).tableOptions;
            } catch (error) {
              contentObj = undefined;
              console.error("Error parsing table options:", error);
            }
          } else if (typeof contentAnswer === "object") {
            contentObj = contentAnswer.tableOptions || {};
          }
          console.log('1234', 'inside');
        }
        console.log('contentObj is 1234', contentObj);
        const filteredContent =
          companySelectedNum !== undefined
            ? (Array.isArray(contentObj) ? contentObj : []).filter(
              content =>
                content.company_id === companySelectedNum ||
                (content.answer && content.answer.companyId === companySelectedNum)
            )
            : contentObj;
        // console.log('filtered content', filteredContent);
        // console.log('filtered content for general role', filteredContent);
        setValue('title', question.title);
        setValue('type', question.type);
        setValue('is_required', !!question.isRequired);
        setValue('has_attachment', !!question.hasAttachment);
        setValue('has_remarks', !!question.hasRemarks);

        if (question.users) {
          const userValues = question.users.map(user => ({
            value: user.id,
            label: user.name
          }));
          if (userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager') {
            setAdminSelectedUsers(userValues.filter(user => filteredUsers.some(f => f.value === user.value)));
          } else {
            setSelectedUsers(userValues);
          }
          // console.log('Initial selectedUsers/adminSelectedUsers from question.users:', userValues);
        }

        if (question.category) {
          setValue('category', question.category);
        }

        if (question?.departments) {
          const departmentValues =
            question?.departments?.map(i => ({
              value: i.id,
              label: i.name
            })) || [];
          setValue('department', departmentValues);
          handleDepartmentChange(departmentValues);
        }

        if (question?.scope) {
          setValue('scope', Number(question.scope));
        }

        const selectedTypeOption = answerTypes.find(type => type.value === question.type);
        setSelectedType(selectedTypeOption || null);

        if ((userRole === 'user-admin' || userRole === 'admin') && Array.isArray(contentObj)) {
          const filteredContent = contentObj.filter(content =>
            matchingUsers.some(match => match.userId === content.user_id)
          );
          const isAnswered = filteredContent.length > 0;



          if (
            question.type === 'dropDown' &&
            filteredContent.some(content => Array.isArray(content.answer?.dropDownOptions))
          ) {
            const filteredDropDownOptions = filteredContent.flatMap(content => content.answer.dropDownOptions || []);
            setValue('dropDownOptions', filteredDropDownOptions.length > 0 ? filteredDropDownOptions : [{ text: '' }]);
          } else {
            setValue('dropDownOptions', [{ text: '' }]);
          }

          if (question.type === 'compare' && filteredContent.some(content => content.answer?.compare)) {
            const filteredCompare = filteredContent.flatMap(content => content.answer.compare || []);
            setValue(
              'compare',
              filteredCompare.length > 0 ? filteredCompare[0] : { compareLeft: 0, comparisonType: '', compareRight: 0 }
            );
          } else {
            setValue('compare', {
              compareLeft: 0,
              comparisonType: '',
              compareRight: 0
            });
          }

          if (question.type === 'table' && contentObj) {
            setValue('tableOptions', contentObj);
          } else {
            setValue('tableOptions', {
              id: '1',
              name: 'Table Question',
              description: '',
              columns: [],
              cells: [],
              rows: 3,
              cols: 3
            });
          }

          setAdjustedStatus(isAnswered ? 'COMPLETED' : 'PENDING');
        } else {
          const isAnswered = Array.isArray(contentObj) && contentObj.length > 0;



          if (
            question.type === 'dropDown' &&
            Array.isArray(contentObj) &&
            contentObj.some(content => Array.isArray(content.answer?.dropDownOptions))
          ) {
            const dropDownOptions = contentObj.flatMap(content => content.answer.dropDownOptions);
            setValue('dropDownOptions', dropDownOptions);
          } else {
            setValue('dropDownOptions', [{ text: '' }]);
          }

          if (
            question.type === 'compare' &&
            Array.isArray(contentObj) &&
            contentObj.some(content => content.answer?.compare)
          ) {
            const compare = contentObj.flatMap(content => content.answer.compare);
            setValue('compare', compare[0]);
          } else {
            setValue('compare', {
              compareLeft: 0,
              comparisonType: '',
              compareRight: 0
            });
          }

          if (question.type === 'table' && contentObj) {
            setValue('tableOptions', contentObj);
          } else {
            setValue('tableOptions', {
              id: '1',
              name: 'Table Question',
              description: '',
              columns: [],
              cells: [],
              rows: 3,
              cols: 3
            });
          }

          setAdjustedStatus(isAnswered ? 'COMPLETED' : 'PENDING');
        }

        if (question.institutions) {
          const institutionValues =
            question?.institutions?.map(i => ({
              value: i.id,
              label: i.name
            })) || [];
          setValue('institution', institutionValues);
          handleInstitutionChange(institutionValues);
        }
        if (question.frameworks) {
          const frameworkValues = question?.frameworks?.map(f => ({
            value: f.id,
            label: f.name
          }));
          setValue('framework', frameworkValues);
          handleFrameworkChange(frameworkValues);
        }
        if (question.industries) {
          const industryValues = question?.industries?.map(ind => ({
            value: ind.id,
            label: ind.name
          }));
          setValue('industry', industryValues);
          handleIndustryChange(industryValues);
        }
      }
    }, [question, setValue, matchingUsers, userRole, filteredUsers]);

    // Effect to clear dropdown state when users are unassigned
    useEffect(() => {
      if (question?.users) {
        const currentAssignedUserIds = new Set(question.users.map(user => user.id));

        if (userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager') {
          // Clear adminSelectedUsers that are no longer assigned
          setAdminSelectedUsers(prev => prev.filter(selectedUser => currentAssignedUserIds.has(selectedUser.value)));
        } else {
          // Clear selectedUsers that are no longer assigned
          setSelectedUsers(prev => prev.filter(selectedUser => currentAssignedUserIds.has(selectedUser.value)));
        }
      } else {
        if (userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager') {
          setAdminSelectedUsers([]);
        } else {
          setSelectedUsers([]);
        }
      }
    }, [question?.users, userRole]);

    const title = watch('title');
    const selectedCategory = watch('category');

    const handleCategoryChange = async (categoryId: string) => {
      if (!question || !onUpdateQuestionCategory || updatingCategory) return;

      try {
        setUpdatingCategory(true);
        const newCategoryId = parseInt(categoryId, 10);
        await onUpdateQuestionCategory(question.id, newCategoryId);

        const newCategory = categories.find(cat => cat.id === newCategoryId);
        if (newCategory) {
          setValue('category', newCategory);
        }
      } catch (error) {
        console.error('Failed to update question category:', error);
      } finally {
        setUpdatingCategory(false);
      }
    };

    const CategoryOption = ({ children, ...props }) => {
      const { innerProps, data } = props;
      return (
        <div
          {...innerProps}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            backgroundColor: props.isFocused ? '#f5f5f5' : 'white',
            color: props.isSelected ? '#137E59' : 'inherit'
          }}
        >
          {data.label}
        </div>
      );
    };

    // Memoized customLoadUsersOptions
    const customLoadUsersOptions = useCallback(
      async (search: string, loadedOptions: any[], { page }: { page: number }) => {
        console.log('customLoadUsersOptions called with:', {
          search,
          page,
          userRole
        });

        if (userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager') {
          let companyIds: number[] = [];
          companyIds = [companySelectedNum];

          const companyIdsParam = companyIds.length > 0 ? companyIds.join(',') : '';
          console.log('companyIds param', companyIdsParam);
          const url = `https://g2qbstlxmj.execute-api.us-east-1.amazonaws.com/uat/users?page=1&max_results=100000000000${companyIdsParam ? `&companyIds=[${companyIdsParam}]` : ''
            // const url = `http://localhost:3000/local/users?page=1&max_results=100000000000${companyIdsParam ? `&companyIds=[${companyIdsParam}]` : ''
            }`;
          const greenFiTokenStr = sessionStorage.getItem('greenFiToken') || localStorage.getItem('greenFiToken');
          const token = greenFiTokenStr ? JSON.parse(greenFiTokenStr).accessToken : null;
          console.log('token is ', token);

          try {
            const response = await axios.get(url, {
              headers: {
                Authorization: token ? `Bearer ${token}` : undefined
              }
            });
            const data = response.data;
            console.log('API Response:', data);

            return {
              options: (
                data?.data?.items.map((user: any) => ({
                  value: user.id,
                  label: user.userName,
                  role: user.role,
                  roleId: user.roleId
                })) || []
              ).filter((user: any) => user.roleId === 1),
              hasMore: false
            };
          } catch (error) {
            console.error('Error fetching users:', error);
            return { options: [], hasMore: false };
          }
        } else {
          return loadUsersOptions(search, loadedOptions, { page });
        }
      },
      [userRole, companySelectedNum, loadUsersOptions]
    );

    // Memoized userLoadOptions
    const userLoadOptions = useCallback(
      (search: string, loadedOptions: any[], additional: { page: number }) => {
        return userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
          ? customLoadUsersOptions(search, loadedOptions, additional)
          : loadUsersOptions(search, loadedOptions, additional);
      },
      [userRole, customLoadUsersOptions, loadUsersOptions]
    );

    // Fetch filteredUsers only once on mount or when userRole changes
    useEffect(() => {
      const fetchAndLogUsers = async () => {
        try {
          const result = await userLoadOptions('', [], { page: 1 });
          console.log('Initial users list fetched on mount:', result.options);
          setFilteredUsers(result.options || []);
        } catch (error) {
          console.error('Error fetching initial users list:', error);
        }
      };
      fetchAndLogUsers();
    }, [userLoadOptions]);

    // console.log('filtered users ', filteredUsers);
    // console.log('question is', question);

    const [isDownloading, setIsDownloading] = useState(false);

    // Added handleView function to call the backend API with key, year, and questionId
    const handleView = async () => {
      try {
        const greenFiTokenStr = sessionStorage.getItem('greenFiToken') || localStorage.getItem('greenFiToken');
        const token = greenFiTokenStr ? JSON.parse(greenFiTokenStr).accessToken : null;
        let fileKey = question?.answer?.flatMap(ans =>
          (ans.files || []).map(file => ({
            key: file.key,
            name: file.name
          }))
        );
        if (fileKey) {
          fileKey = fileKey[0];
        }

        const baseUrl = import.meta.env.VITE_GREENFI_API;
        const queryParams = new URLSearchParams({
          key: fileKey?.key,
          year: '2024'
        });

        // 1. Open a blank tab first — avoids browser popup blocking
        const newTab = window.open('', '_blank');
        if (newTab) {
          newTab.document.write(
            '<html><body><p style="font-size:20px;text-align:center;margin-top:20%;">Preparing the Attachment Please wait...</p></body></html>'
          );
        }

        const response = await axios.get(
          `${baseUrl}/v2/questionnaire/submission/${question?.last_submission_id}?${queryParams.toString()}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined
            }
          }
        );

        if (response.data.code !== 200) {
          throw new Error(response.data.message || 'Failed to fetch signed URL');
        }

        const { url } = response.data.data;
        // 2. Redirect opened tab to the file URL
        if (newTab && url) {
          newTab.location.href = url;
        }

        console.log('url');

        window.open(url, '_blank');
      } catch (error) {
        console.error('Error downloading file:', error);
        toast({
          title: 'Error',
          description: 'Failed to download file. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
    };

    const handleDownloadAttachment = async () => {
      setIsDownloading(true);
      try {
        const greenFiTokenStr = sessionStorage.getItem('greenFiToken') || localStorage.getItem('greenFiToken');
        const token = greenFiTokenStr ? JSON.parse(greenFiTokenStr).accessToken : null;
        let fileKey = question?.answer?.flatMap(ans =>
          (ans.files || []).map(file => ({
            key: file.key,
            name: file.name
          }))
        );
        if (fileKey) {
          fileKey = fileKey[0];
        }

        const baseUrl = import.meta.env.VITE_GREENFI_API;
        const queryParams = new URLSearchParams({
          key: fileKey?.key,
          year: '2024'
        });

        const response = await axios.get(
          `${baseUrl}/v2/questionnaire/submission/${question?.last_submission_id}?${queryParams.toString()}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined
            }
          }
        );

        if (response.data.code !== 200) {
          throw new Error(response.data.message || 'Failed to fetch signed URL');
        }

        if (response.data.code !== 200) {
          throw new Error(response.data.message || 'Failed to fetch signed URL');
        }

        const { url } = response.data.data;
        console.log('url is', url);
        // // 2. Trigger the download
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = fileKey.name;  // Assign the downloaded file's name
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
        const response1 = url && (await fetch(url));
        if (response1) {
          console.log('response 1 initiated');
          const blob = await response1.blob();
          const downloadUrl = window?.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = fileKey?.name || 'download';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
        }
      } catch (error) {
        console.error('Error downloading file:', error);
        toast({
          title: 'Error',
          description: 'Failed to download file. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } finally {
        setIsDownloading(false); // stop loading in both success and error
      }
    };

    const renderAnswerType = () => {
      const props = {
        title,
        question: !!question,
        mode,
        index: ++index,
        displayIndex: displayIndex,
        isDisabledOnEditMode,
        isDisabledOnViewMode,
        isRequired: !!question?.isRequired || !!question?.is_required,
        hasAttachment: !!question?.hasAttachment || !!question?.has_attachment,
        hasRemarks: !!question?.hasRemarks || !!question?.has_remarks,
        remarks: question?.remarks,
        onDelete: () => onDelete?.(question?.id)
      };
      // console.log('filteredUsers before passing to TextBox:', filteredUsers);
      const files =
        question?.answer?.flatMap(ans =>
          (ans.files || []).map(file => ({
            key: file.key,
            name: file.name
          }))
        ) || [];

      const dwonloadUrl = async () => {
        try {
          const response = files?.url && (await fetch(files.url));

          if (response) {
            const blob = await response.blob();
            const downloadUrl = window?.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = files?.name || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
          }
        } catch (error) {
          console.error('Error downloading file:', error);
        }
      };

      // Logic for user-admin
      const handleAdminUserSelect = (users: ISelect[]) => {
        console.log('handleAdminUserSelect called with:', users);
        setAdminSelectedUsers(users || []);
      };

      const handleAdminAssignUsers = () => {
        if (question) {
          const userIds = adminSelectedUsers.map(user => user.value);
          console.log('Assigning userIds for user-admin:', userIds);
          assignUsers(userIds, year); // Pass year
        }
      };

      // Logic for other roles (unchanged)
      const handleUserSelect = (users: ISelect[]) => {
        console.log('handleUserSelect called with:', users);
        setSelectedUsers(users || []);
      };

      const handleAssignUsers = () => {
        if (question) {
          const userIds = selectedUsers.map(user => user.value);
          console.log('Assigning userIds for non-user-admin:', userIds);
          assignUsers(userIds, year); // Pass year
        }
      };

      // Unassign handlers
      const handleUnassignUser = (userId: string) => {
        if (question) {
          unassignUsers([userId]);
        }
      };

      const categorySelector = (
        <HStack mb={4} alignItems="center">
          <FormControl w="auto" variant="floating">
            <InputGroup zIndex={6} w="auto">
              <AsyncPaginate
                placeholder=""
                debounceTimeout={800}
                loadOptions={inputValue =>
                  Promise.resolve({
                    options: categories
                      .filter(cat => cat.name.toLowerCase().includes(inputValue.toLowerCase()))
                      .map(cat => ({
                        value: cat.id,
                        label: cat.name
                      })),
                    hasMore: false
                  })
                }
                styles={{
                  ...customStyles,
                  clearIndicator: () => ({
                    display: 'none'
                  }),
                  multiValue: () => ({
                    display: 'none'
                  })
                }}
                components={{
                  Placeholder,
                  ValueContainer: CustomValueContainer,
                  Option: CategoryOption,
                  IndicatorSeparator: () => null
                }}
                onChange={selectedOption => {
                  if (selectedOption) {
                    setUpdatingCategory(true);
                    handleCategoryChange(selectedOption.value).finally(() => setUpdatingCategory(false));
                  }
                }}
                value={
                  selectedCategory
                    ? {
                      value: selectedCategory.id,
                      label: selectedCategory.name
                    }
                    : null
                }
                menuPosition="absolute" // Change this from "fixed" to "absolute"
                maxMenuHeight={180}
                closeMenuOnSelect={true}
                closeMenuOnScroll={false}
                isClearable={false}
                isMulti={false}
                isLoading={updatingCategory}
                isDisabled={!userRole === USER_ROLE.ADMIN || updatingCategory}
              />
              <Input placeholder="Category" value={selectedCategory?.name || ''} hidden />
              <FormLabel>{userRole === USER_ROLE.ADMIN ? 'Category' : ''}</FormLabel>
            </InputGroup>
          </FormControl>
        </HStack>
      );

      const renderActionButtons = () => {
        if (isViewMode) {
          return (
            <HStack borderRadius={'5px'} gap="10px" ml="auto" justifyContent={'end'} mr="20px" pb={'20px'}>
              {question.hasAnswer && (
                <IconButton
                  background="#FFF1F0"
                  borderRadius="4px"
                  variant={'outline'}
                  border="1px solid #F5222D"
                  aria-label="delete-question"
                  color="#F5222D"
                  onClick={() => handleDelete(question?.id, true)}
                  isLoading={isLoading}
                  _hover={{ opacity: 0.8 }}
                  icon={<MdDeleteOutline />}
                />
              )}

              {!question?.isNotQuestion && !isViewPage && (
                <HStack>
                  {isEditMode ? (
                    <HStack>
                      <Button
                        onClick={() => {
                          console.log('Here 123x onSubmit', onSubmit);
                          handleSubmit(onSubmit)();
                        }}
                        ml="auto"
                        fontSize={'0.9em'}
                        fontWeight={700}
                        w="auto"
                        h="44px"
                        bg="#137E59"
                        _hover={{ opacity: 0.8 }}
                        isLoading={_isQuestionUpdating || _isAnswerUpdating}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditMode(false);
                        }}
                        ml="auto"
                        fontSize={'0.9em'}
                        fontWeight={700}
                        w="auto"
                        h="44px"
                        bg="#137E59"
                        _hover={{ opacity: 0.8 }}
                      >
                        Cancel
                      </Button>
                    </HStack>
                  ) : (
                    <Button
                      onClick={() => {
                        setIsEditMode(true);
                      }}
                      ml="auto"
                      fontSize={'0.9em'}
                      fontWeight={700}
                      w="auto"
                      h="44px"
                      bg="#137E59"
                      leftIcon={<Icon as={IoMdAddCircleOutline} fontSize={'20px'} />}
                      _hover={{ opacity: 0.8 }}
                    >
                      Edit
                    </Button>
                  )}
                </HStack>
              )}
            </HStack>
          );
        }
        return null;
      };

      const contentComponent = (() => {
        const fileKey =
          question?.answer?.flatMap(ans =>
            (ans.files || []).map(file => ({
              key: file.key,
              name: file.name
            }))
          ) || [];
        switch (selectedType?.value) {
          case 'textBox':
            return (
              <>
                <TextBox
                  {...props}
                  files={files}
                  isViewPage={isViewPage}
                  question={!!question}
                  questions={question}
                  parentQuestion={parentQuestion}
                  companySelectedNum={companySelectedNum}
                  downloadUrl={handleDownloadAttachment}
                  answer={watch('content')}
                  remarks={watch('remarks')}
                  hasRemarks={question?.hasRemarks}
                  errors={errors}
                  isQuestionEditMode={isEditMode}
                  selectedUsers={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? adminSelectedUsers
                      : selectedUsers
                  }
                  onUserSelect={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? handleAdminUserSelect
                      : handleUserSelect
                  }
                  isAssigning={isAssigning}
                  onAssign={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? handleAdminAssignUsers
                      : handleAssignUsers
                  }
                  onUnassignUser={handleUnassignUser}
                  loadUsersOptions={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? undefined
                      : loadUsersOptions
                  }
                  adminUsers={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? filteredUsers
                      : undefined
                  }
                />
                {/* Add file upload section when has_attachment is true */}
                {!isViewPage && question?.hasAttachment ? (
                  <AttachmentButtons
                    files={files}
                    handleView={handleView}
                    handleDownloadAttachment={handleDownloadAttachment}
                    isDownloading={isDownloading}
                    isAnswerMode={isAnswerMode}
                  />
                ) : null}
                {renderActionButtons()}
              </>
            );
          case 'checkbox':
            return (
              <>
                <CheckboxOptions
                  {...props}
                  files={files}
                  isViewPage={isViewPage}
                  question={!!question}
                  questions={question}
                  companySelectedNum={companySelectedNum}
                  dwonloadUrl={handleDownloadAttachment}
                  answer={watch('content')}
                  remarks={watch('remarks')}
                  hasRemarks={question?.hasRemarks}
                  errors={errors}
                  isQuestionEditMode={isEditMode}
                  selectedUsers={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? adminSelectedUsers
                      : selectedUsers
                  }
                  onUserSelect={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? handleAdminUserSelect
                      : handleUserSelect
                  }
                  isAssigning={isAssigning}
                  onAssign={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? handleAdminAssignUsers
                      : handleAssignUsers
                  }
                  onUnassignUser={handleUnassignUser}
                  loadUsersOptions={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? undefined
                      : loadUsersOptions
                  }
                  adminUsers={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? filteredUsers
                      : undefined
                  }
                />
                {/* Add file upload section when has_attachment is true */}
                {question?.hasAttachment ? (
                  <AttachmentButtons
                    files={files}
                    handleView={handleView}
                    handleDownloadAttachment={handleDownloadAttachment}
                    isDownloading={isDownloading}
                    isAnswerMode={isAnswerMode}
                  />
                ) : null}
                {renderActionButtons()}
              </>
            );
          case 'radio':
            return (
              <>
                <RadioOptions
                  {...props}
                  files={files}
                  isViewPage={isViewPage}
                  question={!!question}
                  questions={question}
                  questionContent={JSON.parse(question?.questionContent || '{}')?.radioOptions || []}
                  dwonloadUrl={handleDownloadAttachment}
                  answer={watch('content')}
                  remarks={watch('remarks')}
                  hasRemarks={question?.hasRemarks}
                  errors={errors}
                  isQuestionEditMode={isEditMode}
                  selectedUsers={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? adminSelectedUsers
                      : selectedUsers
                  }
                  onUserSelect={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? handleAdminUserSelect
                      : handleUserSelect
                  }
                  isAssigning={isAssigning}
                  onAssign={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? handleAdminAssignUsers
                      : handleAssignUsers
                  }
                  onUnassignUser={handleUnassignUser}
                  loadUsersOptions={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? undefined
                      : loadUsersOptions
                  }
                  adminUsers={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? filteredUsers
                      : undefined
                  }
                />
                {/* Add file upload section when has_attachment is true */}
                {question?.hasAttachment ? (
                  <AttachmentButtons
                    files={files}
                    handleView={handleView}
                    handleDownloadAttachment={handleDownloadAttachment}
                    isDownloading={isDownloading}
                    isAnswerMode={isAnswerMode}
                  />
                ) : null}
                {renderActionButtons()}
              </>
            );
          case 'dropDown':
            return (
              <>
                <DropDownOptions
                  {...props}
                  files={files}
                  isViewPage={isViewPage}
                  question={!!question}
                  questions={question}
                  parentQuestion={parentQuestion}
                  companySelectedNum={companySelectedNum}
                  dwonloadUrl={handleDownloadAttachment}
                  answer={watch('content')}
                  remarks={watch('remarks')}
                  hasRemarks={question?.hasRemarks}
                  errors={errors}
                  isQuestionEditMode={isEditMode}
                  selectedUsers={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? adminSelectedUsers
                      : selectedUsers
                  }
                  onUserSelect={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? handleAdminUserSelect
                      : handleUserSelect
                  }
                  isAssigning={isAssigning}
                  onAssign={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? handleAdminAssignUsers
                      : handleAssignUsers
                  }
                  onUnassignUser={handleUnassignUser}
                  loadUsersOptions={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? undefined
                      : loadUsersOptions
                  }
                  adminUsers={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? filteredUsers
                      : undefined
                  }
                />
                {/* Add file upload section when has_attachment is true */}
                {question?.hasAttachment ? (
                  <AttachmentButtons
                    files={files}
                    handleView={handleView}
                    handleDownloadAttachment={handleDownloadAttachment}
                    isDownloading={isDownloading}
                    isAnswerMode={isAnswerMode}
                  />
                ) : null}
                {renderActionButtons()}
              </>
            );
          case 'compare':
            return (
              <>
                <CompareOptions files={files} dwonloadUrl={dwonloadUrl} {...props} errors={errors} />
                {renderActionButtons()}
              </>
            );
          case 'table':
            return (
              <>
                <QuestionDisplay
                  {...props}
                  title={title || question?.title || 'Table Question'}
                  isViewPage={isViewPage}
                  files={files}
                  dwonloadUrl={handleDownloadAttachment}
                  handleView={handleView}
                  parentQuestion={parentQuestion}
                  questionData={question}
                  isQuestionEditMode={isEditMode}
                  questions={question}
                  selectedUsers={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? adminSelectedUsers
                      : selectedUsers
                  }
                  onUserSelect={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? handleAdminUserSelect
                      : handleUserSelect
                  }
                  isAssigning={isAssigning}
                  onAssign={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? handleAdminAssignUsers
                      : handleAssignUsers
                  }
                  onUnassignUser={handleUnassignUser}
                  loadUsersOptions={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? undefined
                      : loadUsersOptions
                  }
                  adminUsers={
                    userRole === 'user-admin' || userRole === 'admin' || userRole === 'manager'
                      ? filteredUsers
                      : undefined
                  }
                >
                  <FormTableBuilder
                    name="tableOptions"
                    hideConfiguration={isAnswerMode || isViewMode}
                    onTableStructureChange={structure => {
                      // console.log('Table structure changed:', structure);
                      // You can handle the table structure here
                      // For example, save it to a state or pass it to a parent component
                    }}
                    allowEmptyCellEditing={false}
                  />
                </QuestionDisplay>
                {/* Add file upload section when has_attachment is true */}
                {!isViewPage && question?.hasAttachment ? (
                  <AttachmentButtons
                    files={files}
                    handleView={handleView}
                    handleDownloadAttachment={handleDownloadAttachment}
                    isDownloading={isDownloading}
                    isAnswerMode={isAnswerMode}
                  />
                ) : null}
                {renderActionButtons()}
              </>
            );
          default:
            return null;
        }
      })();

      return (
        <VStack align="stretch" spacing={4} width="100%">
          <HStack justifyContent="space-between">
            {!isViewPage && categories.length > 0 && categorySelector}
            {!isViewPage && <Badge mb={4} colorScheme={getStatusColor(adjustedStatus)} fontSize="sm" px={2} py={1} borderRadius="full">
              {adjustedStatus?.charAt(0).toUpperCase() + adjustedStatus?.slice(1)?.toLowerCase()}
            </Badge>}
          </HStack>
          {contentComponent}
        </VStack>
      );
    };

    useEffect(() => {
      register(FieldNames.Type);
      register(FieldNames.Department);
      register(FieldNames.Scope);
      register(FieldNames.Institution);
      register(FieldNames.Framework);
      register(FieldNames.Industry);
      register('category');
      register('tableOptions');
    }, [register]);

    const onSubmit = (data: QuestionFormSubmit) => {
      console.log('onsubmit initiated');
      console.log('Here 123x', mode, isViewMode, question);
      if (mode === 'answer') {
        const contentObj: any = {};
        if (data.checkboxOptions && data.type === 'checkbox') {
          contentObj.checkboxOptions = data.checkboxOptions;
        }
        if (data.radioOptions && data.type === 'radio') {
          contentObj.radioOptions = data.radioOptions;
        }
        if (data.dropDownOptions && data.type === 'dropDown') {
          contentObj.dropDownOptions = data.dropDownOptions;
          console.log('DropDown contentObj:', contentObj); // Log contentObj
        }
        if (data.compare && data.type === 'compare') {
          contentObj.compare = data.compare;
        }
        if (data.tableOptions && data.type === 'table') {
          contentObj.tableOptions = data.tableOptions;
        }

        const formattedData = {
          id: question?.id,
          title: data.title,
          type: data.type,
          departments: data.department,
          scope: Number(data.scope),
          institutions: data.institution,
          frameworks: data.framework,
          industries: data.industry,
          question_bank_id: qbankId,
          is_required: data.is_required || false,
          has_attachment: data.has_attachment || false,
          has_remarks: data.has_remarks || false,
          answer: data.answer,
          files: data?.files,
          content: data.type === 'textBox' ? data.content : JSON.stringify(contentObj),
          remarks: data.remarks,
          parentId: question.parentId,
          category: data.category
        };
        onFormSubmit && onFormSubmit(formattedData, question?.id);
      } else if (isViewMode) {
        const contentObj: any = {};
        const contentAnswer = question?.content ? JSON.parse(question.content) : {};
        if (data.checkboxOptions && data.type === 'checkbox') {
          contentObj.checkboxOptions = data.checkboxOptions;
        }
        if (data.radioOptions && data.type === 'radio') {
          contentObj.radioOptions = data.radioOptions;
        }
        if (data.dropDownOptions && data.type === 'dropDown') {
          console.log('contentAnswer inside dropdown', contentAnswer);
          console.log('data.dropDownOptions inside dropdown', data);
          contentObj.dropDownOptions = contentAnswer.dropDownOptions
            ? contentAnswer.dropDownOptions
            : data.dropDownOptions;
          contentObj.answer = data.answer;
          console.log('DropDown contentObj 123x:', contentObj);
          // contentObj.dropDownOptions = contentObj.dropDownOptions.map(obj => {
          //   return {
          //     text: obj.value,
          //   }
          // });
          // Log contentObj
        }
        if (data.compare && data.type === 'compare') {
          contentObj.compare = data.compare;
        }
        if (data.tableOptions && data.type === 'table') {
          contentObj.tableOptions = data.tableOptions;
        }
        if (data.content && data.type === 'textBox') {
          contentObj.content = data.content;
        }
        if (data.remarks) {
          contentObj.remarks = data.remarks;
        }
        // Parse existing question.content to get submitter userIds
        const existingContent = question?.content ? JSON.parse(question.content) : [];
        // Get user IDs for companySelectedNum from filteredUsers
        const companyUserIds = filteredUsers.map(user => user.value);
        // Filter answers to only include those from users in companySelectedNum
        const matchingAnswers = Array.isArray(existingContent)
          ? existingContent
            .filter(answer => companyUserIds.includes(answer.user_id))
            .map(answer => ({
              user_id: answer.user_id,
              answer: answer.answer,
              timestamp: answer.timestamp,
              remarks: answer.remarks
            }))
          : [];
        // Add console log to inspect the answer being updated, including matching userIds
        console.log('123y Updating answer for question:', {
          questionId: question?.id,
          questionType: data.type,
          newContent: contentObj, // New answer being submitted
          questionBankId: qbankId,
          isFromSubmission: false,
          companySelectedNum, // For reference
          matchingSubmitterUserIds: matchingAnswers, // Only userIds matching companySelectedNum users
          contentAnswer,
          content: JSON.stringify(contentObj) || contentAnswer
        });

        updateAnswer({
          question_bank_id: qbankId,
          content: JSON.stringify(contentObj),
          // originalUserId: matchingAnswers[0].user_id,
          originalUserId: matchingAnswers[0]?.user_id ?? userId,
          isAdminEdit: true,
          companyId: companySelectedNum,
          is_from_submission: false
        });
      } else if (question) {
        console.log('data from upload is', data);
        updateQuestion(data);
      } else {
        const contentObj: any = {};
        if (data.checkboxOptions && data.type === 'checkbox') {
          contentObj.checkboxOptions = data.checkboxOptions;
        }
        if (data.radioOptions && data.type === 'radio') {
          contentObj.radioOptions = data.radioOptions;
        }
        if (data.dropDownOptions && data.type === 'dropDown') {
          console.log('data from dropdown in onsubmit is', data);
          contentObj.dropDownOptions = data.dropDownOptions;
        }
        if (data.compare && data.type === 'compare') {
          contentObj.compare = data.compare;
        }
        if (data.tableOptions && data.type === 'table') {
          contentObj.tableOptions = data.tableOptions;
        }

        const formattedData = {
          title: data.title,
          type: data.type,
          departments: data.department,
          scope: Number(data.scope),
          institutions: data.institution,
          frameworks: data.framework,
          industries: data.industry,
          question_bank_id: qbankId,
          is_required: data.is_required || false,
          has_attachment: data.has_attachment || false,
          has_remarks: data.has_remarks || false,
          content: JSON.stringify(contentObj),
          category: data.category
        };
        onFormSubmit && onFormSubmit(formattedData, index);
      }
    };

    useImperativeHandle(ref, () => ({
      submit: () => {
        return new Promise((resolve, reject) => {
          handleSubmit(onSubmit, errors => {
            console.error('Form validation errors:', errors); // Log validation errors
            reject(errors);
          })()
            .then(resolve)
            .catch(error => {
              console.error('Submission error in onSubmit:', error); // Log submission errors
              reject(error);
            });
        });
      },
      errors: methods.formState.errors
    }));

    return (
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack
            spacing={4}
            h="auto"
            mt="17px"
            bgColor={question && 'white'}
            border={question && '1px solid #DEDEDE'}
            w={isAnswerMode && isSubQuestion ? '90%' : 'auto'}
            float={isAnswerMode && isSubQuestion ? 'right' : undefined}
            p={question ? 4 : 0}
          >
            <Box mt={question ? '' : '18px'} w="100%">
              {renderAnswerType()}
            </Box>
          </VStack>
        </form>
      </FormProvider>
    );
  }
);

QuestionForm.displayName = 'QuestionForm';

export default QuestionForm;
