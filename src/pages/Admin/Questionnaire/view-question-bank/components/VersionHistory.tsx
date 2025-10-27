import { FC, useState } from 'react';
import { PiClockClockwiseLight } from 'react-icons/pi';
import { Button, Icon, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay } from '@chakra-ui/react';

import { Table } from '@/components';
import { questionVersionsColums } from '@/constants/coloumns/questionVersionsColums';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';

import CustomModalHeader from '../../../../../components/CustomModalHeader/CustomModalHeader';

interface IVersionHistory {
  questionId?: number;
}

const VersionHistory: FC<IVersionHistory> = ({ questionId }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const handleModal = () => setIsModalOpen(!isModalOpen);

  //TODO: need to make optimization and trigger only when question is updated
  const [trigger, { data: { data: questions = [] } = {}, isLoading, isFetching }] =
    questionnaireApi.useLazyGetQuestionHistoryQuery();
    const columns = questionVersionsColums({ data: questions, companySelected: null, userRole: undefined });

  return (
    <>
      <Button
        ml="auto"
        fontSize={'0.9em'}
        variant="outline"
        fontWeight={700}
        w="auto"
        onClick={() => {
          handleModal();
          trigger(questionId);
        }}
        h="44px"
        leftIcon={<Icon as={PiClockClockwiseLight} fontSize={'20px'} />}
        _hover={{
          opacity: 0.8
        }}
      >
        Version History
      </Button>
      <Modal isOpen={isModalOpen} onClose={handleModal} isCentered>
        <ModalOverlay />
        <ModalContent bgColor="#FFF" maxW="704px" w="100%" maxH="653px" h="100%" borderRadius={'16px'}>
          <CustomModalHeader title="Version History" />
          <ModalBody bgColor="#FFF" pt="26px" px="28px">
            <Table
              loading={isLoading || isFetching}
              columns={columns}
              dataSource={questions}
              bg={'white'}
              maxH={'365px'}
              overflowY={'auto'}
              TableContainerMinHeight={'260px'}
              rowSelections={undefined}
            />
          </ModalBody>
          <ModalFooter bgColor="#FAFAFA" borderTop="1px solid var(--day-5, #D9D9D9)">
            <Button variant="ghost" mr={3} onClick={handleModal}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleModal}>
              Okay
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default VersionHistory;
