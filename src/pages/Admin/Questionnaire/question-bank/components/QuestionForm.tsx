//@ts-nocheck
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { MdDeleteOutline } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import Select, { SingleValue } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Text,
  VStack
} from '@chakra-ui/react';

import { customDraftInputStyles, customStyles, InputOption, Placeholder } from '@/components/common/InputOption';
import { CustomValueContainer } from '@/components/common/SortableHeader';
import FormTableBuilder from '@/components/DynamicTableBuilder/FormTableBuilder';
import { FieldNames, QUESTION_FORM_PAGE_TYPE } from '@/constants';
import { answerTypes } from '@/constants/mock';
import { useAttributes } from '@/context/AtrributesContext';
import useDeleteQuestions from '@/hooks/useDeleteQuestions';
import { ApiType } from '@/hooks/useLoadOptions';
import useQuestionSchema from '@/hooks/useQuestionSchema';
import useSearchAndSelect from '@/hooks/useSearchAndSelect';
import useUpdateQuestion from '@/hooks/useUpdateQuestion';
import { scopeApi } from '@/store/api/scope/scopeApi';
import { ISelect } from '@/types/common';
import { Question } from '@/types/question';
import { yupResolver } from '@hookform/resolvers/yup';

import AddSubQuestionModal from './AddSubQuestionModal';
import CheckboxOptions from './question-types/CheckboxOptions';
import CompareOptions from './question-types/CompareOptions';
import DropDownOptions from './question-types/DropDownOptions';
import RadioOptions from './question-types/RadioOptions';
import TextBox from './question-types/TextBox';
import VersionHistory from './VersionHistory';

export type QuestionFormSubmit = {
  is_required?: boolean,
  has_attachment?: boolean,
  has_remarks?: boolean,
  type: string,
  title: string,
  department: string | string[],
  users: string | string[],
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
  compare?:
    | {
        compareLeft: number,
        comparisonType: string,
        compareRight: number
      }
    | undefined,
  tableOptions?: any,
  is_not_question?: boolean,
  theme?: { value: string, label: string }
};

