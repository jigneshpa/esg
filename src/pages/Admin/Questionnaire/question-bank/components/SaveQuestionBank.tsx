import React, { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay
} from '@chakra-ui/react';
import * as yup from 'yup';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppDispatch } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import { ErrorData } from '@/types/common';
import { yupResolver } from '@hookform/resolvers/yup';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import CustomModalHeader from '../../../../../components/CustomModalHeader/CustomModalHeader';

interface ISaveQuestionBank {
  name: string;
  version: number;
  isOpen?: boolean;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  version: yup.number().typeError('Version must be a number').required('Version is required')
});

const SaveQuestionBank: FC<ISaveQuestionBank> = ({ name, version, isOpen }) => {
  const { confirm, notify } = useAppContext();
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const handleModal = () => setIsModalOpen(!isModalOpen);
  const [createQuestionnaireBank, { isSuccess, isError, error, isLoading }] =
    questionnaireApi.useCreateQuestionnaireBankMutation();
  console.log('left!!!!');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ISaveQuestionBank>({
    defaultValues: {
      name,
      version
    },
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'ESG Standard successfully updated'
      });
      reset();
      dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: true }));
    } else if (isError && error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [isSuccess, isError, error, notify, reset, dispatch]);

  useEffect(() => {
    if (isModalOpen) {
      reset({ name, version });
    }
  }, [isModalOpen, reset, name, version]);

  useEffect(() => {
    if (isOpen) {
      setIsModalOpen(true);
    }
  }, [isOpen]);

  const onSubmit = async (formData: ISaveQuestionBank) => {
    const { ...restData } = formData;
    const data = {
      ...restData,
      draft: false
    };

    confirm({
      title: 'Update ESG Standard',
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: async () => {
        handleModal();
        await createQuestionnaireBank(data);
      }
    });
  };

  return (
    <>
      <Flex w="100%" justify="flex-end" mb="150px">
        <Button
          fontSize={'0.9em'}
          fontWeight={700}
          w="180px"
          h="44px"
          bg="#137E59"
          isLoading={isLoading}
          onClick={handleModal}
          _hover={{
            opacity: 0.8
          }}
        >
          Save
        </Button>
      </Flex>
      <Modal isOpen={isModalOpen} onClose={handleModal} isCentered>
        <ModalOverlay />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent bgColor="#FFF" maxW="474px" w="100%" h="auto" borderRadius={'16px'}>
            <CustomModalHeader title="Save as" />
            <ModalBody bgColor="#FFF">
              <FormControl isInvalid={!!errors.name} mb="24px">
                <FormLabel htmlFor="name">Save ESG Standard as</FormLabel>
                <Input placeholder="Enter ESG Standard name" id="name" {...register('name')} />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.version} mb="24px">
                <FormLabel htmlFor="version">Version</FormLabel>
                <Input placeholder="Enter ESG Standard version" id="version" type="text" {...register('version')} />
                <FormErrorMessage>{errors.version?.message}</FormErrorMessage>
              </FormControl>
            </ModalBody>
            <ModalFooter bgColor="#FAFAFA" borderTop="1px solid #D9D9D9">
              <HStack gap="20px">
                <Button mt={4} variant="outline" type="submit" onClick={handleModal}>
                  Cancel
                </Button>
                <Button mt={4} bg={'primary'} type="submit">
                  Save
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  );
};

export default SaveQuestionBank;
