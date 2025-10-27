import { FC, useEffect, useRef, useState } from 'react';
import { MdOutlineAdd } from 'react-icons/md';
import { Button, Icon, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay } from '@chakra-ui/react';

import TwoLevelApprovalForm from '@/components/Forms/TwoLevelApprovalForm/TwoLevelApprovalForm';
import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { ErrorData } from '@/types/common';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import CustomModalHeader from '../../../components/CustomModalHeader/CustomModalHeader';

export interface companyFormMethods {
  submitForm: (callback: (data: any) => Promise<void>) => void;
}

interface ITwoLevelApproval {
  companiesIds?: Array<number>;
}

const TwoLevelApproval: FC<ITwoLevelApproval> = ({ companiesIds = [] }) => {
  const { notify, confirm } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const twoLevelApprovalFormRef = useRef<companyFormMethods | null>(null);
  const handleModal = () => setIsModalOpen(!isModalOpen);

  const [updateQuestionnaireReview, { isError, error, isSuccess, isLoading }] =
    questionnaireApi.useUpdateQuestionnaireReviewMutation();

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: MESSAGE.TWO_LEVEL_APPROVE_UPDATE_SUCCESS
      });
    } else if (isError) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.CREATE_USER_FAIL
      });
    }
  }, [error, isError, isSuccess, notify]);

  const handleSubmit = async (formData: any) => {
    return await updateQuestionnaireReview(formData);
  };

  const handleSaveClick = () => {
    if (twoLevelApprovalFormRef?.current) {
      twoLevelApprovalFormRef.current.submitForm(async (formData: any) => {
        confirm({
          title: 'Confirm Two Level Approval',
          type: STATUS.APPROVED,
          message: 'Please confirm',
          onOk: async () => {
            try {
              const isSuccess = await handleSubmit(formData);

              //@ts-ignore
              if (!isSuccess?.error?.error) {
                handleModal();
                //@ts-ignore
                twoLevelApprovalFormRef?.current?.resetForm();
              }
            } catch (error) {
              console.error(error);
            }
          }
        });
      });
    }
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
      >
        Two level approval
      </Button>
      <Modal isOpen={isModalOpen} onClose={handleModal} isCentered>
        <ModalOverlay />
        <ModalContent bgColor="#FFF" maxW="704px" w="100%" maxH="300px" h="100%" borderRadius={'16px'}>
          <CustomModalHeader title="Two level approval" />
          <ModalBody bgColor="#FFF">
            <TwoLevelApprovalForm
              key="two-level-approval-form"
              ref={twoLevelApprovalFormRef}
              companies={companiesIds}
              onSubmit={handleSubmit}
            />
          </ModalBody>
          <ModalFooter bgColor="#FAFAFA" borderTop="1px solid var(--day-5, #D9D9D9)" borderRadius={'0px 0px 16px 16px'}>
            <Button variant="ghost" mr={3} onClick={handleModal}>
              Cancel
            </Button>
            <Button isLoading={isLoading} onClick={handleSaveClick}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TwoLevelApproval;
