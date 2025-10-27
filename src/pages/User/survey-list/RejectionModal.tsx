import { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  Textarea
} from '@chakra-ui/react';
import * as yup from 'yup';

import { yupResolver } from '@hookform/resolvers/yup';

import { HeadingText } from '../../../components';
import CustomModalHeader from '../../../components/CustomModalHeader/CustomModalHeader';

interface IReviewStatusModal {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const RejectionModal: FC<IReviewStatusModal> = ({ isOpen, onClose, onSubmit }) => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      remarks: ''
    },
    resolver: yupResolver(
      yup.object().shape({
        remarks: yup.string().required('Remarks are required')
      })
    )
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bgColor="#FFF" w="474px" borderRadius={'16px'}>
        <CustomModalHeader title="Confirmation" />
        <ModalBody>
          <HeadingText my="19px" maxW="280px" textAlign="center" mx="auto">
            Are you sure, you want to reject?
          </HeadingText>
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => <Textarea placeholder="Add remarks" {...field} />}
          />
          {errors.remarks && <Text color="red">{errors.remarks.message}</Text>}
        </ModalBody>
        <ModalFooter>
          <HStack justify="center" w="100%">
            <Button w="100px" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button w="100px" onClick={handleSubmit(onSubmit)}>
              Yes
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RejectionModal;
