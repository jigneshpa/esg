import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import { useParams } from 'react-router-dom';
import { AsyncPaginate } from 'react-select-async-paginate';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList } from 'react-window';
import {
  Box,
  Center,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react';

import { HeadingText } from '@/components';
import { CustomValueContainer } from '@/components/common/SortableHeader';
import { QUESTION_FORM_PAGE_TYPE } from '@/constants';
import { useAttributes } from '@/context/AtrributesContext';
import { ApiType } from '@/hooks/useLoadOptions';
import useSearchAndSelect from '@/hooks/useSearchAndSelect';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectQuestionBankList } from '@/store/slices/refresh/refreshSelectors';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import { orderQuestions } from '@/utils';

import { customDraftInputStyles, InputOption, Placeholder } from '../../../../components/common/InputOption';
import SaveQuestionBank from '../view-question-bank/components/SaveQuestionBank';
import AddQuestionModal from './components/AddQuestionModal';
import AssignThemeByCategoryModel from './components/AssignThemeByCategoryModel';
import QuestionForm, { QuestionFormSubmit } from './components/QuestionForm';

// Create a height cache outside component to persist between renders
const heightCache = new Map();

interface QuestionRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    questions: any[],
    listRef?: React.RefObject<any>
  };
}

const QuestionRow: React.FC<QuestionRowProps> = memo(({ index, style, data }) => {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const question = data.questions[index];
  const [height, setHeight] = useState<number>(heightCache.get(index) || 400);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // Create ResizeObserver to track height changes
    const resizeObserver = new ResizeObserver(entries => {
      requestAnimationFrame(() => {
        if (contentRef.current) {
          const newHeight = contentRef.current.offsetHeight;
          if (newHeight > 0 && (isInitialRender || newHeight !== height)) {
            setHeight(newHeight);
            heightCache.set(index, newHeight);
            if (data.listRef?.current) {
              data.listRef.current.resetAfterIndex(index, false);
            }
            if (isInitialRender) {
              setIsInitialRender(false);
            }
          }
        }
      });
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [index, data.listRef, height, isInitialRender]);

  // Calculate the final style with the measured height
  const finalStyle: React.CSSProperties = {
    ...style,
    height: undefined, // Remove height constraint
    position: 'absolute',
    top: style.top,
    left: 0,
    width: '100%',
    minHeight: height,
    transition: isInitialRender ? 'none' : 'height 0.2s ease-in-out'
  };

  return (
    <Box ref={ref} style={finalStyle}>
      <Box ref={contentRef} position="relative">
        <QuestionForm
          key={question.id}
          index={index}
          displayIndex={question.displayNo}
          question={question}
          isSubQuestion={!!question?.parentId}
          mode="edit"
          pageType={QUESTION_FORM_PAGE_TYPE.QUESTION_BANK_EDIT}
        />
      </Box>
    </Box>
  );
});

QuestionRow.displayName = 'QuestionRow';

const QuestionBank = () => {
  const dispatch = useAppDispatch();
  const { qbankId } = useParams();
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
    //@ts-ignore
  } = useSearchAndSelect<QuestionFormSubmit>({});

  const {
    data: { data = {} } = {},
    refetch,
    isFetching,
    isLoading
  } = questionnaireApi.useGetQuestionBankListByIdQuery(
    {
      bankId: Number(qbankId),
      // @ts-ignore
      institution_id: institution && institution.map(item => item.value),
      // @ts-ignore
      framework_id: framework && framework.map(item => item.value),
      // @ts-ignore
      industry_id: industry && industry.map(item => item.value),
      // @ts-ignore
      department_id: department && department.map(item => item.value),
      // @ts-ignore
      scope_id: scope && scope.map(item => item.value),
      search: debouncedSearchTerm,
      page: 1,
      max_results: 1000
    },
    { skip: !qbankId }
  );

  const refetchQueries = useAppSelector(selectQuestionBankList);
  useEffect(() => {
    if (refetchQueries) {
      refetch();
      dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: false }));
    }
  }, [refetchQueries, refetch, dispatch]);

  const organizedQuestions = useMemo(() => {
    if (data?.questions?.length > 0) {
      return orderQuestions(data?.questions);
    } else {
      return [];
    }
  }, [data?.questions]);

  // Add list ref
  const listRef = useRef<any>(null);

  // Add getItemSize callback
  const getItemSize = useCallback((index: number) => heightCache.get(index) || 500, []);

  // Clear height cache when questions change
  useEffect(() => {
    heightCache.clear();
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  }, [organizedQuestions]);

  const categories = useMemo(() => {
    const uniqueCategories = new Map();
    organizedQuestions.forEach(question => {
      if (question.category && question.category.id) {
        uniqueCategories.set(question.category.id, question.category);
      }
    });
    return Array.from(uniqueCategories.values());
  }, [organizedQuestions]);

  return (
    <Box w="100%" h="100vh" display="flex" flexDirection="column">
      <HStack justify="space-between" pt="20px" px="35px">
        <HeadingText>{data?.name}</HeadingText>
        <HStack ml="auto" spacing={3}>
          {data.name && categories && categories.length > 0 && (
            <AssignThemeByCategoryModel categories={categories} questions={organizedQuestions} />
          )}
          <AddQuestionModal />
        </HStack>
      </HStack>

      <HStack
        h="70px"
        borderRadius={'5px'}
        bgColor="#137E59"
        mx="35px"
        px="8px"
        mt="12px"
        mb="20px"
        justify="space-between"
      >
        <FormControl variant="floating">
          <InputGroup
            minW={'150px'}
            maxW={{
              base: '80%',
              xl: '280px'
            }}
            bg={'white'}
            borderRadius={'8px'}
          >
            <InputLeftElement>
              <Icon as={BsSearch} />
            </InputLeftElement>
            <Input onChange={handleSearchChange} placeholder="" />
            <FormLabel
              css={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis' // Reset maxWidth for viewport width less than 700px
              }}
            >
              Search Question
            </FormLabel>
          </InputGroup>
        </FormControl>
        <QuestionBankFilters
          handleInstitutionChange={handleInstitutionChange}
          handleFrameworkChange={handleFrameworkChange}
          handleIndustryChange={handleIndustryChange}
          handleDepartmentChange={handleDepartmentChange}
          handleScopeChange={handleScopeChange}
          institution={institution}
          framework={framework}
          industry={industry}
          department={department}
          scope={scope}
        />
      </HStack>
      <List spacing={3} mt="20px" px="35px" flexGrow={1} overflow="auto">
        {isFetching && isLoading ? (
          <Center>
            <Spinner />
          </Center>
        ) : organizedQuestions?.length > 0 ? (
          <Box height="100%">
            <AutoSizer>
              {({ height, width }) => (
                <VariableSizeList
                  ref={listRef}
                  height={height || 600}
                  width={width || 800}
                  itemCount={organizedQuestions.length}
                  itemSize={getItemSize}
                  overscanCount={5}
                  itemData={{
                    questions: organizedQuestions,
                    listRef
                  }}
                >
                  {QuestionRow}
                </VariableSizeList>
              )}
            </AutoSizer>
          </Box>
        ) : (
          <List spacing={3} mt="20px">
            <Stack spacing={10}>
              <Box padding="6" boxShadow="lg" bg="white">
                <Center mt="4">
                  <Flex
                    p={4}
                    borderRadius="md"
                    h="300px"
                    alignItems="center"
                    direction={'column'}
                    justifyContent={'Center'}
                  >
                    <Text fontSize="lg" fontWeight="bold" mb={2}>
                      No questions added yet!
                    </Text>
                    <Text mb={4}>Please add new questions to continue.</Text>
                    <AddQuestionModal />
                  </Flex>
                </Center>
              </Box>
            </Stack>
          </List>
        )}
        {organizedQuestions?.length > 0 && <SaveQuestionBank id={data.id} name={data.name} version={data.version} />}
      </List>
    </Box>
  );
};

