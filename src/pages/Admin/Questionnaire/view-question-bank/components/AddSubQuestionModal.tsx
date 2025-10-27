import { useRef, useState } from 'react';
import { MdOutlineAdd } from 'react-icons/md';
import { Button, Icon, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay } from '@chakra-ui/react';

import { CustomTabs } from '@/components';
import useUploadQuestionnaire from '@/hooks/useUploadQuestionnaire';

import CustomModalHeader from '../../../../../components/CustomModalHeader/CustomModalHeader';
import AddAttributesForm from './AddAttributesForm';
import AddQuestionContainer from './AddQuestionContainer';

const AddSubQuestionModal = ({ parentId = null }: { parentId: any }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const handleModal = () => setIsModalOpen(!isModalOpen);

  const { isUploading } = useUploadQuestionnaire(handleModal);
  const addQuestionContainerRef = useRef<any>();

  const handleSaveQuestions = () => {
    if (addQuestionContainerRef.current) {
      addQuestionContainerRef.current?.submitAll();
    }
  };

  const [activeTab, setActiveTab] = useState<number>(0);
  const tabTitles = ['Add Sub Question', 'Add Attributes'];
  const tabContents = [
    <AddQuestionContainer parentId={parentId} ref={addQuestionContainerRef} handleModal={handleModal} key={1} />,
    <AddAttributesForm standardType="institution" key={3} />
  ];

  const renderButton = () => {
    switch (activeTab) {
      case 0:
        return <Button onClick={handleSaveQuestions}>Save</Button>;
      default:
        return null;
    }
  };

  return (
    <>
      <Button
        fontSize={'0.9em'}
        fontWeight={700}
        w="auto"
        h="44px"
        isLoading={isUploading}
        leftIcon={<Icon as={MdOutlineAdd} fontSize={'20px'} />}
        bg="#137E59"
        onClick={handleModal}
        _hover={{
          opacity: 0.8
        }}
      >
        Add Sub Question/s
      </Button>
      <Modal isOpen={isModalOpen} onClose={handleModal} isCentered>
        <ModalOverlay />
        <ModalContent bgColor="#FFF" maxW="704px" w="100%" maxH="653px" h="auto" borderRadius={'16px'}>
          <CustomModalHeader title="Add New Sub Question" />
          <ModalBody bgColor="#FFF">
            <CustomTabs
              title={tabTitles}
              content={tabContents}
              activeIndex={activeTab}
              onChange={(index: number) => setActiveTab(index)}
            />
          </ModalBody>
          <ModalFooter bgColor="#FAFAFA" borderTop="1px solid #D9D9D9">
            <Button variant="outline" mr={3} onClick={handleModal}>
              Close
            </Button>
            <>{renderButton()}</>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddSubQuestionModal;
