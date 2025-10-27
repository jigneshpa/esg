import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MdOutlineAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  Input
} from '@chakra-ui/react';
import * as yup from 'yup';

import { MESSAGE, STATUS, URLS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import { selectUserRole } from '@/store/slices/user/userSelectors';
import { ErrorData } from '@/types/common';
import { yupResolver } from '@hookform/resolvers/yup';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface ISaveQuestionBank {
  name: string;
  version: number;
  isOpen?: boolean;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  version: yup.number().typeError('Version must be a number').required('Version is required')
});

const CreateReportsBank: FC<ISaveQuestionBank> = ({ name, version, isOpen }) => {
  const navigate = useNavigate();
  const userRole = useAppSelector(selectUserRole);
  const { confirm, notify } = useAppContext();
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const handleModal = () => {
    setIsModalOpen(!isModalOpen);
    setError('name', { type: 'manual', message: '' }); // Clear name error on modal close
  };
  const [createQuestionnaireBank, { isSuccess, isError, error, isLoading }] =
    questionnaireApi.useCreateQuestionnaireBankMutation();

  const {
    register,
    handleSubmit,
    setError,
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
        message: 'ESG Standard created successfully'
      });
      reset();
      dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: true }));
    } else if (isError && error) {
      console.error('CreateQuestionnaireBank error:', error); // Log full error for debugging
      const errorData = (error as FetchBaseQueryError).data as ErrorData;
      let errorMessage = errorData?.message || MESSAGE.SOMEHING_WENT_WRONG;

      // Check for duplicate name error
      if (
        errorData?.message?.includes('ER_DUP_ENTRY') &&
        errorData.message.includes('Framework.framework_name_unique')
      ) {
        errorMessage = 'The ESG reporting standard with this name already exists. Please enter a unique name.';
        setError('name', { type: 'server', message: errorMessage }); // Set error on name field
      }

      notify({
        type: STATUS.ERROR,
        message: errorMessage
      });
    }
  }, [isSuccess, isError, error, notify, reset, dispatch, setError]);

  useEffect(() => {
    if (isModalOpen) {
      reset({ name, version });
      setError('name', { type: 'manual', message: '' });
    }
  }, [isModalOpen, reset, name, version, setError]);

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
      title: 'Create ESG Standard',
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: async () => {
        const response = await createQuestionnaireBank(data).unwrap();
        const bankId = response?.data?.bank?.id;

        let redirectUrl = '';
        if (userRole === 'manager') {
          redirectUrl = URLS.MANAGER_QUESTION_BANK.replace(':qbankId', bankId);
        } else {
          redirectUrl = URLS.QUESTION_BANK.replace(':qbankId', bankId);
        }
        handleModal();
        navigate(redirectUrl, { replace: true });
      }
    });
  };

  return (
    <>
      <Button
        fontSize={'0.9em'}
        fontWeight={700}
        w="auto"
        h="44px"
        leftIcon={<Icon as={MdOutlineAdd} fontSize={'20px'} />}
        bg="#137E59"
        onClick={handleModal}
        _hover={{
          opacity: 0.8
        }}
        isDisabled={userRole === 'manager'}
      >
        Add Reporting Standards
      </Button>
      <Drawer isOpen={isModalOpen} placement="right" onClose={handleModal}>
        <DrawerOverlay />
        <form onSubmit={handleSubmit(onSubmit)}>
          <DrawerContent maxW="474px" w="100%">
            <DrawerHeader
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bg="#FFF"
              borderBottom="1px solid #D9D9D9"
              fontSize="18px"
              fontWeight="600"
            >
              Create ESG Standard
              <DrawerCloseButton position={'static'} />
            </DrawerHeader>
            <DrawerBody bgColor="#FFF">
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
            </DrawerBody>
            <DrawerFooter bgColor="#FAFAFA" borderTop="1px solid #D9D9D9">
              <HStack gap="20px">
                <Button mt={4} variant="outline" type="submit" onClick={handleModal}>
                  Cancel
                </Button>
                <Button mt={4} bg={'primary'} isLoading={isLoading} type="submit">
                  Save
                </Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </form>
      </Drawer>
    </>
  );
};

export default CreateReportsBank;