const QuestionBankFilters = ({
  handleInstitutionChange,
  handleFrameworkChange,
  handleIndustryChange,
  handleDepartmentChange,
  handleScopeChange,
  institution,
  framework,
  industry,
  department,
  scope
}: any) => {
  const { loadOptions } = useAttributes();

  const { loadOptions: loadInstitutionOptions } = loadOptions(ApiType.Institution);
  // const { loadOptions: loadFrameworkOptions } = loadOptions(ApiType.Framework);
  const { loadOptions: loadIndustryOptions } = loadOptions(ApiType.Industry);
  const { loadOptions: loadDepartmentOptions } = loadOptions(ApiType.Department);
  const { loadOptions: loadScopeOptions } = loadOptions(ApiType.Scope);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        await Promise.all([
          loadScopeOptions('', [], { page: 1 }),
          loadDepartmentOptions('', [], { page: 1 }),
          loadInstitutionOptions('', [], { page: 1 }),
          loadIndustryOptions('', [], { page: 1 })
          // loadFrameworkOptions('', [], { page: 1 })
        ]);
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };

    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HStack>
      <FormControl variant="floating">
        <InputGroup zIndex={8}>
          <AsyncPaginate
            placeholder=""
            styles={customDraftInputStyles}
            components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
            debounceTimeout={800}
            loadOptions={loadScopeOptions}
            isClearable
            isMulti
            additional={{
              page: 1
            }}
            onChange={handleScopeChange}
            hideSelectedOptions={false}
            value={scope}
            noOptionsMessage={() => 'No Scope Found'}
          />

          <Input placeholder="" value={scope} hidden />
          <FormLabel
            css={{
              '@media (max-width: 1291px)': {
                maxWidth: '70px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis' // Reset maxWidth for viewport width less than 700px
              },
              '@media (max-width: 1160px)': {
                maxWidth: '50px' // Reset maxWidth for viewport width less than 700px
              },
              '@media (max-width: 1037px)': {
                maxWidth: '30px' // Reset maxWidth for viewport width less than 700px
              }
            }}
          >
            Scope1
          </FormLabel>
        </InputGroup>
      </FormControl>
      <FormControl variant="floating">
        <InputGroup zIndex={8}>
          <AsyncPaginate
            placeholder=""
            styles={customDraftInputStyles}
            components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
            debounceTimeout={800}
            loadOptions={loadDepartmentOptions}
            isClearable
            isMulti
            additional={{
              page: 1
            }}
            onChange={handleDepartmentChange}
            hideSelectedOptions={false}
            value={department}
            noOptionsMessage={() => 'No Department Found'}
          />
          {/* @ts-ignore */}
          <Input placeholder="" value={department} hidden />
          <FormLabel
            css={{
              '@media (max-width: 1291px)': {
                maxWidth: '70px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis' // Reset maxWidth for viewport width less than 700px
              },
              '@media (max-width: 1160px)': {
                maxWidth: '50px' // Reset maxWidth for viewport width less than 700px
              },
              '@media (max-width: 1037px)': {
                maxWidth: '30px' // Reset maxWidth for viewport width less than 700px
              }
            }}
          >
            Department
          </FormLabel>
        </InputGroup>
      </FormControl>
      <FormControl variant="floating">
        <InputGroup zIndex={8}>
          <AsyncPaginate
            placeholder=""
            styles={customDraftInputStyles}
            components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
            debounceTimeout={800}
            loadOptions={loadInstitutionOptions}
            isClearable
            isMulti
            additional={{
              page: 1
            }}
            onChange={handleInstitutionChange}
            hideSelectedOptions={false}
            value={institution}
            noOptionsMessage={() => 'No Institution Found'}
          />
          {/* @ts-ignore */}
          <Input placeholder=" " value={institution} hidden />
          <FormLabel
            css={{
              '@media (max-width: 1291px)': {
                maxWidth: '70px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis' // Reset maxWidth for viewport width less than 700px
              },
              '@media (max-width: 1160px)': {
                maxWidth: '50px' // Reset maxWidth for viewport width less than 700px
              },
              '@media (max-width: 1037px)': {
                maxWidth: '30px' // Reset maxWidth for viewport width less than 700px
              }
            }}
          >
            Standards
          </FormLabel>
        </InputGroup>
      </FormControl>

      {/*<FormControl variant="floating">*/}
      {/*  <InputGroup zIndex={8}>*/}
      {/*    <AsyncPaginate*/}
      {/*      placeholder=""*/}
      {/*      debounceTimeout={800}*/}
      {/*      styles={customDraftInputStyles}*/}
      {/*      components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}*/}
      {/*      isClearable*/}
      {/*      isMulti*/}
      {/*      value={framework}*/}
      {/*      loadOptions={loadFrameworkOptions}*/}
      {/*      additional={{*/}
      {/*        page: 1*/}
      {/*      }}*/}
      {/*      onChange={handleFrameworkChange}*/}
      {/*      hideSelectedOptions={false}*/}
      {/*      noOptionsMessage={() => 'No Framework Found'}*/}
      {/*    />*/}
      {/*    /!* @ts-ignore *!/*/}
      {/*    <Input placeholder="" value={framework} hidden />*/}
      {/*    <FormLabel*/}
      {/*      css={{*/}
      {/*        '@media (max-width: 1291px)': {*/}
      {/*          maxWidth: '70px',*/}
      {/*          overflow: 'hidden',*/}
      {/*          whiteSpace: 'nowrap',*/}
      {/*          textOverflow: 'ellipsis' // Reset maxWidth for viewport width less than 700px*/}
      {/*        },*/}
      {/*        '@media (max-width: 1160px)': {*/}
      {/*          maxWidth: '50px' // Reset maxWidth for viewport width less than 700px*/}
      {/*        },*/}
      {/*        '@media (max-width: 1037px)': {*/}
      {/*          maxWidth: '30px' // Reset maxWidth for viewport width less than 700px*/}
      {/*        }*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      ESG Standard*/}
      {/*    </FormLabel>*/}
      {/*  </InputGroup>*/}
      {/*</FormControl>*/}

      <FormControl variant="floating">
        <InputGroup zIndex={8}>
          <AsyncPaginate
            placeholder=""
            debounceTimeout={800}
            styles={customDraftInputStyles}
            components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
            isClearable
            isMulti
            value={industry}
            noOptionsMessage={() => 'No Industry Found'}
            loadOptions={loadIndustryOptions}
            additional={{
              page: 1
            }}
            onChange={handleIndustryChange}
            hideSelectedOptions={false}
          />
          {/* @ts-ignore */}
          <Input placeholder="" value={industry} hidden />
          <FormLabel
            css={{
              '@media (max-width: 1291px)': {
                maxWidth: '70px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis' // Reset maxWidth for viewport width less than 700px
              },
              '@media (max-width: 1160px)': {
                maxWidth: '50px' // Reset maxWidth for viewport width less than 700px
              },
              '@media (max-width: 1037px)': {
                maxWidth: '30px' // Reset maxWidth for viewport width less than 700px
              }
            }}
          >
            Industry
          </FormLabel>
        </InputGroup>
      </FormControl>
    </HStack>
  );
};

export default QuestionBank;