type QuestionFormProps = {
  question?: Question,
  mode?: string,
  index?: number,
  parentQuestion?: any,
  displayIndex?: string | number,
  isSubQuestion?: boolean,
  onFormSubmit?: (formData: any, index: number) => void,
  onDelete?: () => void,
  hasAiAnswerSuggestion?: boolean,
  pageType: string
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
  children
}) => {
  const isAnswerMode = mode === 'answer' || mode === 'view';

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
            <Box display={'flex'} flexDirection="column" alignItems={'space-between'}>
              <Text w="100%" p="10px">
                {parentQuestion}
              </Text>
              <Text w="100%" p={isAnswerMode ? '20px' : ''}>
                {displayIndex ? `${displayIndex}. ` : ''}
                {title}
                {!questionData?.isNotQuestion && isRequired ? <span style={{ color: 'red' }}> *</span> : null}
              </Text>
              {!questionData?.isNotQuestion && files?.url ? (
                <Box display="flex" gap={4} alignItems="center">
                  <Button onClick={dwonloadUrl} mr={'10px'} px={'20px'}>
                    Download Attachment
                  </Button>
                  <Button onClick={handleView} mr={'10px'} px={'20px'}>
                    View Attachment
                  </Button>
                </Box>
              ) : null}
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

function convertOldTableOptionsToStructure(oldOptions) {
  if (!oldOptions || typeof oldOptions !== 'object') return undefined;
  // If already in new format, return as is
  if (
    'id' in oldOptions &&
    'columns' in oldOptions &&
    'cells' in oldOptions &&
    'rows' in oldOptions &&
    'cols' in oldOptions
  ) {
    return oldOptions;
  }
  // Old format: { headers: [], rows: [{ cols: [] }] }
  const headers = Array.isArray(oldOptions.headers) ? oldOptions.headers : [];
  const rows = Array.isArray(oldOptions.rows) ? oldOptions.rows : [];
  const numRows = rows.length || 3;
  const numCols = headers.length || rows[0]?.cols?.length || 3;
  // Build columns
  const columns = headers.map((header, idx) => ({
    id: `col-${idx}`,
    header: header || `Column ${idx + 1}`,
    width: 150,
    type: 'text',
    isHeader: true,
    isRequired: false
  }));
  // Build cells
  const cells = [];
  for (let row = 0; row < numRows; row++) {
    const rowData = rows[row]?.cols || [];
    for (let col = 0; col < numCols; col++) {
      cells.push({
        id: `${row}-${col}`,
        rowIndex: row,
        colIndex: col,
        rowSpan: 1,
        colSpan: 1,
        content: rowData[col] || '',
        isHeader: row === 0, // Optionally, only first row is header
        isQuestion: false
      });
    }
  }
  return {
    id: '1',
    name: 'Table',
    description: '',
    columns,
    cells,
    rows: numRows,
    cols: numCols
  };
}

const QuestionForm = forwardRef(
  (
    {
      question,
      mode,
      onFormSubmit,
      index,
      displayIndex,
      parentQuestion,
      isSubQuestion,
      onDelete,
      hasAiAnswerSuggestion,
      pageType
    }: QuestionFormProps,
    ref
  ) => {
    const { qbankId } = useParams();
    const [selectedType, setSelectedType] = useState<null | ISelect>(null);
    const schema = useQuestionSchema(selectedType, mode, !!question?.isRequired, question?.hasAttachement);
    const [isEditMode, setIsEditMode] = useState(false);
    const isDisabledOnEditMode = mode === 'edit' && !isEditMode;
    const { handleDelete, isLoading: isQuestionDeleting } = useDeleteQuestions();
    const isAnswerMode = mode === 'answer' || mode === 'view';
    const isViewMode = mode === 'view';
    const { loadOptions } = useAttributes();
    const { loadOptions: loadInstitutionOptions } = loadOptions(ApiType.Institution);
    const { loadOptions: loadIndustryOptions } = loadOptions(ApiType.Industry);
    const { loadOptions: loadDepartmentOptions } = loadOptions(ApiType.Department);
    const { loadOptions: loadUsersOptions } = loadOptions(ApiType.Users);
    const { loadOptions: loadScopeOptions } = loadOptions(ApiType.Scope);
    const { data: scopes } = scopeApi.useGetAllScopesQuery({});
    // console.log('QuestionForm rendering');
    type Scopes = {
      id: number,
      name: string
    };

    const scopeOptions =
      scopes?.data?.results.map((unit: Scopes) => ({
        label: unit.name,
        value: unit.id
      })) || [];

    const themeOptions = [
      { value: 'Environmental', label: 'Environmental' },
      { value: 'Social', label: 'Social' },
      { value: 'Governance', label: 'Governance' }
    ];

    const methods = useForm<QuestionFormSubmit>({
      //@ts-ignore
      resolver: yupResolver(schema),
      mode: 'onChange',
      defaultValues: {
        title: '',
        scope: undefined,
        checkboxOptions: [{ text: '' }],
        radioOptions: [{ text: '' }],
        dropDownOptions: [{ text: '' }],
        compare: { compareLeft: 0, comparisonType: '', compareRight: 0 },
        tableOptions: {
          id: '1',
          name: 'New Table',
          description: '',
          columns: [],
          cells: [],
          rows: 3,
          cols: 3
        },
        files: [],
        content: '',
        remarks: '',
        theme: undefined
      }
    });

    const {
      control,
      handleSubmit,
      watch,
      register,
      setValue,
      formState: { errors }
    } = methods;

    const { updateQuestion, isUpdating } = useUpdateQuestion({ questionId: question?.id, qbankId, setIsEditMode });

    const {
      institution,
      industry,
      department,
      scope,
      users,
      handleInstitutionChange,
      handleFrameworkChange,
      handleIndustryChange,
      handleDepartmentChange,
      handleScopeChange,
      handleUsersChange
    } = useSearchAndSelect({ setValue });

    const isValidJSON = content => {
      try {
        JSON.parse(content);
        return true;
      } catch (e) {
        return false;
      }
    };

    useEffect(() => {
      if (question?.isNotQuestion) {
        setValue('is_not_question', Boolean(question?.isNotQuestion));
      }
    }, [question?.isNotQuestion]);

    useEffect(() => {
      if (question) {
        const contentObj =
          question.type !== 'table'
            ? question.content && question.type !== 'textBox' && isValidJSON(question.content)
              ? JSON.parse(question.content)
              : question.type === 'textBox' && question.content
                ? question.content
                : {}
            : JSON.parse(
                pageType === QUESTION_FORM_PAGE_TYPE.QUESTION_BANK_EDIT ? question.questionContent : question.content
              )?.tableOptions;

        console.log('contentObj 123', contentObj);
        setValue('title', question.title);
        setValue('type', question.type);
        setValue('is_required', !!question.isRequired);
        setValue('has_attachment', !!question.hasAttachment);
        setValue('has_remarks', !!question.hasRemarks);

        if (question?.departments) {
          const departmentValues = question?.departments?.map(i => ({ value: i.id, label: i.name })) || [];
          setValue('department', departmentValues);
          handleDepartmentChange(departmentValues);
        }

        if (question?.users) {
          const usersValues = question?.users?.map(i => ({ value: i.id, label: i.name })) || [];
          setValue('users', usersValues);
          handleUsersChange(usersValues);
        }

        if (question?.scope) {
          setValue('scope', Number(question.scope));
        }

        const selectedTypeOption = answerTypes.find(type => type.value === question.type);
        setSelectedType(selectedTypeOption || null);

        if (question.type === 'checkbox' && contentObj.checkboxOptions) {
          setValue('checkboxOptions', contentObj.checkboxOptions);
        }
        if (question.type === 'radio' && contentObj.radioOptions) {
          setValue('radioOptions', contentObj.radioOptions);
        }
        if (question.type === 'dropDown' && contentObj.dropDownOptions) {
          setValue('dropDownOptions', contentObj.dropDownOptions);
        }
        if (question.type === 'compare' && contentObj.compare) {
          setValue('compare', contentObj.compare);
        }

        if (question.type === 'table' && contentObj) {
          setValue('tableOptions', contentObj);
        }

        if (question.institutions) {
          const institutionValues = question?.institutions?.map(i => ({ value: i.id, label: i.name })) || [];
          setValue('institution', institutionValues);
          handleInstitutionChange(institutionValues);
        }
        if (question.frameworks) {
          const frameworkValues = question?.frameworks?.map(f => ({ value: f.id, label: f.name }));
          setValue('framework', frameworkValues);
          handleFrameworkChange(frameworkValues);
        }
        if (question.industries) {
          const industryValues = question?.industries?.map(ind => ({ value: ind.id, label: ind.name }));
          setValue('industry', industryValues);
          handleIndustryChange(industryValues);
        }
        if (question?.theme) {
          setValue('theme', { value: question.theme, label: question.theme });
        }
      }
    }, [question, setValue]);

    const title = watch('title');
    const isTitleOnly = watch('is_not_question');
    // const scope = watch('scope');

    const handleSelectChange = (name: FieldNames, selectedOption: SingleValue<ISelect>) => {
      setValue(name, selectedOption ? selectedOption?.value?.toString() : '', { shouldValidate: true });
      if (name === FieldNames.Type) {
        setSelectedType(selectedOption || null);
      }
    };

    const renderAnswerType = () => {
      //@ts-ignore
      const props = {
        title,
        question: !!question,
        mode,
        index: ++index,
        displayIndex: displayIndex,
        isDisabledOnEditMode,
        isRequired: !!question?.isRequired || !!question?.is_required,
        hasAttachment: !!question?.hasAttachment || !!question?.has_attachment,
        hasRemarks: !!question?.hasRemarks || !!question?.has_remarks,
        remarks: question?.remarks,
        ai_suggested_answers: question?.ai_suggested_answers || []
      };

      // Calculate radioOptionsData for radio type questions
      const radioOptionsQuestionContent =
        question?.type === 'radio' && question?.questionContent
          ? JSON.parse(question?.questionContent || '{}')?.radioOptions
          : [
              {
                'text': 'radio-1',
                'isChecked': false,
                'remarks': false
              }
            ];

      const dropDownOptionsQuestionContent =
        question?.type === 'dropDown' && question?.questionContent
          ? JSON.parse(question?.questionContent || '{}')?.dropDownOptions
          : [
              {
                'text': 'dropdown-1',
                'isChecked': false,
                'remarks': false
              }
            ];

      const checkboxOptionsQuestionContent =
        question?.type === 'checkbox' && question?.questionContent
          ? JSON.parse(question?.questionContent || '{}')?.checkboxOptions
          : [
              {
                'text': 'checkbox-1',
                'isChecked': false,
                'remarks': false
              }
            ];

      const files = question?.files?.length ? question?.files[0] : [];

      const handleView = async () => {
        try {
          const url = files?.url;
          // 1. Open a blank tab first — avoids browser popup blocking
          const newTab = window.open('', '_blank');
          if (newTab) {
            newTab.document.write(
              '<html><body><p style="font-size:20px;text-align:center;margin-top:20%;">Preparing the Attachment Please wait...</p></body></html>'
            );
          }

          // 2. Redirect opened tab to the file URL
          if (url) {
            newTab.location.href = url;
          }

          console.log('url');
        } catch (error) {
          console.error('Error Viewing file:', error);
          toast({
            title: 'Error',
            description: 'Failed to View file. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        }
      };

      const dwonloadUrl = async () => {
        try {
          console.log('fies.url is', files?.url);
          const response = files?.url && (await fetch(files.url));
          console.log('response is ', response);
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
          console.error(error);
        }
      };

      switch (selectedType?.value) {
        case 'textBox':
          return (
            <TextBox
              {...props}
              files={files}
              dwonloadUrl={dwonloadUrl}
              handleView={handleView}
              parentQuestion={parentQuestion}
              answer={question?.content}
              errors={errors}
              question={!!question}
              questionData={question}
              isQuestionEditMode={isEditMode}
            />
          );
        case 'checkbox':
          return (
            <CheckboxOptions
              questionContent={checkboxOptionsQuestionContent}
              files={files}
              dwonloadUrl={dwonloadUrl}
              handleView={handleView}
              {...props}
              errors={errors}
            />
          );
        case 'radio':
          return (
            <RadioOptions
              files={files}
              dwonloadUrl={dwonloadUrl}
              handleView={handleView}
              {...props}
              errors={errors}
              questionContent={radioOptionsQuestionContent}
            />
          );
        case 'dropDown':
          //@ts-ignore
          return (
            <DropDownOptions
              files={files}
              questionContent={dropDownOptionsQuestionContent}
              dwonloadUrl={dwonloadUrl}
              parentQuestion={parentQuestion}
              handleView={handleView}
              answer={question?.answer}
              {...props}
              errors={errors}
            />
          );
        case 'compare':
          return (
            <CompareOptions
              files={files}
              dwonloadUrl={dwonloadUrl}
              handleView={handleView}
              {...props}
              errors={errors}
            />
          );
        case 'table':
          // console.log('Table case - title:', title, 'question?.title:', question?.title);
          return (
            <QuestionDisplay
              {...props}
              title={title || question?.title || 'Table Question'}
              files={files}
              dwonloadUrl={dwonloadUrl}
              handleView={handleView}
              parentQuestion={parentQuestion}
              questionData={question}
              isQuestionEditMode={isEditMode}
            >
              <FormTableBuilder
                name="tableOptions"
                hideConfiguration={isAnswerMode || isViewMode}
                onTableStructureChange={structure => {
                  // console.log('Table structure changed:', structure);
                  // You can handle the table structure here
                  // For example, save it to a state or pass it to a parent component
                }}
                allowEmptyCellEditing={pageType === QUESTION_FORM_PAGE_TYPE.USER_ANSWER}
              />
            </QuestionDisplay>
          );
        default:
          return null;
      }
    };

    const handleEditClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsEditMode(true);
    };

    const renderActionButtons = () => {
      switch (mode) {
        case 'edit':
          return (
            <HStack borderRadius={'5px'} gap="10px" ml="auto" mr="27px">
              <VersionHistory questionId={question?.id} />
              <IconButton
                background="#FFF1F0"
                borderRadius="4px"
                border="1px solid #F5222D"
                aria-label="delete-question"
                color="#F5222D"
                onClick={() => handleDelete(question.id)}
                isLoading={isQuestionDeleting}
                _hover={{ opacity: 0.8 }}
                icon={<MdDeleteOutline />}
              />
              {!isEditMode ? (
                <HStack>
                  <Button
                    onClick={handleEditClick}
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
                  {/* {!isSubQuestion && <AddSubQuestionModal parentId={question?.id} />} */}
                  <AddSubQuestionModal parentId={question?.id} /> {/* Allowing subquestion to subquestion itself */}
                </HStack>
              ) : (
                <Button
                  type="submit"
                  ml="auto"
                  fontSize={'0.9em'}
                  fontWeight={700}
                  w="auto"
                  h="44px"
                  isLoading={isUpdating}
                  bg="#137E59"
                  _hover={{ opacity: 0.8 }}
                >
                  Save
                </Button>
              )}
            </HStack>
          );
        case 'answer':
        case 'view':
          return null;
        default:
          return null;
      }
    };

    useEffect(() => {
      register(FieldNames.Type);
      register(FieldNames.Department);
      register(FieldNames.Scope);
      register(FieldNames.Institution);
      register(FieldNames.Framework);
      register(FieldNames.Industry);
      register('theme');
      register('tableOptions');
    }, [register]);

    const onSubmit = (data: QuestionFormSubmit) => {
      console.log('data is', data.users);
      console.log('Form data for table:', data.tableOptions, 'type:', data.type);
      console.log('Form errors:', methods.formState.errors);

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
        }
        if (data.compare && data.type === 'compare') {
          contentObj.compare = data.compare;
        }

        if (data.tableOptions && data.type === 'table') {
          console.log('data.tableOptions 1', JSON.stringify(data.tableOptions));
          contentObj.tableOptions = data.tableOptions;
          console.log('Table options being saved:', JSON.stringify(data.tableOptions));
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
          is_not_question: data.is_not_question || false,
          theme: data.theme || '' // <-- Add this line
        };
        console.log('Formatted data for answer mode:', formattedData);
        //@ts-ignore
        onFormSubmit && onFormSubmit(formattedData);
      } else if (question) {
        console.log('Updating existing question with data:', {
          ...data,
          theme: data.theme || '',
          is_not_question: data.is_not_question || false
        });
        updateQuestion({ ...data, theme: data.theme || '', is_not_question: data.is_not_question || false }); // <-- Add theme here
      } else {
        const contentObj: any = {};
        if (data.checkboxOptions && data.type === 'checkbox') {
          contentObj.checkboxOptions = data.checkboxOptions;
        }
        if (data.radioOptions && data.type === 'radio') {
          contentObj.radioOptions = data.radioOptions;
        }
        if (data.dropDownOptions && data.type === 'dropDown') {
          contentObj.dropDownOptions = data.dropDownOptions;
        }
        if (data.compare && data.type === 'compare') {
          contentObj.compare = data.compare;
        }
        if (data.tableOptions && data.type === 'table') {
          console.log('data.tableOptions 2', JSON.stringify(data.tableOptions));
          contentObj.tableOptions = data.tableOptions;
          console.log('Table options being saved (new question):', data.tableOptions);
        }

        const formattedData = {
          title: data.title,
          type: data.type,
          departments: data.department,
          scope: Number(data.scope),
          institutions: data.institution,
          frameworks: data.framework,
          users: data.users,
          industries: data.industry,
          question_bank_id: qbankId,
          is_required: data.is_required || false,
          has_attachment: data.has_attachment || false,
          has_remarks: data.has_remarks || false,
          content: JSON.stringify(contentObj),
          is_not_question: data.is_not_question || false
        };
        console.log('Formatted data for new question:', formattedData);
        //@ts-ignore
        onFormSubmit && onFormSubmit(formattedData, index);
      }
    };

    useImperativeHandle(ref, () => ({
      submit: () => {
        return new Promise((resolve, reject) => {
          handleSubmit(
            data => {
              onSubmit(data);
              resolve(data);
            },
            errors => {
              reject(errors);
            }
          )();
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
          >
            {onDelete && (
              <HStack w="100%" justify="flex-end">
                <IconButton
                  aria-label="delete question"
                  icon={<Icon as={MdDeleteOutline} fontSize="20px" />}
                  variant="ghost"
                  size="sm"
                  background="#FFF1F0"
                  borderRadius="4px"
                  border="1px solid #F5222D"
                  _hover={{ opacity: 0.8 }}
                  color="#F5222D"
                  onClick={onDelete}
                />
              </HStack>
            )}
            {question && !isAnswerMode && (
              <HStack
                w="100%"
                gap="20px"
                flexWrap="wrap"
                bgColor="#FAFAFA"
                minHeight="55px"
                borderBottom="1px solid #DEDEDE"
                ml="20px"
                mt={'20px'}
                pb={'10px'}
              >
                <FormControl variant="floating" w="auto" isInvalid={!!errors?.type}>
                  <InputGroup zIndex={7} w="auto">
                    <Select
                      isDisabled={isDisabledOnEditMode}
                      options={answerTypes}
                      placeholder=""
                      styles={customDraftInputStyles}
                      components={{ Placeholder }}
                      onChange={selectedOption => handleSelectChange(FieldNames.Type, selectedOption)}
                      value={answerTypes.find(option => option.value === watch('type'))}
                    />
                    <Input placeholder=" " value={answerTypes.find(option => option.value === watch('type'))} hidden />
                    <FormLabel>Select answer type</FormLabel>
                    <FormErrorMessage>{errors?.type?.message}</FormErrorMessage>
                  </InputGroup>
                </FormControl>

                <FormControl w="auto" variant="floating" isInvalid={!!selectedType?.value && !!errors?.department}>
                  <InputGroup zIndex={6} w="auto">
                    <AsyncPaginate
                      placeholder=""
                      debounceTimeout={800}
                      isMulti
                      loadOptions={loadDepartmentOptions}
                      styles={customDraftInputStyles}
                      components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                      onChange={handleDepartmentChange}
                      hideSelectedOptions={false}
                      value={department}
                      isDisabled={isDisabledOnEditMode}
                    />
                    <Input placeholder="" value={department} hidden />
                    <FormLabel>Department</FormLabel>
                    <FormErrorMessage>{errors?.department?.message}</FormErrorMessage>
                  </InputGroup>
                </FormControl>

                <Controller
                  name="scope"
                  control={control}
                  styles={customStyles}
                  render={({ field: { onChange, value } }) => (
                    <FormControl w="auto" variant="floating" isInvalid={!!selectedType?.value && !!errors?.scope}>
                      <InputGroup zIndex={6} w="auto">
                        <Select
                          styles={customStyles}
                          options={scopeOptions}
                          value={scopeOptions.find((option: { value: number }) => option.value === value)}
                          onChange={selectedOption => onChange(selectedOption?.value || null)}
                          placeholder=""
                          // menuPosition="fixed"
                          isClearable="true"
                          isDisabled={isDisabledOnEditMode}
                        />
                        <Input placeholder=" " value={value} hidden />
                        <FormLabel>Scope</FormLabel>
                        <FormErrorMessage>{errors?.scope?.message}</FormErrorMessage>
                      </InputGroup>
                    </FormControl>
                  )}
                />

                <FormControl variant="floating" w="auto" isInvalid={!!selectedType?.value && !!errors?.institution}>
                  <InputGroup zIndex={5}>
                    <AsyncPaginate
                      isDisabled={isDisabledOnEditMode}
                      placeholder=""
                      debounceTimeout={800}
                      loadOptions={loadInstitutionOptions}
                      styles={customDraftInputStyles}
                      isMulti
                      hideSelectedOptions={false}
                      components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                      onChange={handleInstitutionChange}
                      value={institution}
                    />
                    <Input placeholder=" " value={institution} hidden />
                    <FormLabel>Standards</FormLabel>
                    <FormErrorMessage>{errors?.institution?.message}</FormErrorMessage>
                  </InputGroup>
                </FormControl>
                <FormControl variant="floating" w="auto" isInvalid={!!selectedType?.value && !!errors?.industry}>
                  <InputGroup zIndex={3}>
                    <AsyncPaginate
                      placeholder=""
                      isDisabled={isDisabledOnEditMode}
                      debounceTimeout={800}
                      isMulti
                      loadOptions={loadIndustryOptions}
                      styles={customDraftInputStyles}
                      hideSelectedOptions={false}
                      components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                      onChange={handleIndustryChange}
                      value={industry}
                    />
                    <Input placeholder=" " value={industry} hidden />
                    <FormLabel>Industry</FormLabel>
                    <FormErrorMessage>{errors?.industry?.message}</FormErrorMessage>
                  </InputGroup>
                </FormControl>

                <FormControl variant="floating" w="auto" isInvalid={!!selectedType?.value && !!errors?.users}>
                  <InputGroup zIndex={'6'} w="auto">
                    <AsyncPaginate
                      placeholder=""
                      debounceTimeout={800}
                      isMulti
                      loadOptions={loadUsersOptions}
                      styles={customStyles}
                      components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                      onChange={handleUsersChange}
                      hideSelectedOptions={false}
                      value={users}
                      // menuPosition="fixed"
                      isDisabled={isDisabledOnEditMode}
                    />
                    <Input placeholder="" value={users} hidden />
                    <FormLabel>User</FormLabel>
                    <FormErrorMessage>{errors?.users?.message}</FormErrorMessage>
                  </InputGroup>
                </FormControl>

                <FormControl w="auto" variant="floating" isInvalid={!!selectedType?.value && !!errors?.theme}>
                  <InputGroup zIndex={6} w="auto">
                    <Select
                      options={themeOptions}
                      placeholder=""
                      styles={customDraftInputStyles}
                      components={{ Placeholder }}
                      onChange={selectedOption => setValue('theme', selectedOption)}
                      value={watch('theme')}
                      isDisabled={isDisabledOnEditMode}
                    />
                    <Input placeholder="" value={watch('theme')?.label || ''} hidden />
                    <FormLabel>Theme</FormLabel>
                    <FormErrorMessage>{errors?.theme?.message}</FormErrorMessage>
                  </InputGroup>
                </FormControl>
              </HStack>
            )}

            {!question && (
              <HStack w="100%" padding={question && '20px'}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <FormControl w="100%" isInvalid={!!errors?.title}>
                      <FormLabel>Question</FormLabel>
                      <Input {...field} placeholder="Enter question" />
                      <FormErrorMessage>{errors?.title?.message}</FormErrorMessage>
                    </FormControl>
                  )}
                />
              </HStack>
            )}
            {!question && (
              <HStack mt="20px" w="100%" justify="start">
                {!question?.isNotQuestion && !isTitleOnly && (
                  <Box mt="auto">
                    <FormControl variant="floating" isInvalid={!!errors?.type}>
                      <InputGroup zIndex={'10'}>
                        <Select
                          options={answerTypes}
                          placeholder=""
                          menuPortalTarget={document.body}
                          styles={{
                            ...customStyles,
                            menuPortal: base => ({ ...base, zIndex: 9999 })
                          }}
                          components={{ Placeholder, ValueContainer: CustomValueContainer }}
                          onChange={selectedOption => handleSelectChange(FieldNames.Type, selectedOption)}
                          value={answerTypes.find(option => option.value === watch('type'))}
                          menuPosition="fixed"
                        />
                        <Input
                          placeholder=" "
                          value={answerTypes.find(option => option.value === watch('type'))}
                          hidden
                        />
                        <FormLabel>Answer type</FormLabel>
                      </InputGroup>
                      <FormErrorMessage>{errors?.type?.message}</FormErrorMessage>
                    </FormControl>
                  </Box>
                )}
                <InputGroup zIndex={'10'} w="auto">
                  <FormControl w="auto" variant="floating" isInvalid={!!selectedType?.value && !!errors?.department}>
                    <AsyncPaginate
                      placeholder=""
                      debounceTimeout={800}
                      isMulti
                      loadOptions={loadDepartmentOptions}
                      menuPortalTarget={document.body}
                      styles={{
                        ...customStyles,
                        menuPortal: base => ({ ...base, zIndex: 9999 })
                      }}
                      components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                      onChange={handleDepartmentChange}
                      hideSelectedOptions={false}
                      value={department}
                      menuPosition="fixed"
                    />
                    <Input placeholder="" value={department} hidden />
                    <FormLabel>Department</FormLabel>
                    <FormErrorMessage>{errors?.department?.message}</FormErrorMessage>
                  </FormControl>
                </InputGroup>
                {/* <InputGroup zIndex={'10'} w="auto">
                  <FormControl w="auto" variant="floating" isInvalid={!!selectedType?.value && !!errors?.users}>
                    <AsyncPaginate
                      placeholder=""
                      debounceTimeout={800}
                      isMulti
                      loadOptions={loadUsersOptions}
                      styles={customStyles}
                      components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                      onChange={handleUsersChange}
                      hideSelectedOptions={false}
                      value={users}
                      // menuPosition="fixed"
                    />
                    <Input placeholder="" value={users} hidden />
                    <FormLabel>User</FormLabel>
                    <FormErrorMessage>{errors?.users?.message}</FormErrorMessage>
                  </FormControl>
                </InputGroup> */}
              </HStack>
            )}

            {!question && (
              <HStack mt="20px" w="100%" justify="space-between">
                <InputGroup zIndex={'9'} w="auto">
                  <FormControl w="auto" variant="floating" isInvalid={!!selectedType?.value && !!errors?.scope}>
                    <AsyncPaginate
                      placeholder=""
                      debounceTimeout={800}
                      isMulti
                      loadOptions={loadScopeOptions}
                      styles={customStyles}
                      components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                      onChange={handleScopeChange}
                      hideSelectedOptions={false}
                      value={scope}
                      // menuPosition="fixed"
                    />
                    <Input placeholder="" value={scope} hidden />
                    <FormLabel>Scope</FormLabel>
                    <FormErrorMessage>{errors?.scope?.message}</FormErrorMessage>
                  </FormControl>
                </InputGroup>
                <FormControl w="auto" variant="floating" isInvalid={!!selectedType?.value && !!errors?.institution}>
                  <InputGroup zIndex={3} w="auto">
                    <VStack align={'start'}>
                      <AsyncPaginate
                        placeholder=""
                        isMulti
                        debounceTimeout={800}
                        loadOptions={loadInstitutionOptions}
                        menuPortalTarget={document.body}
                        styles={{
                          ...customStyles,
                          menuPortal: base => ({ ...base, zIndex: 9999 })
                        }}
                        components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                        onChange={handleInstitutionChange}
                        hideSelectedOptions={false}
                        value={institution}
                        menuPosition="fixed"
                      />
                      <Input placeholder=" " value={institution} hidden />
                      <FormLabel>Institution</FormLabel>
                      <FormErrorMessage mt={'0px'}>{errors?.institution?.message}</FormErrorMessage>
                    </VStack>
                  </InputGroup>
                </FormControl>
                <FormControl w="auto" variant="floating" isInvalid={!!selectedType?.value && !!errors?.industry}>
                  <InputGroup zIndex={3} w="auto">
                    <VStack align={'start'}>
                      <AsyncPaginate
                        placeholder=""
                        debounceTimeout={800}
                        isMulti
                        loadOptions={loadIndustryOptions}
                        menuPortalTarget={document.body}
                        styles={{
                          ...customStyles,
                          menuPortal: base => ({ ...base, zIndex: 9999 })
                        }}
                        components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                        onChange={handleIndustryChange}
                        hideSelectedOptions={false}
                        value={industry}
                        menuPosition="fixed"
                      />
                      <Input placeholder="" value={industry} hidden />
                      <FormLabel>Industry</FormLabel>
                      <FormErrorMessage mt={'0px'}>{errors?.industry?.message}</FormErrorMessage>
                    </VStack>
                  </InputGroup>
                </FormControl>
              </HStack>
            )}

            <Box
              mt={question ? '' : '18px'}
              w="100%"
              padding={question && mode !== 'answer' && mode !== 'view' ? '20px' : ''}
            >
              {renderAnswerType()}
            </Box>

            {/* Add attachment display field when has_attachment is true */}
            {watch('has_attachment') && (
              <Box w="100%" padding={question && '20px'}>
                <Button
                  fontSize="14px"
                  mt="5px"
                  fontWeight="400"
                  justifyContent="center"
                  h="40px"
                  borderRadius="4px"
                  border="1px solid #D9D9D9"
                  bg="#FFF"
                  color="#000"
                  onClick={() => setIsUpload(!isUpload)}
                  _hover={{ opacity: 0.8 }}
                >
                  Add Attachment
                </Button>
              </Box>
            )}
            {!isAnswerMode && (
              <HStack w="100%" justify="start" gap={'20px'} padding={question && '20px'}>
                <Box mt="auto">
                  <FormControl>
                    <Controller
                      name="is_not_question"
                      control={control}
                      render={({ field: { onChange, value, ref } }) => (
                        <Checkbox
                          isDisabled={isDisabledOnEditMode}
                          ref={ref}
                          isChecked={value}
                          onChange={onChange}
                          mr="auto"
                        >
                          This is title only
                        </Checkbox>
                      )}
                    />
                  </FormControl>
                </Box>
              </HStack>
            )}
            {!isAnswerMode && !isTitleOnly && !question?.isNotQuestion && (
              <HStack w="100%" justify="start" gap={'20px'} padding={question && '20px'}>
                <Box mt="auto">
                  <FormControl>
                    <Controller
                      name="is_required"
                      control={control}
                      render={({ field: { onChange, value, ref } }) => (
                        <Checkbox
                          isDisabled={isDisabledOnEditMode}
                          ref={ref}
                          isChecked={value}
                          onChange={onChange}
                          mr="auto"
                        >
                          Mandatory
                        </Checkbox>
                      )}
                    />
                  </FormControl>
                </Box>
                <Box mt="auto">
                  <FormControl>
                    <Controller
                      name="has_attachment"
                      control={control}
                      render={({ field: { onChange, value, ref } }) => (
                        <Checkbox
                          isDisabled={isDisabledOnEditMode}
                          ref={ref}
                          isChecked={value}
                          onChange={onChange}
                          mr="auto"
                        >
                          Attachment
                        </Checkbox>
                      )}
                    />
                  </FormControl>
                </Box>
                <Box mt="auto">
                  <FormControl>
                    <Controller
                      name="has_remarks"
                      control={control}
                      render={({ field: { onChange, value, ref } }) => (
                        <Checkbox
                          isDisabled={isDisabledOnEditMode}
                          ref={ref}
                          isChecked={value}
                          onChange={onChange}
                          mr="auto"
                        >
                          Remarks
                        </Checkbox>
                      )}
                    />
                  </FormControl>
                </Box>
              </HStack>
            )}

            <HStack w="100%" mt="auto" mb={question ? '17px' : '17px'}>
              {renderActionButtons()}
            </HStack>
          </VStack>
        </form>
      </FormProvider>
    );
  }
);

QuestionForm.displayName = 'QuestionForm';

export default QuestionForm;
