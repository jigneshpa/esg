import { FC, useState } from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalBodyProps,
  ModalCloseButton,
  ModalContent,
  ModalContentProps,
  ModalFooter,
  ModalFooterProps,
  ModalHeader,
  ModalHeaderProps,
  ModalOverlay,
  ModalProps,
  Text
} from '@chakra-ui/react';

import { OnlylogoGreen } from '@/assets/index';

import { STATUS } from '../../constants';

export interface ConfirmProps {
  message?: string;
  title?: string;
  type?: STATUS | null | undefined;
  isOpen: boolean;
  onClose: () => void | Promise<void> | null;
  onOk: () => void | Promise<void> | null; // Ensure onOk can handle async
  okBtnLabel?: string;
  cancelBtnLabel?: string;
  hideCancelButton?: boolean;
  hideOkButton?: boolean;
  hideHeader?: boolean;
  customHeader?: React.ReactNode;
  customFooter?: React.ReactNode;
  customBody?: React.ReactNode;
  icon?: string;
  headerIcon?: React.ReactNode;
  modalProps?: ModalProps;
  modalContentProps?: ModalContentProps;
  modalHeaderProps?: ModalHeaderProps;
  modalBodyProps?: ModalBodyProps;
  modalFooterProps?: ModalFooterProps;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  justifyContent?: string;
  headerAlignItems?: string;
  headerGap?: number | string;
}

const Confirm: FC<ConfirmProps> = ({
  message,
  title,
  type,
  isOpen,
  onClose = () => {},
  onOk = () => {},
  okBtnLabel,
  cancelBtnLabel,
  hideCancelButton,
  hideOkButton,
  hideHeader,
  customHeader,
  customFooter,
  customBody,
  icon,
  headerIcon,
  modalProps,
  modalContentProps,
  modalHeaderProps,
  modalBodyProps,
  modalFooterProps,
  okButtonProps,
  cancelButtonProps,
  justifyContent,
  headerAlignItems,
  headerGap
}) => {
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleOk = async () => {
    setIsLoading(true); // Set loading state to true
    try {
      await onOk(); // Call onOk and wait for it to complete
      onClose(); // Close modal only after onOk completes
    } catch (error) {
      console.error('Error during onOk:', error);
      // Optionally handle error (e.g., show error message)
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered {...modalProps}>
      <ModalOverlay />

      <ModalContent bgColor="#fff" maxW={'504px'} w="100%" borderRadius="16px" {...modalContentProps}>
        {!hideHeader && (
          <ModalHeader p={4} borderBottom={message ? '1px solid' : 'none'} borderColor="gray.200" {...modalHeaderProps}>
            {customHeader ? (
              customHeader
            ) : (
              <Flex display={'flex'} alignItems={'center'} justifyContent="space-between" gap={headerGap || 2}>
                <Flex alignItems={headerAlignItems || 'center'} justifyContent="flex-start" gap={headerGap || 2}>
                  {headerIcon ? headerIcon : <Image src={icon || OnlylogoGreen} width={'30px'} height={'30px'} />}
                  <Text fontSize="lg" fontWeight="400">
                    {title || 'Delete'}
                  </Text>
                </Flex>
                <ModalCloseButton position={'static'} />
              </Flex>
            )}
          </ModalHeader>
        )}
        {customBody ? (
          <ModalBody {...modalBodyProps}>{customBody}</ModalBody>
        ) : message && message !== 'Please confirm' ? (
          <ModalBody {...modalBodyProps}>
            <Box paddingTop={4} paddingBottom={4} textAlign="left">
              {message}
            </Box>
          </ModalBody>
        ) : null}
        {customFooter ? (
          <ModalFooter borderRadius="0px 0px 16px 16px" {...modalFooterProps}>
            {customFooter}
          </ModalFooter>
        ) : (
          <ModalFooter borderRadius="0px 0px 16px 16px" {...modalFooterProps}>
            <Flex w="100%" justifyContent={justifyContent || 'center'} gap="50px">
              {!hideCancelButton && (
                <Button
                  bgColor="#fff"
                  color="#254000"
                  border="1px solid #254000"
                  _hover={{
                    bgColor: 'gray.200',
                    color: 'gray.600',
                    borderColor: 'gray.400'
                  }}
                  onClick={onClose}
                  isDisabled={isLoading} // Disable Cancel button during loading
                  {...cancelButtonProps}
                >
                  {cancelBtnLabel || 'Cancel'}
                </Button>
              )}
              {!hideOkButton && (
                <Button
                  bgColor={type === STATUS.APPROVED || type === STATUS.DOWNLOAD ? 'primary' : '#CF1322'}
                  color="white"
                  _hover={{
                    opacity: 0.85,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={handleOk}
                  isLoading={isLoading} // Show loading spinner on button
                  isDisabled={isLoading} // Disable button during loading
                  {...okButtonProps}
                >
                  {okBtnLabel || 'Confirm'}
                </Button>
              )}
            </Flex>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default Confirm;
