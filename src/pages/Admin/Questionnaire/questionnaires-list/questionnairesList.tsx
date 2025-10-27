import { MdOutlineArrowBackIos } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Center, HStack, Icon, Spinner, VStack } from '@chakra-ui/react';

import { organizeQuestions } from '@/utils';

import { questionnaireApi } from '../../../../store/api/questionnaire/questionnaireApi';
import { Question } from '../../../../types/question';
import QuestionForm from '../question-bank/components/QuestionForm';

const QuestionnairesList = () => {
  const { industryId, frameworkId } = useParams();
  const navigate = useNavigate();

  const { data: { data: { questions = [] } = {} } = {}, isLoading } =
    questionnaireApi.useGetQuestionsByCompanyAndFrameworkQuery(
      {
        industryId,
        frameworkId
      },
      { skip: !industryId && !frameworkId }
    );

  return (
    <VStack p="26px 36px 118px 20px" w="100%">
      <HStack h="100%" w="100%">
        <Button
          mt="12px"
          mb="auto"
          className="no-print"
          leftIcon={<Icon as={MdOutlineArrowBackIos} fontSize={'14px'} />}
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </HStack>
      {isLoading ? (
        <Center mt="45vh" borderRadius={'10px'} bg={'white'}>
          <Spinner />
        </Center>
      ) : (
        organizeQuestions(questions).map((question: Question, index: number) => (
          <QuestionForm
            index={index}
            key={`${question.id}-${industryId}-${frameworkId}`}
            question={question}
            mode="view"
            displayIndex={question.displayNo}
            isSubQuestion={!!question.parentId}
            pageType=''
          />
        ))
      )}
    </VStack>
  );
};

export default QuestionnairesList;
