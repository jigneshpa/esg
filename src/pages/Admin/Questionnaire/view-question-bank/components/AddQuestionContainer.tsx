import React, { createRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { Box, Button, HStack, Icon, VStack } from '@chakra-ui/react';

import useCreateQuestion from '../../../../../hooks/useCreateQuestion';
import QuestionForm from './QuestionForm';
import { QUESTION_FORM_PAGE_TYPE } from '@/constants';

const AddQuestionContainer = forwardRef(({ handleModal, parentId = null }: any, ref) => {
  const formRefs = useRef<React.RefObject<HTMLFormElement>[]>([]);
  const [questions, setQuestions] = useState([{}]);
  const [updateRefs, setUpdateRefs] = useState<boolean>(false);
  const [refsInitialized, setRefsInitialized] = useState<boolean>(false);
  const [successfulSubmissions, setSuccessfulSubmissions] = useState<number>(0);
  const { createQuestion } = useCreateQuestion(handleModal);

  useEffect(() => {
    if (questions.length > formRefs.current.length) {
      for (let i = formRefs.current.length; i < questions.length; i++) {
        formRefs.current.push(createRef());
      }
      setUpdateRefs(false);
    }
  }, [questions, updateRefs]);

  const addNewQuestionForm = () => {
    setQuestions([...questions, {}]);
    setUpdateRefs(true);
  };

  const addData = (formData: any, index: number) => {
    //@ts-ignore
    setQuestions(prevData => {
      const newData = [...prevData];
      newData[index - 1] = { ...formData, parent_id: parentId };
      return newData;
    });
  };

  useEffect(() => {
    if (successfulSubmissions === questions.length) {
      createQuestion(questions);
    }
  }, [questions]);

  const submitAllForms = async () => {
    let hasError = false;

    formRefs.current.forEach(ref => {
      if (Object.keys(ref.current?.errors || {}).length > 0) {
        hasError = true;
      }
    });

    if (!hasError) {
      formRefs.current.map(ref => ref.current?.submit());
      setSuccessfulSubmissions(questions.length);
    } else {
      console.log('Cannot submit, one or more forms have errors');
    }
  };

  useEffect(() => {
    if (!refsInitialized) {
      formRefs.current = questions.map(() => createRef());
      setRefsInitialized(true);
    }
  }, [questions, refsInitialized]);

  useImperativeHandle(ref, () => ({
    submitAll: submitAllForms
  }));

  return (
    <VStack spacing={4} minH="350px" maxH="500px" overflow="auto">
      <Box w="96%">
        {questions.map((_, index) => (
          //@ts-ignore
          <QuestionForm
            key={index}
            ref={formRefs.current[index]}
            index={index}
            displayIndex={String(index + 1)}
            //@ts-expect-error
            onFormSubmit={addData}
            pageType={QUESTION_FORM_PAGE_TYPE.QUESTION_BANK_ADD_QUESTION}
          />
        ))}
        <HStack w="100%" mt="auto" mb="8px">
          <Button
            type="button"
            ml="auto"
            fontSize={'0.9em'}
            fontWeight={700}
            w="auto"
            h="35px"
            leftIcon={<Icon as={IoMdAddCircleOutline} fontSize={'20px'} />}
            onClick={addNewQuestionForm}
            _hover={{ opacity: 0.8 }}
          >
            Add New Question
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
});

AddQuestionContainer.displayName = 'AddQuestionContainer';
export default AddQuestionContainer;
