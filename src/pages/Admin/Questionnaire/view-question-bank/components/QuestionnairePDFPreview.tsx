import { forwardRef, useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { HeadingText } from '@/components';
import { userApi } from '@/store/api/user/userApi';
// import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useDispatch } from 'react-redux';
// import { AnyAction } from '@reduxjs/toolkit';
import { orderQuestions } from '@/utils';
import FormTableBuilder from '@/components/DynamicTableBuilder/FormTableBuilder';

interface AnswerItem {
  user_id: number;
  answer: string;
}

interface TableStructure {
  id: string;
  name: string;
  description: string;
  columns: any[];
  cells: any[];
  rows: number;
  cols: number;
}

interface QuestionnairePDFPreviewProps {
  name: string;
  questions: any[];
  display?: 'none' | 'block';
  companyId?: string | number | null;
}

// Table Display Component with Form Context
export const TableDisplay: React.FC<{ tableStructure: TableStructure }> = ({ tableStructure }) => {
  const methods = useForm({
    defaultValues: {
      tableOptions: tableStructure
    }
  });

  return (
    <FormProvider {...methods}>
      <FormTableBuilder
        name="tableOptions"
        hideConfiguration={true}
        allowEmptyCellEditing={false}
      />
    </FormProvider>
  );
};

const QuestionnairePDFPreview = forwardRef<HTMLDivElement, QuestionnairePDFPreviewProps>(
  ({ name, questions, display = 'none', companyId }, ref) => {
    //  console.log('questions ',questions)
    //  console.log('companyId',companyId)

    const [answers, setAnswers] = useState<{ [key: string]: string | TableStructure }>({});
    const [userCache, setUserCache] = useState<{ [key: number]: { id: number, company_id: number } }>({});
    // Fetch all users for the company
    const { data: usersData } = userApi.useGetUserListQuery({
      page: 1,
      max_results: 100000000000,
      companyIds: companyId ? [Number(companyId)] : undefined
    });
    // console.log('orderQuestions',orderQuestions(questions))
    const [parentQuestions, setParentQuestions] = useState<{ [key: number]: string }>({});
    const dispatch = useDispatch();
    // console.log('organized questions',orderQuestions(questions))
    // Get unique parentIds from questions
    // const fetchParentQuestions = async () => {
    //   if (questions) {
    //     const uniqueParentIds = [...new Set(questions
    //       .filter(q => q.parentId)
    //       .map(q => q.parentId)
    //     )];

    //     console.log('Total unique parent IDs to fetch:', uniqueParentIds.length);
    //     console.log('Unique Parent IDs:', uniqueParentIds);

    //     // Process in batches of 10
    //     const batchSize = 10;
    //     let totalFetched = 0;

    //     for (let i = 0; i < uniqueParentIds.length; i += batchSize) {
    //       const batch = uniqueParentIds.slice(i, i + batchSize);
    //       console.log(`Processing batch ${i/batchSize + 1}:`, batch);

    //       const promises = batch.map(parentId => {
    //         const action = questionnaireApi.endpoints.getQuestion.initiate(parentId);
    //         return dispatch(action as unknown as AnyAction);

    //       })

    //       const results = await Promise.all(promises);
    //       console.log(`Batch ${i/batchSize + 1} Results:`, results);

    //       // Update state with titles from this batch
    //       const batchParentQuestions = results.reduce((acc, result: any) => {
    //         if (result?.data?.data?.title) {
    //           acc[result.originalArgs] = result.data.data.title;
    //           totalFetched++;
    //         }
    //         return acc;
    //       }, {} as {[key: number]: string});

    //       console.log(`Batch ${i/batchSize + 1} Titles:`, batchParentQuestions);
    //       console.log(`Total fetched so far: ${totalFetched}/${uniqueParentIds.length}`);

    //       setParentQuestions(prev => {
    //         const newState = {
    //           ...prev,
    //           ...batchParentQuestions
    //         };
    //         console.log('Current parentQuestions state:', newState); // This will show you the stored titles
    //         return newState;
    //       });
    //     }

    //     console.log('Final parent questions state:', parentQuestions);
    //   }
    // };

    // // Call the function when questions change
    // useEffect(() => {
    //   fetchParentQuestions();
    // }, [questions]);

    // Update user cache when users data is received
    useEffect(() => {
      if (usersData?.data?.items) {
        // console.log('usersData',usersData)
        const newUserCache = usersData.data.items.reduce((acc: any, user: any) => {
          acc[user.id] = {
            id: user.id,
            company_id: user.companyId
          };
          return acc;
        }, {});
        setUserCache(newUserCache);
      }
    }, [usersData]);
    //  console.log('userCache',userCache)
    // Add this useEffect after the userCache useEffect
    useEffect(() => {
      if (!questions) return;

      questions.forEach((question: any) => {
        if (question.type === 'textBox') {
          if (Array.isArray(question.answer)) {
            const filteredAnswers = question.answer
              .filter((answerItem: AnswerItem) =>
                userCache[answerItem.user_id]
              )
              .map((answerItem: AnswerItem) => {
                try {
                  const parsedAnswer = JSON.parse(answerItem.answer);
                  return parsedAnswer?.answer || parsedAnswer?.selectedAnswer || answerItem.answer;
                } catch (error) {
                  return answerItem.answer;
                }
              });

            setAnswers(prev => ({
              ...prev,
              [question.id]: filteredAnswers.join(', ') || 'Not Applicable'
            }));
          }
        }
        else if (question.type === 'checkbox' || question.type === 'radio') {
          if (Array.isArray(question.answer)) {
            const filteredAnswers = question.answer
              .filter((answerItem: AnswerItem) =>
                userCache[answerItem.user_id] &&
                userCache[answerItem.user_id].company_id === companyId
              )
              .map((answerItem: AnswerItem) => {
                try {
                  const parsedAnswer = JSON.parse(answerItem.answer);
                  if (question.type === 'checkbox' && parsedAnswer?.checkboxOptions) {
                    const selectedOptions = parsedAnswer.checkboxOptions
                      .filter((opt: any) => opt.isChecked === true)
                      .map((opt: any) => opt.text)
                      .join(', ');
                    return selectedOptions || 'Not Applicable';
                  } else if (question.type === 'radio' && parsedAnswer?.radioOptions) {
                    const selectedOption = parsedAnswer.radioOptions.find((opt: any) => opt.isChecked === true);
                    return selectedOption ? selectedOption.text : 'Not Applicable';
                  }
                } catch (error) {
                  console.error('Error parsing answer:', error);
                  return null;
                }
                return null;
              })
              .filter(Boolean);

            setAnswers(prev => ({
              ...prev,
              [question.id]: filteredAnswers.join(', ') || 'Not Applicable'
            }));
          }
        }
        else if (question.type === 'dropDown') {
          if (Array.isArray(question.answer)) {
            const filteredAnswers = question.answer
              .filter((answerItem: AnswerItem) =>
                userCache[answerItem.user_id] &&
                userCache[answerItem.user_id].company_id === companyId
              )
              .map((answerItem: AnswerItem) => {
                try {
                  const parsedAnswer = JSON.parse(answerItem.answer);
                  if (parsedAnswer?.selectedAnswer) {
                    return parsedAnswer.selectedAnswer;
                  } else if (parsedAnswer?.answer) {
                    return parsedAnswer.answer;
                  }
                } catch (error) {
                  console.error('Error parsing dropdown answer:', error);
                  return null;
                }
                return null;
              })
              .filter(Boolean);

            setAnswers(prev => ({
              ...prev,
              [question.id]: filteredAnswers.join(', ') || 'Not Applicable'
            }));
          }
        }
        else if (question.type === 'table') {
          if (Array.isArray(question.answer)) {
            const filteredAnswers = question.answer
              .filter((answerItem: AnswerItem) =>
                userCache[answerItem.user_id] &&
                userCache[answerItem.user_id].company_id === companyId
              )
              .map((answerItem: AnswerItem) => {
                try {
                  const parsedAnswer = JSON.parse(answerItem.answer);
                  if (parsedAnswer?.tableOptions) {
                    return parsedAnswer.tableOptions;
                  }
                } catch (error) {
                  console.error('Error parsing table answer:', error);
                  return null;
                }
                return null;
              })
              .filter(Boolean);

            // For table questions, we store the table structure instead of a string
            if (filteredAnswers.length > 0) {
              setAnswers(prev => ({
                ...prev,
                [question.id]: filteredAnswers[0] // Use the first table structure found
              }));
            } else {
              setAnswers(prev => ({
                ...prev,
                [question.id]: 'Not Applicable'
              }));
            }
          }
        }
      });
    }, [questions, userCache, companyId]);
    return (
      <Box
        position="relative"
        display={display}
        mx="auto" // Center the container
        bg="white" // White background for print
        boxShadow="md" // Subtle shadow for depth
        minH="100vh" // Mimic a page


      >
        <div ref={ref}>
          <Box position="relative" border="1px solid" borderColor="green.100" width="90%" mx="auto" minH="90vh"
            bg="white" mt="5vh" mb="5vh"

          >

            <Box
              width="100%"
              bgGradient="linear(to-r, blue.400, blue.500)"
              p={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              border="1px solid"
              borderColor="green.100"


            >


              <HeadingText fontSize="2xl" color="white">{name}</HeadingText>

            </Box>
            <Box width="97%">

              <Box
                position="relative"
                mt="5%"
                width="100%"
                mx='1.5%'
                boxShadow="md"
                py={6}
                bg="white"
                border="1px solid"
                borderColor="green.100"


              >
                {/* Semi-transparent background image */}

                <Box position="relative" zIndex={1}>
                  {orderQuestions(questions)?.map((question: any, _index: number) => (
                    <Box key={question.id} border="1px solid" borderColor="green.100" borderRadius="md" p={4} mb={4} mt={4} mx={4}>
                      <Box fontWeight="bold" mb={2}>
                        {question.displayNo}.&nbsp;&nbsp;{question.title}
                      </Box>
                      <Box>
                        {question.type === 'table' && typeof answers[question.id] === 'object' && answers[question.id] !== null && 'cells' in (answers[question.id] as any) ? (
                          <TableDisplay tableStructure={answers[question.id] as TableStructure} />
                        ) : (
                          (typeof answers[question.id] === 'string' ? answers[question.id] : 'Not Applicable') as string
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
            <Box position="absolute" bottom="0" display="flex" justifyContent="center" alignItems="center" flexDirection="column" width="90%" color="blue.700" gap="3px">
              <span>Powered by Greenfi</span>
            </Box>
          </Box>

        </div>

      </Box>
    );
  }
);

QuestionnairePDFPreview.displayName = 'QuestionnairePDFPreview';

export default QuestionnairePDFPreview;
